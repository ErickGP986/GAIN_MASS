/**
 * Cámara + pose (MoveNet) + cambio frontal/trasera.
 * Carga TF desde CDN (ESM).
 */

import * as tf from "https://esm.sh/@tensorflow/tfjs@4.22.0";
import * as poseDetection from "https://esm.sh/@tensorflow-models/pose-detection@2.1.3?deps=@tensorflow/tfjs@4.22.0";

let usuarioEsPremium = false;
let detector = null;
let stream = null;
let facingMode = "user";
let animId = null;
let paused = false;
let frameCount = 0;

const SKELETON_PAIRS = [
  [5, 6],
  [5, 7],
  [7, 9],
  [6, 8],
  [8, 10],
  [5, 11],
  [6, 12],
  [11, 12],
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
];

/** COCO 17 (MoveNet) por si el modelo no trae `name` en cada keypoint */
const COCO17_NAMES = [
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

function getKeypoint(map, name) {
  return map.get(name);
}

function buildKeypointMap(keypoints) {
  const m = new Map();
  keypoints.forEach((kp, i) => {
    const nm = kp.name || COCO17_NAMES[i];
    if (nm) m.set(nm, kp);
  });
  return m;
}

function angleDeg(a, b, c) {
  const ax = a.x - b.x;
  const ay = a.y - b.y;
  const cx = c.x - b.x;
  const cy = c.y - b.y;
  const dot = ax * cx + ay * cy;
  const mag = Math.hypot(ax, ay) * Math.hypot(cx, cy);
  if (mag < 1e-6) return 180;
  let cos = dot / mag;
  cos = Math.max(-1, Math.min(1, cos));
  return (Math.acos(cos) * 180) / Math.PI;
}

function postureHint(keypoints) {
  const map = buildKeypointMap(keypoints);
  const ls = getKeypoint(map, "left_shoulder");
  const rs = getKeypoint(map, "right_shoulder");
  const lh = getKeypoint(map, "left_hip");
  const rh = getKeypoint(map, "right_hip");
  const lk = getKeypoint(map, "left_knee");
  const rk = getKeypoint(map, "right_knee");

  if (!ls || !rs || !lh || !rh) {
    return "Alejate un poco para que se vea torso y cadera.";
  }
  if ((ls.score ?? 1) < 0.25 || (rs.score ?? 1) < 0.25) {
    return "Mejora la luz o el encuadre: poco contraste en hombros.";
  }

  const shoulderMid = { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2 };
  const hipMid = { x: (lh.x + rh.x) / 2, y: (lh.y + rh.y) / 2 };
  const dx = hipMid.x - shoulderMid.x;
  const dy = hipMid.y - shoulderMid.y;
  const tilt = (Math.atan2(dy, dx) * 180) / Math.PI;
  if (Math.abs(tilt) > 18) {
    return "Nivela hombros y cadera (evita inclinar el torso de lado).";
  }

  if (lk && rk) {
    const aL = angleDeg(ls, lh, lk);
    const aR = angleDeg(rs, rh, rk);
    const avg = (aL + aR) / 2;
    if (avg < 115) {
      return "Buen angulo de cadera/rodilla; controla que las rodillas no se cierren.";
    }
    if (avg > 165) {
      return "Baja un poco mas para ganar rango en piernas (sentadilla/control).";
    }
  }

  return "Postura estable. Manten core activo y respira.";
}

function stopStream() {
  if (stream) {
    stream.getTracks().forEach((t) => t.stop());
    stream = null;
  }
}

async function ensureDetector() {
  if (detector) return;
  try {
    await tf.ready();
    try {
      await tf.setBackend("webgl");
    } catch (_) {
      await tf.setBackend("cpu");
    }
    detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        enableSmoothing: true,
      }
    );
  } catch (e) {
    console.error(e);
    alert(
      "No se pudo cargar el modelo de pose. Revisa conexion a internet (descarga TF.js) o prueba en HTTPS."
    );
    throw e;
  }
}

function resizeCanvasToVideo(video, canvas) {
  const w = video.videoWidth || 640;
  const h = video.videoHeight || 480;
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
}

