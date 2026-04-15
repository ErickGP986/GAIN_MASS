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
const EMA_ALPHA = 0.2;
const ANGLE_HISTORY_SIZE = 8;
const RUTINA_A_EJERCICIO = {
    pecho: "plancha",
    pierna: "sentadilla",
    fullbody: "sentadilla",
    cardio: "general",
};

let rutinaSolicitada = "general";
let ejercicioActual = "general";
let framesAExcluir = 0;
let indiceFrame = 0;
let inferenciaEmaMs = 0;

const historialAngulos = {
    plancha: [],
    sentadilla: [],
};

const repTracker = {
    reps: 0,
    sentadillaEstado: "arriba",
    ultimoRepMs: 0,
    planchaInicioOkMs: null,
    planchaBloqueContado: false,
};

const LS_IA_CAM_PREF = "gainmass_ia_cam_device";
let iaCamDeviceId = null;
let iaCamFacingMode = "user";
let iaVideoInputs = [];
let iaVideoInputIndex = 0;

function cargarPreferenciaCamaraIA() {
    try {
        const raw = localStorage.getItem(LS_IA_CAM_PREF);
        iaCamDeviceId = raw && raw.length ? raw : null;
    } catch {
        iaCamDeviceId = null;
    }
}

function guardarPreferenciaCamaraIA(id) {
    if (!id) return;
    iaCamDeviceId = id;
    try {
        localStorage.setItem(LS_IA_CAM_PREF, id);
    } catch {}
}

async function enumerarCamarasVideoIA() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        iaVideoInputs = [];
        return;
    }
    const list = await navigator.mediaDevices.enumerateDevices();
    iaVideoInputs = list.filter((d) => d.kind === "videoinput");
    if (iaCamDeviceId) {
        const idx = iaVideoInputs.findIndex((d) => d.deviceId === iaCamDeviceId);
        iaVideoInputIndex = idx >= 0 ? idx : 0;
    } else {
        iaVideoInputIndex = 0;
    }
}

function mensajeErrorCamaraIA(err) {
    const name = err && err.name ? err.name : "";
    if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        return "Cámara bloqueada: permite el permiso en la barra del navegador. En móvil, revisa también permisos del sitio en Ajustes.";
    }
    if (name === "NotFoundError" || name === "DevicesNotFoundError") {
        return "No hay cámara disponible o no se detectó ningún dispositivo.";
    }
    if (name === "NotReadableError" || name === "TrackStartError") {
        return "La cámara está en uso por otra app o pestaña. Ciérrala e inténtalo de nuevo.";
    }
    if (name === "OverconstrainedError") {
        return "Esta cámara no acepta la configuración pedida. Prueba otra en la lista desplegable.";
    }
    if (
        typeof location !== "undefined" &&
        location.protocol !== "https:" &&
        location.hostname !== "localhost" &&
        location.hostname !== "127.0.0.1"
    ) {
        return "La cámara suele requerir HTTPS o abrir el sitio desde localhost.";
    }
    return "No se pudo usar la cámara. Comprueba permisos y que el dispositivo esté libre.";
}

let iaCamSelectSuppress = false;

function textoEtiquetaCamaraIA(d, i) {
    const lab = (d.label || "").trim();
    if (lab) return lab;
    return `Cámara ${i + 1}`;
}

function obtenerDeviceIdVideoActivo(videoEl) {
    if (!videoEl || !videoEl.srcObject) return null;
    const tracks = videoEl.srcObject.getVideoTracks();
    if (!tracks.length) return null;
    const s = tracks[0].getSettings ? tracks[0].getSettings() : {};
    return s.deviceId || null;
}

