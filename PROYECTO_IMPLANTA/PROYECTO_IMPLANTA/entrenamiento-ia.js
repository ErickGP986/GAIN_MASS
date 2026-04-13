/**
 * Pose en vivo con MoveNet (TensorFlow.js) + feedback por ejercicio.
 * detenerCamara() detiene tracks, cancela el loop y limpia el canvas.
 */
let usuarioEsPremium = false;

let detector = null;
let streamActivo = null;
let loopId = null;
let modeloListo = false;
let ultimoFeedback = "";
let ultimoFeedbackMs = 0;
const FEEDBACK_DEBOUNCE_MS = 700;

/** COCO 17 — por si el modelo no envía `name` en cada punto */
const MOVENET_KEYPOINT_NAMES = [
    "nose",
    "left_eye",
    "right_eye",
    "left_ear",
    "right_ear",
    "left_shoulder",
    "right_shoulder",
    "left_elbow",
    "right_elbow",
    "left_wrist",
    "right_wrist",
    "left_hip",
    "right_hip",
    "left_knee",
    "right_knee",
    "left_ankle",
    "right_ankle",
];

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const r = await fetch("/api/me");
        if (r.ok) {
            const d = await r.json();
            usuarioEsPremium = !!(d.usuario && d.usuario.premium);
            localStorage.setItem("premium", usuarioEsPremium ? "1" : "0");
        }
    } catch (_) {
        usuarioEsPremium = localStorage.getItem("premium") === "1";
    }

    window.addEventListener("resize", sincronizarCanvasTamano);
});

function sincronizarCanvasTamano() {
    const canvas = document.getElementById("canvas-overlay");
    const wrap = document.querySelector(".camera-wrapper");
    if (!canvas || !wrap) return;
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    if (w > 0 && h > 0) {
        canvas.width = w;
        canvas.height = h;
    }
}

function getPoseDetection() {
    if (typeof poseDetection !== "undefined") return poseDetection;
    if (typeof window.poseDetection !== "undefined") return window.poseDetection;
    return null;
}

async function cargarModeloPose() {
    const pd = getPoseDetection();
    if (!pd) {
        throw new Error("pose-detection no disponible");
    }
    await tf.ready();
    try {
        await tf.setBackend("webgl");
    } catch (_) {
        await tf.setBackend("cpu");
    }
    await tf.ready();

    if (detector) {
        await detector.dispose();
        detector = null;
    }

    detector = await pd.createDetector(pd.SupportedModels.MoveNet, {
        modelType: pd.movenet.modelType.SINGLEPOSE_LIGHTNING,
        enableSmoothing: true,
    });
    modeloListo = true;
}

function anguloTresPuntos(a, b, c) {
    if (!a || !b || !c) return null;
    const rad =
        Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let deg = (rad * 180) / Math.PI;
    deg = Math.abs(deg);
    if (deg > 180) deg = 360 - deg;
    return deg;
}

function mapaKeypoints(keypoints) {
    const m = {};
    (keypoints || []).forEach((k, i) => {
        if (!k) return;
        const nombre = k.name || MOVENET_KEYPOINT_NAMES[i];
        if (nombre) m[nombre] = k;
    });
    return m;
}

function promedioScore(keypoints) {
    if (!keypoints || !keypoints.length) return 0;
    let s = 0;
    keypoints.forEach((k) => {
        s += k.score != null ? k.score : 0;
    });
    return s / keypoints.length;
}

function escalarAXCanvas(xVideo, video, canvas) {
    if (!video.videoWidth) return 0;
    return (xVideo / video.videoWidth) * canvas.width;
}

function escalarAYCanvas(yVideo, video, canvas) {
    if (!video.videoHeight) return 0;
    return (yVideo / video.videoHeight) * canvas.height;
}

function xEspejo(xCanvas) {
    const canvas = document.getElementById("canvas-overlay");
    if (!canvas) return xCanvas;
    return canvas.width - xCanvas;
}