function drawPose(ctx, poses, videoWidth) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  if (!poses.length) return;
  const p = poses[0];
  const kps = p.keypoints;
  const mirror = true;

  const mapX = (kp) => (mirror ? videoWidth - kp.x : kp.x);

  ctx.strokeStyle = "rgba(0, 255, 200, 0.85)";
  ctx.lineWidth = 3;
  for (const [i, j] of SKELETON_PAIRS) {
    const a = kps[i];
    const b = kps[j];
    if (!a || !b) continue;
    if ((a.score ?? 1) < 0.2 || (b.score ?? 1) < 0.2) continue;
    ctx.beginPath();
    ctx.moveTo(mapX(a), a.y);
    ctx.lineTo(mapX(b), b.y);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(255, 122, 0, 0.95)";
  for (const kp of kps) {
    if ((kp.score ?? 1) < 0.2) continue;
    ctx.beginPath();
    ctx.arc(mapX(kp), kp.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

async function loop() {
  const video = document.getElementById("webcam");
  const canvas = document.getElementById("canvas-overlay");
  const feedback = document.getElementById("feedback-ia");
  const badge = document.querySelector(".accuracy-badge");

  if (!video || !canvas || !detector) {
    animId = requestAnimationFrame(loop);
    return;
  }

  if (paused) {
    animId = requestAnimationFrame(loop);
    return;
  }

  if (video.readyState >= 2 && video.videoWidth > 0) {
    resizeCanvasToVideo(video, canvas);
    const ctx = canvas.getContext("2d");

    let poses = [];
    try {
      poses = await detector.estimatePoses(video, {
        flipHorizontal: false,
        maxPoses: 1,
      });
    } catch (_) {
      poses = [];
    }

    drawPose(ctx, poses, video.videoWidth);

    frameCount += 1;
    if (feedback && poses.length && poses[0].keypoints?.length) {
      if (frameCount % 12 === 0) {
        feedback.textContent = postureHint(poses[0].keypoints);
      }
    } else if (feedback && frameCount % 30 === 0) {
      feedback.textContent = "Colocate de frente a la camara para detectar puntos.";
    }

    if (badge) {
      badge.textContent = poses.length ? "Pose activa" : "Buscando cuerpo";
    }
  }

  animId = requestAnimationFrame(loop);
}

async function iniciarCamara() {
  if (!usuarioEsPremium) {
    alert(
      "Esta rutina con camara requiere GAIN MASS PREMIUM.\n\nInicia sesion con una cuenta premium o visita la seccion Premium."
    );
    return;
  }

  const video = document.getElementById("webcam");
  const feedback = document.getElementById("feedback-ia");
  if (!video) return;

  try {
    if (!detector && feedback) {
      feedback.textContent = "Cargando modelo de pose (primera vez puede tardar)...";
    }
    await ensureDetector();
    if (feedback) feedback.textContent = "Iniciando camara...";

    stopStream();
    stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: { ideal: facingMode },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    });
    video.srcObject = stream;
    await video.play();

    paused = false;
    if (feedback) feedback.textContent = "Detectando postura...";

    if (!animId) loop();
  } catch (err) {
    console.error(err);
    alert(
      "No se pudo usar la camara. En iPhone usa HTTPS (por ejemplo tu app en Render) y acepta permisos."
    );
  }
}

function togglePausa() {
  paused = !paused;
  const btn = document.getElementById("btnPausa");
  if (btn) btn.textContent = paused ? "CONTINUAR" : "PAUSAR";
}

async function toggleCamara() {
  facingMode = facingMode === "user" ? "environment" : "user";
  if (stream) await iniciarCamara();
}

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

  const btnCam = document.getElementById("btnCamara");
  const btnPausa = document.getElementById("btnPausa");
  const btnFlip = document.getElementById("btnFlipCam");

  if (btnCam) btnCam.addEventListener("click", () => iniciarCamara());
  if (btnPausa) btnPausa.addEventListener("click", () => togglePausa());
  if (btnFlip) btnFlip.addEventListener("click", () => toggleCamara());

  window.iniciarCamara = iniciarCamara;
  window.togglePausa = togglePausa;
  window.toggleCamara = toggleCamara;
});