function actualizarSelectCamaraIA() {
    const sel = document.getElementById("select-cam-ia");
    if (!sel) return;
    iaCamSelectSuppress = true;
    try {
        sel.innerHTML = "";
        if (!iaVideoInputs.length) {
            const o = document.createElement("option");
            o.value = "";
            o.textContent = "Permite la cámara para ver dispositivos";
            sel.appendChild(o);
            sel.disabled = true;
            return;
        }
        iaVideoInputs.forEach((d, i) => {
            if (!d.deviceId) return;
            const o = document.createElement("option");
            o.value = d.deviceId;
            o.textContent = textoEtiquetaCamaraIA(d, i);
            sel.appendChild(o);
        });
        if (!sel.options.length) {
            const o = document.createElement("option");
            o.value = "";
            o.textContent = "Dispositivo sin identificar — usa «Cambiar cámara»";
            sel.appendChild(o);
            sel.disabled = true;
            return;
        }
        sel.disabled = !streamActivo;
        const cur = obtenerDeviceIdVideoActivo(document.getElementById("webcam"));
        if (cur && [...sel.options].some((op) => op.value === cur)) {
            sel.value = cur;
        } else if (
            iaCamDeviceId &&
            [...sel.options].some((op) => op.value === iaCamDeviceId)
        ) {
            sel.value = iaCamDeviceId;
        } else {
            sel.selectedIndex = Math.min(
                iaVideoInputIndex,
                sel.options.length - 1
            );
        }
    } finally {
        iaCamSelectSuppress = false;
    }
}

function resetSelectCamaraIAInactivo() {
    const sel = document.getElementById("select-cam-ia");
    if (!sel) return;
    iaCamSelectSuppress = true;
    try {
        sel.innerHTML = "";
        const o = document.createElement("option");
        o.value = "";
        o.textContent = "Enciende la cámara para listar dispositivos";
        sel.appendChild(o);
        sel.disabled = true;
    } finally {
        iaCamSelectSuppress = false;
    }
}

async function aplicarCamaraIASeleccionada() {
    if (iaCamSelectSuppress || !streamActivo || !usuarioEsPremium) return;
    const sel = document.getElementById("select-cam-ia");
    if (!sel) return;
    const id = sel.value;
    if (!id) return;
    const video = document.getElementById("webcam");
    const cur = obtenerDeviceIdVideoActivo(video);
    if (id === cur) return;

    if (loopId != null) {
        cancelAnimationFrame(loopId);
        loopId = null;
    }
    if (streamActivo) {
        streamActivo.getTracks().forEach((t) => t.stop());
        streamActivo = null;
    }

    iaCamDeviceId = id;
    guardarPreferenciaCamaraIA(id);
    iaVideoInputIndex = Math.max(
        0,
        iaVideoInputs.findIndex((d) => d.deviceId === id)
    );

    try {
        const stream = await abrirStreamEntrenamientoIA();
        streamActivo = stream;
        if (video) {
            video.srcObject = stream;
            await video.play();
        }
        const nom = iaVideoInputs[iaVideoInputIndex];
        actualizarEstadoIA(
            nom
                ? `IA: ${textoEtiquetaCamaraIA(nom, iaVideoInputIndex)}`
                : "IA: analizando…"
        );
        actualizarSelectCamaraIA();
        loopId = requestAnimationFrame(bucleDeteccion);
    } catch (e) {
        console.error(e);
        detenerCamara();
        alert(mensajeErrorCamaraIA(e));
    }
}

function construirConstraintsVideoIAPrimario() {
    if (iaCamDeviceId) {
        return {
            deviceId: { exact: iaCamDeviceId },
            width: { ideal: 640, max: 1280 },
            height: { ideal: 480, max: 720 },
            frameRate: { ideal: 24, max: 30 },
        };
    }
    return {
        facingMode: { ideal: iaCamFacingMode },
        width: { ideal: 640, max: 1280 },
        height: { ideal: 480, max: 720 },
        frameRate: { ideal: 24, max: 30 },
    };
}

function construirConstraintsVideoIAFallback() {
    if (iaCamDeviceId) {
        return { deviceId: iaCamDeviceId };
    }
    return { facingMode: iaCamFacingMode };
}