function dibujarEsqueleto(keypoints, video, ctx) {
    const canvas = ctx.canvas;
    const m = mapaKeypoints(keypoints);
    const umbral = 0.25;

    const linea = (na, nb) => {
        const a = m[na];
        const b = m[nb];
        if (!a || !b) return;
        if ((a.score || 0) < umbral || (b.score || 0) < umbral) return;
        const ax = xEspejo(escalarAXCanvas(a.x, video, canvas));
        const ay = escalarAYCanvas(a.y, video, canvas);
        const bx = xEspejo(escalarAXCanvas(b.x, video, canvas));
        const by = escalarAYCanvas(b.y, video, canvas);
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.strokeStyle = "rgba(0, 255, 156, 0.85)";
        ctx.lineWidth = 3;
        ctx.stroke();
    };

    const pares = [
        ["left_shoulder", "right_shoulder"],
        ["left_shoulder", "left_elbow"],
        ["left_elbow", "left_wrist"],
        ["right_shoulder", "right_elbow"],
        ["right_elbow", "right_wrist"],
        ["left_shoulder", "left_hip"],
        ["right_shoulder", "right_hip"],
        ["left_hip", "right_hip"],
        ["left_hip", "left_knee"],
        ["left_knee", "left_ankle"],
        ["right_hip", "right_knee"],
        ["right_knee", "right_ankle"],
    ];

    pares.forEach(([a, b]) => linea(a, b));

    Object.keys(m).forEach((nombre) => {
        const k = m[nombre];
        if ((k.score || 0) < umbral) return;
        const px = xEspejo(escalarAXCanvas(k.x, video, canvas));
        const py = escalarAYCanvas(k.y, video, canvas);
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#00b7ff";
        ctx.fill();
    });
}

function feedbackEjercicio(ejId, m, scoreProm) {
    if (scoreProm < 0.2) {
        return "Colócate de frente a la cámara y aleja un poco para verse cuerpo completo.";
    }

    if (ejId === "general") {
        return "Postura detectada. Ajusta el encuadre para ver piernas y torso.";
    }

    if (ejId === "plancha") {
        const ls = m["left_shoulder"];
        const lh = m["left_hip"];
        const lk = m["left_knee"];
        const rs = m["right_shoulder"];
        const rh = m["right_hip"];
        const rk = m["right_knee"];
        let angIz = null;
        let angDer = null;
        if (ls && lh && lk) angIz = anguloTresPuntos(ls, lh, lk);
        if (rs && rh && rk) angDer = anguloTresPuntos(rs, rh, rk);
        const candidatos = [angIz, angDer].filter((x) => x != null);
        if (!candidatos.length) {
            return "Intenta mostrar perfil o 3/4: hombros, cadera y rodilla visibles.";
        }
        const ang = Math.min(...candidatos);
        if (ang < 155) {
            return "Cadera abajo: evita hundir la zona lumbar (alinea torso y piernas).";
        }
        if (ang > 200) {
            return "No levantes demasiado el glúteo; busca una línea más recta.";
        }
        return "Buena alineación de torso. Mantén el core activo y respira.";
    }

    if (ejId === "sentadilla") {
        const lh = m["left_hip"];
        const lk = m["left_knee"];
        const la = m["left_ankle"];
        const rh = m["right_hip"];
        const rk = m["right_knee"];
        const ra = m["right_ankle"];
        let aL = null;
        let aR = null;
        if (lh && lk && la) aL = anguloTresPuntos(lh, lk, la);
        if (rh && rk && ra) aR = anguloTresPuntos(rh, rk, ra);
        const vals = [aL, aR].filter((x) => x != null);
        if (!vals.length) {
            return "Retrocede un paso: necesitamos ver rodillas y tobillos.";
        }
        const minA = Math.min(...vals);
        if (minA > 140) {
            return "Baja más: flexiona rodillas y lleva cadera hacia atrás.";
        }
        if (minA >= 70 && minA <= 130) {
            return "Buen rango de sentadilla. Espalda neutra y peso en los talones.";
        }
        if (minA < 55) {
            return "No bajes de más si pierdes la espalda neutra; sube un poco.";
        }
        return "Sigue bajando controlando rodillas y alineación.";
    }

    return "Sigue el ritmo y mantén la técnica.";
}

function aplicarFeedback(texto) {
    const now = Date.now();
    if (
        texto === ultimoFeedback &&
        now - ultimoFeedbackMs < FEEDBACK_DEBOUNCE_MS * 3
    ) {
        return;
    }
    if (texto !== ultimoFeedback && now - ultimoFeedbackMs < FEEDBACK_DEBOUNCE_MS) {
        return;
    }
    ultimoFeedback = texto;
    ultimoFeedbackMs = now;
    const el = document.getElementById("feedback-ia");
    if (el) el.textContent = texto;
}