async function abrirStreamEntrenamientoIA() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("getUserMedia no disponible");
    }
    try {
        return await navigator.mediaDevices.getUserMedia({
            video: construirConstraintsVideoIAPrimario(),
            audio: false,
        });
    } catch (e1) {
        try {
            return await navigator.mediaDevices.getUserMedia({
                video: construirConstraintsVideoIAFallback(),
                audio: false,
            });
        } catch (e2) {
            if (iaCamDeviceId) {
                iaCamDeviceId = null;
                try {
                    localStorage.removeItem(LS_IA_CAM_PREF);
                } catch {}
                try {
                    return await navigator.mediaDevices.getUserMedia({
                        video: { facingMode: iaCamFacingMode },
                        audio: false,
                    });
                } catch (e3) {
                    const otro =
                        iaCamFacingMode === "environment" ? "user" : "environment";
                    return await navigator.mediaDevices.getUserMedia({
                        video: { facingMode: otro },
                        audio: false,
                    });
                }
            }
            const otro =
                iaCamFacingMode === "environment" ? "user" : "environment";
            return await navigator.mediaDevices.getUserMedia({
                video: { facingMode: otro },
                audio: false,
            });
        }
    }
}

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
    cargarPreferenciaCamaraIA();
    iaCamFacingMode = "user";

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

    configurarRutinaDesdeQuery();
    configurarSelectorEjercicio();
    const selCamIA = document.getElementById("select-cam-ia");
    if (selCamIA) {
        selCamIA.addEventListener("change", () => {
            aplicarCamaraIASeleccionada();
        });
    }
    reiniciarMetricasEjercicio(getEjercicioSeleccionado());
    actualizarContadorRepsUI();
    actualizarCalidadDeteccion("warn", "Calidad: media");

    window.addEventListener("resize", sincronizarCanvasTamano);
});

function getEjercicioSeleccionado() {
    const ejSelect = document.getElementById("ejercicio-ia");
    return ejSelect ? ejSelect.value : "general";
}

function nombreLegibleEjercicio(ejId) {
    if (ejId === "plancha") return "Plancha / puente";
    if (ejId === "sentadilla") return "Sentadilla";
    return "General";
}

function configurarRutinaDesdeQuery() {
    const p = new URLSearchParams(window.location.search || "");
    const rutina = String(p.get("rutina") || "")
        .trim()
        .toLowerCase();
    if (!rutina) return;

    rutinaSolicitada = rutina;
    const recomendado = RUTINA_A_EJERCICIO[rutina] || "general";
    const ejSelect = document.getElementById("ejercicio-ia");
    if (ejSelect) ejSelect.value = recomendado;

    aplicarFeedback(
        `Rutina detectada: ${rutina}. Modo recomendado: ${nombreLegibleEjercicio(
            recomendado
        )}.`
    );
}

function configurarSelectorEjercicio() {
    const ejSelect = document.getElementById("ejercicio-ia");
    if (!ejSelect) return;

    ejSelect.addEventListener("change", () => {
        reiniciarMetricasEjercicio(ejSelect.value);
        aplicarFeedback(
            `Ejercicio configurado en ${nombreLegibleEjercicio(
                ejSelect.value
            )}. Mantén técnica y ritmo controlado.`
        );
    });
}

function actualizarContadorRepsUI() {
    const el = document.getElementById("contador-reps");
    if (el) el.textContent = String(repTracker.reps);
}

function reiniciarMetricasEjercicio(ejId) {
    ejercicioActual = ejId || "general";
    repTracker.reps = 0;
    repTracker.sentadillaEstado = "arriba";
    repTracker.ultimoRepMs = 0;
    repTracker.planchaInicioOkMs = null;
    repTracker.planchaBloqueContado = false;
    historialAngulos.plancha = [];
    historialAngulos.sentadilla = [];
    actualizarContadorRepsUI();
}

function promedioLista(nums) {
    if (!nums.length) return null;
    return nums.reduce((acc, n) => acc + n, 0) / nums.length;
}

function suavizarAngulo(tipo, valor) {
    if (valor == null) return null;
    const hist = historialAngulos[tipo];
    if (!hist) return valor;
    hist.push(valor);
    if (hist.length > ANGLE_HISTORY_SIZE) hist.shift();
    return promedioLista(hist);
}

function anguloPlancha(m) {
    const ls = m["left_shoulder"];
    const lh = m["left_hip"];
    const lk = m["left_knee"];
    const rs = m["right_shoulder"];
    const rh = m["right_hip"];
    const rk = m["right_knee"];
    const angIz = ls && lh && lk ? anguloTresPuntos(ls, lh, lk) : null;
    const angDer = rs && rh && rk ? anguloTresPuntos(rs, rh, rk) : null;
    const vals = [angIz, angDer].filter((x) => x != null);
    return vals.length ? Math.min(...vals) : null;
}

function anguloSentadilla(m) {
    const lh = m["left_hip"];
    const lk = m["left_knee"];
    const la = m["left_ankle"];
    const rh = m["right_hip"];
    const rk = m["right_knee"];
    const ra = m["right_ankle"];
    const aL = lh && lk && la ? anguloTresPuntos(lh, lk, la) : null;
    const aR = rh && rk && ra ? anguloTresPuntos(rh, rk, ra) : null;
    const vals = [aL, aR].filter((x) => x != null);
    return vals.length ? Math.min(...vals) : null;
}

function actualizarCalidadDeteccion(tipo, texto) {
    const badge = document.getElementById("calidad-detector");
    if (!badge) return;
    badge.classList.remove(
        "quality-badge--good",
        "quality-badge--warn",
        "quality-badge--bad"
    );
    badge.classList.add(
        tipo === "good"
            ? "quality-badge--good"
            : tipo === "bad"
            ? "quality-badge--bad"
            : "quality-badge--warn"
    );
    badge.textContent = texto;
}

function evaluarCalidad(scoreProm, m) {
    const claves = [
        "left_shoulder",
        "right_shoulder",
        "left_hip",
        "right_hip",
        "left_knee",
        "right_knee",
        "left_ankle",
        "right_ankle",
    ];
    let visibles = 0;
    claves.forEach((k) => {
        const kp = m[k];
        if (kp && (kp.score || 0) >= 0.35) visibles += 1;
    });

    if (scoreProm >= 0.45 && visibles >= 6) {
        return { tipo: "good", texto: "Calidad: alta" };
    }
    if (scoreProm >= 0.25 && visibles >= 4) {
        return { tipo: "warn", texto: "Calidad: media" };
    }
    return { tipo: "bad", texto: "Calidad: baja" };
}

function actualizarConteoReps(ejId, metricas, scoreProm) {
    const ahora = Date.now();
    if (scoreProm < 0.25) {
        repTracker.planchaInicioOkMs = null;
        repTracker.planchaBloqueContado = false;
        return;
    }

    if (ejId === "sentadilla") {
        const ang = metricas.anguloSentadilla;
        if (ang == null) return;

        if (repTracker.sentadillaEstado === "arriba" && ang <= 108) {
            repTracker.sentadillaEstado = "abajo";
            return;
        }

        if (
            repTracker.sentadillaEstado === "abajo" &&
            ang >= 152 &&
            ahora - repTracker.ultimoRepMs > 700
        ) {
            repTracker.reps += 1;
            repTracker.ultimoRepMs = ahora;
            repTracker.sentadillaEstado = "arriba";
            actualizarContadorRepsUI();
        }
        return;
    }

    if (ejId === "plancha") {
        const ang = metricas.anguloPlancha;
        if (ang == null) return;

        const enZona = ang >= 158 && ang <= 188;
        if (enZona) {
            if (repTracker.planchaInicioOkMs == null) {
                repTracker.planchaInicioOkMs = ahora;
            }
            if (
                !repTracker.planchaBloqueContado &&
                ahora - repTracker.planchaInicioOkMs >= 1800
            ) {
                repTracker.reps += 1;
                repTracker.planchaBloqueContado = true;
                actualizarContadorRepsUI();
            }
            return;
        }

        repTracker.planchaInicioOkMs = null;
        repTracker.planchaBloqueContado = false;
    }
}