function actualizarEstadoIA(texto) {
    const st = document.querySelector(".ia-status .status-text");
    if (st) st.textContent = texto;
}

async function bucleDeteccion() {
    const video = document.getElementById("webcam");
    const canvas = document.getElementById("canvas-overlay");
    if (!video || !canvas || !streamActivo || !detector) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (!video.videoWidth) {
        if (streamActivo) loopId = requestAnimationFrame(bucleDeteccion);
        return;
    }

    sincronizarCanvasTamano();

    try {
        const poses = await detector.estimatePoses(video);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const ejSelect = document.getElementById("ejercicio-ia");
        const ejId = ejSelect ? ejSelect.value : "general";

        if (poses && poses[0] && poses[0].keypoints) {
            const kp = poses[0].keypoints;
            dibujarEsqueleto(kp, video, ctx);
            const score = promedioScore(kp);
            const msg = feedbackEjercicio(ejId, mapaKeypoints(kp), score);
            aplicarFeedback(msg);
            actualizarEstadoIA("IA: postura detectada");
        } else {
            aplicarFeedback(
                "No se detecta una persona. Mejora la luz y el encuadre."
            );
            actualizarEstadoIA("IA: buscando cuerpo…");
        }
    } catch (e) {
        console.error(e);
        actualizarEstadoIA("IA: error de frame");
    }

    if (streamActivo) {
        loopId = requestAnimationFrame(bucleDeteccion);
    }
}

async function iniciarCamara() {
    if (!usuarioEsPremium) {
        alert(
            "Esta rutina con cámara requiere GAIN MASS PREMIUM.\n\nInicia sesión con una cuenta premium o visita la sección Premium."
        );
        return;
    }

    const video = document.getElementById("webcam");
    const btnOn = document.getElementById("btn-cam-encender");
    const btnOff = document.getElementById("btn-cam-detener");

    if (streamActivo) {
        return;
    }

    actualizarEstadoIA("IA: cargando modelo…");
    if (btnOn) btnOn.disabled = true;

    try {
        if (!modeloListo) {
            await cargarModeloPose();
        }
    } catch (err) {
        console.error(err);
        alert(
            "No se pudo cargar el modelo de pose. Revisa tu conexión e intenta de nuevo."
        );
        actualizarEstadoIA("IA: modelo no disponible");
        if (btnOn) btnOn.disabled = false;
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "user",
                width: { ideal: 640, max: 1280 },
                height: { ideal: 480, max: 720 },
                frameRate: { ideal: 24, max: 30 },
            },
            audio: false,
        });
        streamActivo = stream;
        video.srcObject = stream;
        video.muted = true;
        await video.play();

        if (btnOff) btnOff.disabled = false;
        if (btnOn) btnOn.disabled = true;

        ultimoFeedback = "";
        aplicarFeedback(
            "Cámara lista. Elige el ejercicio y sigue las indicaciones."
        );
        actualizarEstadoIA("IA: analizando…");

        loopId = requestAnimationFrame(bucleDeteccion);
    } catch (err) {
        console.error(err);
        alert(
            "No se pudo acceder a la cámara. Comprueba permisos y que no esté en uso."
        );
        actualizarEstadoIA("IA: cámara no disponible");
        if (btnOn) btnOn.disabled = false;
    }
}

function detenerCamara() {
    const video = document.getElementById("webcam");
    const canvas = document.getElementById("canvas-overlay");
    const btnOn = document.getElementById("btn-cam-encender");
    const btnOff = document.getElementById("btn-cam-detener");

    if (loopId != null) {
        cancelAnimationFrame(loopId);
        loopId = null;
    }

    if (video && video.srcObject) {
        const tracks = video.srcObject.getTracks();
        tracks.forEach((t) => t.stop());
        video.srcObject = null;
    }
    streamActivo = null;

    if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    if (btnOff) btnOff.disabled = true;
    if (btnOn) btnOn.disabled = false;

    actualizarEstadoIA("IA: en espera");
    const el = document.getElementById("feedback-ia");
    if (el) {
        el.textContent =
            "Pulsa «Encender cámara» para iniciar la detección de postura.";
    }
}

window.iniciarCamara = iniciarCamara;
window.detenerCamara = detenerCamara;