function actualizarRendimiento(msInferencia) {
    if (!msInferencia || !Number.isFinite(msInferencia)) return;
    if (!inferenciaEmaMs) inferenciaEmaMs = msInferencia;
    else inferenciaEmaMs = EMA_ALPHA * msInferencia + (1 - EMA_ALPHA) * inferenciaEmaMs;

    if (inferenciaEmaMs > 110) framesAExcluir = 2;
    else if (inferenciaEmaMs > 70) framesAExcluir = 1;
    else framesAExcluir = 0;
}

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

function feedbackEjercicio(ejId, m, scoreProm, metricas) {
    if (scoreProm < 0.2) {
        return "Colócate de frente a la cámara y aleja un poco para verse cuerpo completo.";
    }

    if (ejId === "general") {
        return "Postura detectada. Ajusta el encuadre para ver piernas y torso.";
    }

    if (ejId === "plancha") {
        const ang = metricas.anguloPlancha;
        if (ang == null) {
            return "Intenta mostrar perfil o 3/4: hombros, cadera y rodilla visibles.";
        }
        if (ang < 155) {
            return "Cadera abajo: evita hundir la zona lumbar (alinea torso y piernas).";
        }
        if (ang > 200) {
            return "No levantes demasiado el glúteo; busca una línea más recta.";
        }
        return "Buena alineación de torso. Mantén el core activo y respira.";
    }

    if (ejId === "sentadilla") {
        const minA = metricas.anguloSentadilla;
        if (minA == null) {
            return "Retrocede un paso: necesitamos ver rodillas y tobillos.";
        }
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

    indiceFrame += 1;
    const procesarEsteFrame = indiceFrame % (framesAExcluir + 1) === 0;
    if (!procesarEsteFrame) {
        if (streamActivo) loopId = requestAnimationFrame(bucleDeteccion);
        return;
    }

    sincronizarCanvasTamano();

    try {
        const inicioInferencia = performance.now();
        const poses = await detector.estimatePoses(video);
        const msInferencia = performance.now() - inicioInferencia;
        actualizarRendimiento(msInferencia);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const ejId = getEjercicioSeleccionado();
        if (ejId !== ejercicioActual) reiniciarMetricasEjercicio(ejId);

        if (poses && poses[0] && poses[0].keypoints) {
            const kp = poses[0].keypoints;
            dibujarEsqueleto(kp, video, ctx);
            const score = promedioScore(kp);
            const mapa = mapaKeypoints(kp);
            const metricas = {
                anguloPlancha: suavizarAngulo("plancha", anguloPlancha(mapa)),
                anguloSentadilla: suavizarAngulo("sentadilla", anguloSentadilla(mapa)),
            };
            const calidad = evaluarCalidad(score, mapa);
            actualizarCalidadDeteccion(calidad.tipo, calidad.texto);

            actualizarConteoReps(ejId, metricas, score);
            const msg = feedbackEjercicio(ejId, mapa, score, metricas);
            aplicarFeedback(msg);
            const modo =
                framesAExcluir > 0
                    ? `IA: postura detectada · modo fluido x${framesAExcluir + 1}`
                    : "IA: postura detectada";
            actualizarEstadoIA(modo);
        } else {
            actualizarCalidadDeteccion("bad", "Calidad: baja");
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
    const btnSwap = document.getElementById("btn-cam-cambiar");
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
        const stream = await abrirStreamEntrenamientoIA();
        streamActivo = stream;
        video.srcObject = stream;
        video.muted = true;
        await video.play();
        try {
            await enumerarCamarasVideoIA();
        } catch {
            iaVideoInputs = [];
        }
        actualizarSelectCamaraIA();

        if (btnOff) btnOff.disabled = false;
        if (btnOn) btnOn.disabled = true;
        if (btnSwap) btnSwap.disabled = false;

        reiniciarMetricasEjercicio(getEjercicioSeleccionado());
        indiceFrame = 0;
        inferenciaEmaMs = 0;
        framesAExcluir = 0;
        ultimoFeedback = "";
        aplicarFeedback(
            `Cámara lista. Rutina activa: ${nombreLegibleEjercicio(
                getEjercicioSeleccionado()
            )}.`
        );
        actualizarCalidadDeteccion("warn", "Calidad: media");
        actualizarEstadoIA("IA: analizando…");

        loopId = requestAnimationFrame(bucleDeteccion);
    } catch (err) {
        console.error(err);
        alert(mensajeErrorCamaraIA(err));
        actualizarEstadoIA("IA: cámara no disponible");
        if (btnOn) btnOn.disabled = false;
        const btnSwap2 = document.getElementById("btn-cam-cambiar");
        if (btnSwap2) btnSwap2.disabled = true;
        resetSelectCamaraIAInactivo();
    }
}

async function cambiarCamaraEntrenamiento() {
    if (!streamActivo || !usuarioEsPremium) return;
    try {
        await enumerarCamarasVideoIA();
    } catch {
        iaVideoInputs = [];
    }

    if (iaVideoInputs.length >= 2) {
        iaVideoInputIndex = (iaVideoInputIndex + 1) % iaVideoInputs.length;
        const dev = iaVideoInputs[iaVideoInputIndex];
        iaCamDeviceId = dev.deviceId || null;
        if (iaCamDeviceId) guardarPreferenciaCamaraIA(iaCamDeviceId);
    } else {
        iaCamFacingMode =
            iaCamFacingMode === "environment" ? "user" : "environment";
        iaCamDeviceId = null;
    }

    if (loopId != null) {
        cancelAnimationFrame(loopId);
        loopId = null;
    }
    streamActivo.getTracks().forEach((t) => t.stop());
    streamActivo = null;

    const video = document.getElementById("webcam");
    try {
        const stream = await abrirStreamEntrenamientoIA();
        streamActivo = stream;
        if (video) {
            video.srcObject = stream;
            await video.play();
        }
        actualizarEstadoIA(
            iaVideoInputs.length >= 2
                ? `IA: cámara ${iaVideoInputIndex + 1}/${iaVideoInputs.length}`
                : `IA: cámara (${iaCamFacingMode})`
        );
        actualizarSelectCamaraIA();
        loopId = requestAnimationFrame(bucleDeteccion);
    } catch (e) {
        console.error(e);
        detenerCamara();
        alert(mensajeErrorCamaraIA(e));
    }
}

function detenerCamara() {
    const video = document.getElementById("webcam");
    const canvas = document.getElementById("canvas-overlay");
    const btnOn = document.getElementById("btn-cam-encender");
    const btnSwap = document.getElementById("btn-cam-cambiar");
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
    if (btnSwap) btnSwap.disabled = true;

    resetSelectCamaraIAInactivo();

    framesAExcluir = 0;
    indiceFrame = 0;
    inferenciaEmaMs = 0;
    reiniciarMetricasEjercicio(getEjercicioSeleccionado());
    actualizarCalidadDeteccion("warn", "Calidad: media");
    actualizarEstadoIA("IA: en espera");
    const el = document.getElementById("feedback-ia");
    if (el) {
        el.textContent =
            "Pulsa «Encender cámara» para iniciar la detección de postura.";
    }
}

window.iniciarCamara = iniciarCamara;
window.detenerCamara = detenerCamara;
window.cambiarCamaraEntrenamiento = cambiarCamaraEntrenamiento;
