// Base de alimentos: por 100 g salvo porUnidad (valores por unidad).
const alimentosDB = {
    pollo: { nombre: "Pechuga de Pollo", cal100: 165, p: 31, c: 0, g: 3.6 },
    pavo: { nombre: "Pechuga de Pavo", cal100: 135, p: 30, c: 0, g: 1 },
    carne_res: { nombre: "Carne de Res (magra)", cal100: 250, p: 26, c: 0, g: 15 },
    salmon: { nombre: "Salmón", cal100: 208, p: 20, c: 0, g: 13 },
    cerdo_magro: { nombre: "Lomo de Cerdo (magro)", cal100: 180, p: 27, c: 0, g: 8 },
    atun: { nombre: "Atún (en agua)", cal100: 132, p: 28, c: 0, g: 1 },
    huevo: { nombre: "Huevo", porUnidad: true, cal: 78, p: 6.3, c: 0.6, g: 5.3 },
    claras: { nombre: "Clara de Huevo", porUnidad: true, cal: 17, p: 3.6, c: 0.2, g: 0.1 },
    rebanada_pan: {
        nombre: "Rebanada pan integral",
        porUnidad: true,
        cal: 75,
        p: 3.5,
        c: 13,
        g: 1.2,
    },
    arroz: { nombre: "Arroz Blanco (cocido)", cal100: 130, p: 2.7, c: 28, g: 0.3 },
    pasta: { nombre: "Pasta (cocida)", cal100: 158, p: 5.8, c: 31, g: 0.9 },
    quinoa: { nombre: "Quinoa (cocida)", cal100: 120, p: 4.4, c: 21, g: 1.9 },
    avena: { nombre: "Avena en hojuelas", cal100: 389, p: 16.9, c: 66, g: 6.9 },
    papa: { nombre: "Papa / Patata (cocida)", cal100: 87, p: 1.9, c: 20, g: 0.1 },
    batata: { nombre: "Batata / Camote (asada)", cal100: 90, p: 2, c: 21, g: 0.2 },
    platano: { nombre: "Plátano", cal100: 89, p: 1.1, c: 23, g: 0.3 },
    maiz: { nombre: "Maíz (granos)", cal100: 96, p: 3.4, c: 21, g: 1.5 },
    frijoles: { nombre: "Frijoles / Porotos (cocidos)", cal100: 127, p: 9, c: 23, g: 0.5 },
    lentejas: { nombre: "Lentejas (cocidas)", cal100: 116, p: 9, c: 20, g: 0.4 },
    brocoli: { nombre: "Brócoli (cocido)", cal100: 35, p: 2.4, c: 7, g: 0.4 },
    espinaca: { nombre: "Espinaca (cocida)", cal100: 23, p: 3, c: 3.8, g: 0.3 },
    tomate: { nombre: "Tomate", cal100: 18, p: 0.9, c: 3.9, g: 0.2 },
    zanahoria: { nombre: "Zanahoria", cal100: 41, p: 0.9, c: 10, g: 0.2 },
    aguacate: { nombre: "Aguacate", cal100: 160, p: 2, c: 8.5, g: 14.7 },
    leche: { nombre: "Leche (entera)", cal100: 61, p: 3.2, c: 4.8, g: 3.3 },
    leche_desnatada: { nombre: "Leche desnatada", cal100: 35, p: 3.4, c: 5, g: 0.1 },
    yogur_griego: { nombre: "Yogur griego natural", cal100: 97, p: 9, c: 3.6, g: 5 },
    queso_rallado: { nombre: "Queso rallado (tipo mozzarella)", cal100: 300, p: 28, c: 2.2, g: 22 },
    requeson: { nombre: "Requesón / Cottage", cal100: 98, p: 11, c: 3.4, g: 4.3 },
    manzana: { nombre: "Manzana", cal100: 52, p: 0.3, c: 14, g: 0.2 },
    almendras: { nombre: "Almendras", cal100: 579, p: 21, c: 22, g: 50 },
    crema_cacahuate: { nombre: "Crema de cacahuate", cal100: 588, p: 25, c: 20, g: 50 },
    aceite_oliva: { nombre: "Aceite de oliva", cal100: 884, p: 0, c: 0, g: 100 },
    merluza: { nombre: "Merluza / Pescado blanco", cal100: 71, p: 17, c: 0, g: 0.6 },
    jamon_pavo: { nombre: "Jamón de pavo (fiambre)", cal100: 104, p: 21, c: 2, g: 2 },
    tofu: { nombre: "Tofu firme", cal100: 144, p: 15, c: 3, g: 8 },
    whey: {
        nombre: "Proteína en polvo (1 scoop ~30 g)",
        porUnidad: true,
        cal: 120,
        p: 24,
        c: 3,
        g: 1.5,
    },
    arroz_integral: { nombre: "Arroz integral (cocido)", cal100: 112, p: 2.3, c: 23, g: 0.8 },
    tortilla_maiz: {
        nombre: "Tortilla de maíz",
        porUnidad: true,
        cal: 47,
        p: 1.3,
        c: 9.5,
        g: 0.5,
    },
    avena_instantanea: { nombre: "Avena instantánea", cal100: 380, p: 13, c: 67, g: 6.5 },
    hummus: { nombre: "Hummus", cal100: 177, p: 7.8, c: 15, g: 10 },
    naranja: { nombre: "Naranja", cal100: 47, p: 0.9, c: 12, g: 0.1 },
    uva: { nombre: "Uva", cal100: 69, p: 0.7, c: 18, g: 0.2 },
    pepino: { nombre: "Pepino", cal100: 15, p: 0.7, c: 3.6, g: 0.1 },
    lechuga: { nombre: "Lechuga", cal100: 14, p: 1.4, c: 2.9, g: 0.2 },
    mantequilla: { nombre: "Mantequilla", cal100: 717, p: 0.9, c: 0.1, g: 81 },
    queso_panela: { nombre: "Queso panela / fresco", cal100: 265, p: 21, c: 2, g: 18 },
    nueces: { nombre: "Nueces", cal100: 654, p: 15, c: 14, g: 65 },
    chocolate_negro: { nombre: "Chocolate negro (~70% cacao)", cal100: 598, p: 7.8, c: 45, g: 42 },
};

const recetasDB = [
    { tipo: "masa", nombre: "Batido Bulk", cal: 900, p: 45, c: 120, g: 25, desc: "Avena, leche, maní y proteína." },
    { tipo: "masa", nombre: "Pasta con Res", cal: 650, p: 35, c: 85, g: 12, desc: "Pasta integral con carne magra." },
    { tipo: "masa", nombre: "Salmón con arroz", cal: 720, p: 42, c: 68, g: 28, desc: "Salmón al horno, arroz basmati y ensalada." },
    { tipo: "masa", nombre: "Pollo y batata", cal: 580, p: 48, c: 52, g: 14, desc: "Pechuga a la plancha, batata asada y brócoli al vapor." },
    { tipo: "masa", nombre: "Carne y puré", cal: 680, p: 38, c: 55, g: 28, desc: "Carne magra, puré de papa y judías verdes." },
    { tipo: "masa", nombre: "Wrap de pollo", cal: 620, p: 40, c: 58, g: 18, desc: "Tortilla integral, pollo, hummus y verduras." },
    { tipo: "masa", nombre: "Desayuno anabólico", cal: 750, p: 42, c: 72, g: 28, desc: "Huevos, tostadas integrales, aguacate y fruta." },
    { tipo: "masa", nombre: "Arroz frito fit", cal: 640, p: 32, c: 78, g: 16, desc: "Arroz integral, huevo, pollo picado y verduras." },
    { tipo: "energia", nombre: "Bowl Energético", cal: 400, p: 8, c: 80, g: 5, desc: "Fruta, miel y granola." },
    { tipo: "energia", nombre: "Tostadas Miel", cal: 300, p: 6, c: 60, g: 4, desc: "Pan integral con miel y plátano." },
    { tipo: "energia", nombre: "Pre-entreno plátano", cal: 320, p: 8, c: 48, g: 10, desc: "Plátano con crema de cacahuate y un poco de avena." },
    { tipo: "energia", nombre: "Gachas power", cal: 450, p: 18, c: 62, g: 12, desc: "Avena cocida con leche, canela y arándanos." },
    { tipo: "energia", nombre: "Sándwich integral", cal: 380, p: 22, c: 48, g: 10, desc: "Pan integral, pavo magro, tomate y lechuga." },
    { tipo: "energia", nombre: "Bowl de arroz y pollo", cal: 520, p: 35, c: 65, g: 9, desc: "Arroz, pollo desmenuzado y maíz (ideal antes de entrenar)." },
    { tipo: "energia", nombre: "Batido de fruta", cal: 280, p: 6, c: 58, g: 3, desc: "Plátano, leche, miel y un toque de cacao." },
    { tipo: "snack", nombre: "Yogur Pro", cal: 200, p: 20, c: 15, g: 2, desc: "Yogur griego y fresas." },
    { tipo: "snack", nombre: "Mix de Nueces", cal: 250, p: 7, c: 10, g: 18, desc: "Almendras y nueces." },
    { tipo: "snack", nombre: "Requesón y fruta", cal: 180, p: 22, c: 14, g: 3, desc: "Requesón bajo en grasa con piña o melón." },
    { tipo: "snack", nombre: "Hummus y bastones", cal: 220, p: 8, c: 22, g: 10, desc: "Hummus casero con zanahoria y apio." },
    { tipo: "snack", nombre: "Manzana y maní", cal: 240, p: 6, c: 28, g: 12, desc: "Manzana en rodajas con cucharada de crema de maní." },
    { tipo: "snack", nombre: "Tortilla de claras", cal: 160, p: 24, c: 4, g: 4, desc: "Claras con espinaca y un poco de queso rallado." },
    { tipo: "snack", nombre: "Batido rápido", cal: 210, p: 18, c: 18, g: 5, desc: "Leche o bebida vegetal con scoop de proteína." },
    { tipo: "snack", nombre: "Queso y galletas integrales", cal: 230, p: 14, c: 22, g: 9, desc: "Queso fresco en cubos con galletas saladas integrales." },
    { tipo: "snack", nombre: "Barrita casera", cal: 200, p: 10, c: 24, g: 7, desc: "Avena, miel, pasas y semillas (porción mediana)." }
];

const smartTips = [
    "Si te falta energía para entrenar, busca carbohidratos de rápida absorción.",
    "Beber agua fría puede ayudar a acelerar ligeramente tu metabolismo.",
    "Prioriza la proteína después de entrenar para una mejor recuperación muscular.",
    "Dormir 8 horas es tan importante como tu entrenamiento para ganar masa.",
    "No te saltes comidas; la constancia es la clave del superávit calórico.",
    "Los carbohidratos complejos (avena, camote) te dan energía estable por horas.",
    "Si te cuesta llegar a tus calorías, añade grasas saludables como aguacate o nueces.",
    "El músculo pesa más que la grasa; no te obsesiones solo con la báscula."
];

const AGUA_MAX = 10;
const STORAGE_META_P = "metaMacroProte";
const STORAGE_META_C = "metaMacroCarbo";
const STORAGE_META_G = "metaMacroGrasa";

let usuarioEsPremium = false;

/** Cámara + MobileNet (detección orientativa) */
let modeloMobilenet = null;
let streamComida = null;
let intervaloDeteccion = null;
let foodAnalysisTimer = null;
let analizandoFrame = false;
let htmlInicialCamara = null;
const LS_FOOD_CAM_PREF = "gainmass_food_cam_device";
const LS_FOOD_MIRROR = "gainmass_food_mirror";

let foodCamDeviceId = null;
let foodCamFacingMode = "environment";
let foodVideoInputs = [];
let foodVideoInputIndex = 0;
let foodMirrorPreview = false;

let foodInferMsEma = 0;
let foodAnalysisIntervalMs = 2000;
const FOOD_EMA_ALPHA = 0.2;
const FOOD_PRED_HISTORY = [];
const FOOD_PRED_HISTORY_MAX = 6;

function esDispositivoTactil() {
    return (
        typeof navigator !== "undefined" &&
        (navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0)
    );
}

function cargarPreferenciaEspejo() {
    try {
        foodMirrorPreview = localStorage.getItem(LS_FOOD_MIRROR) === "1";
    } catch {
        foodMirrorPreview = false;
    }
}

function guardarPreferenciaEspejo() {
    try {
        localStorage.setItem(LS_FOOD_MIRROR, foodMirrorPreview ? "1" : "0");
    } catch {}
}

function cargarPreferenciaDeviceId() {
    try {
        const raw = localStorage.getItem(LS_FOOD_CAM_PREF);
        foodCamDeviceId = raw && raw.length ? raw : null;
    } catch {
        foodCamDeviceId = null;
    }
}

function guardarPreferenciaDeviceId(id) {
    if (!id) return;
    foodCamDeviceId = id;
    try {
        localStorage.setItem(LS_FOOD_CAM_PREF, id);
    } catch {}
}

function mensajeErrorCamaraFood(err) {
    const name = err && err.name ? err.name : "";
    if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        return "Cámara bloqueada: permite el permiso en el navegador. En móvil, revisa permisos del sitio en Ajustes.";
    }
    if (name === "NotFoundError" || name === "DevicesNotFoundError") {
        return "No hay cámara disponible o no se detectó ningún dispositivo.";
    }
    if (name === "NotReadableError" || name === "TrackStartError") {
        return "La cámara está en uso por otra app. Ciérrala e inténtalo de nuevo.";
    }
    if (name === "OverconstrainedError") {
        return "Esta cámara no acepta la configuración pedida. Prueba otra en la lista.";
    }
    if (
        typeof location !== "undefined" &&
        location.protocol !== "https:" &&
        location.hostname !== "localhost" &&
        location.hostname !== "127.0.0.1"
    ) {
        return "La cámara suele requerir HTTPS o localhost.";
    }
    return "No se pudo usar la cámara. Comprueba permisos.";
}

let foodCamSelectSuppress = false;

function textoEtiquetaCamaraFood(d, i) {
    const lab = (d.label || "").trim();
    if (lab) return lab;
    return `Cámara ${i + 1}`;
}

function obtenerDeviceIdFoodVideoActivo() {
    const v = document.getElementById("food-webcam");
    if (!v || !v.srcObject) return null;
    const tracks = v.srcObject.getVideoTracks();
    if (!tracks.length) return null;
    const s = tracks[0].getSettings ? tracks[0].getSettings() : {};
    return s.deviceId || null;
}

function poblarSelectFoodCam() {
    const sel = document.getElementById("select-food-cam");
    if (!sel) return;
    foodCamSelectSuppress = true;
    try {
        sel.innerHTML = "";
        if (!foodVideoInputs.length) {
            const o = document.createElement("option");
            o.value = "";
            o.textContent = "Sin dispositivos listados";
            sel.appendChild(o);
            sel.disabled = true;
            return;
        }
        foodVideoInputs.forEach((d, i) => {
            if (!d.deviceId) return;
            const o = document.createElement("option");
            o.value = d.deviceId;
            o.textContent = textoEtiquetaCamaraFood(d, i);
            sel.appendChild(o);
        });
        if (!sel.options.length) {
            const o = document.createElement("option");
            o.value = "";
            o.textContent = "Dispositivo sin identificar";
            sel.appendChild(o);
            sel.disabled = true;
            return;
        }
        sel.disabled = !streamComida;
        const cur = obtenerDeviceIdFoodVideoActivo();
        if (cur && [...sel.options].some((op) => op.value === cur)) {
            sel.value = cur;
        } else if (
            foodCamDeviceId &&
            [...sel.options].some((op) => op.value === foodCamDeviceId)
        ) {
            sel.value = foodCamDeviceId;
        } else {
            sel.selectedIndex = Math.min(
                foodVideoInputIndex,
                sel.options.length - 1
            );
        }
    } finally {
        foodCamSelectSuppress = false;
    }
}

async function aplicarCamaraFoodSeleccionada() {
    if (foodCamSelectSuppress || !streamComida) return;
    const sel = document.getElementById("select-food-cam");
    if (!sel) return;
    const id = sel.value;
    if (!id) return;
    const cur = obtenerDeviceIdFoodVideoActivo();
    if (id === cur) return;

    detenerTimersFood();
    if (streamComida) {
        streamComida.getTracks().forEach((t) => t.stop());
        streamComida = null;
    }

    foodCamDeviceId = id;
    guardarPreferenciaDeviceId(id);
    foodVideoInputIndex = Math.max(
        0,
        foodVideoInputs.findIndex((d) => d.deviceId === id)
    );

    try {
        streamComida = await abrirStreamComida();
        const video = document.getElementById("food-webcam");
        if (video) {
            video.srcObject = streamComida;
            await video.play();
        }
        aplicarEspejoVideoComida();
        const st = document.getElementById("food-model-status");
        const nom = foodVideoInputs[foodVideoInputIndex];
        if (st) {
            st.textContent = nom
                ? `${textoEtiquetaCamaraFood(nom, foodVideoInputIndex)} · analizando…`
                : "Analizando…";
        }
        poblarSelectFoodCam();
        analizarFotogramaComida();
        programarSiguienteAnalisisComida();
    } catch (e) {
        console.error(e);
        cerrarCamaraComida();
        alert(mensajeErrorCamaraFood(e));
    }
}

function aplicarEspejoVideoComida() {
    const v = document.getElementById("food-webcam");
    if (!v) return;
    v.style.transform = foodMirrorPreview ? "scaleX(-1)" : "";
}

function actualizarRendimientoFood(msInferencia) {
    if (!msInferencia || !Number.isFinite(msInferencia)) return;
    if (!foodInferMsEma) foodInferMsEma = msInferencia;
    else
        foodInferMsEma =
            FOOD_EMA_ALPHA * msInferencia + (1 - FOOD_EMA_ALPHA) * foodInferMsEma;

    if (foodInferMsEma > 900) foodAnalysisIntervalMs = 3500;
    else if (foodInferMsEma > 500) foodAnalysisIntervalMs = 2800;
    else foodAnalysisIntervalMs = 2000;
}

async function enumerarCamarasVideo() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        foodVideoInputs = [];
        return;
    }
    const list = await navigator.mediaDevices.enumerateDevices();
    foodVideoInputs = list.filter((d) => d.kind === "videoinput");
    if (foodCamDeviceId) {
        const idx = foodVideoInputs.findIndex((d) => d.deviceId === foodCamDeviceId);
        foodVideoInputIndex = idx >= 0 ? idx : 0;
    } else {
        foodVideoInputIndex = 0;
    }
}

function construirVideoConstraintsPrimario() {
    if (foodCamDeviceId) {
        return {
            deviceId: { exact: foodCamDeviceId },
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            frameRate: { ideal: 24, max: 30 },
        };
    }
    return {
        facingMode: { ideal: foodCamFacingMode },
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 },
        frameRate: { ideal: 24, max: 30 },
    };
}

function construirVideoConstraintsFallback() {
    if (foodCamDeviceId) {
        return { deviceId: foodCamDeviceId };
    }
    return { facingMode: foodCamFacingMode };
}

async function abrirStreamComida() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("getUserMedia no disponible");
    }
    try {
        return await navigator.mediaDevices.getUserMedia({
            video: construirVideoConstraintsPrimario(),
            audio: false,
        });
    } catch (e1) {
        try {
            return await navigator.mediaDevices.getUserMedia({
                video: construirVideoConstraintsFallback(),
                audio: false,
            });
        } catch (e2) {
            if (foodCamDeviceId) {
                foodCamDeviceId = null;
                try {
                    localStorage.removeItem(LS_FOOD_CAM_PREF);
                } catch {}
                try {
                    return await navigator.mediaDevices.getUserMedia({
                        video: { facingMode: foodCamFacingMode },
                        audio: false,
                    });
                } catch (e3) {
                    const otroFacing =
                        foodCamFacingMode === "environment"
                            ? "user"
                            : "environment";
                    return await navigator.mediaDevices.getUserMedia({
                        video: { facingMode: otroFacing },
                        audio: false,
                    });
                }
            }
            const otroFacing =
                foodCamFacingMode === "environment" ? "user" : "environment";
            return await navigator.mediaDevices.getUserMedia({
                video: { facingMode: otroFacing },
                audio: false,
            });
        }
    }
}

function detenerTimersFood() {
    if (intervaloDeteccion != null) {
        clearInterval(intervaloDeteccion);
        intervaloDeteccion = null;
    }
    if (foodAnalysisTimer != null) {
        clearTimeout(foodAnalysisTimer);
        foodAnalysisTimer = null;
    }
}

function programarSiguienteAnalisisComida() {
    if (!streamComida) return;
    if (document.visibilityState === "hidden") return;
    detenerTimersFood();
    foodAnalysisTimer = setTimeout(() => {
        foodAnalysisTimer = null;
        analizarFotogramaComida().finally(() => {
            if (streamComida) programarSiguienteAnalisisComida();
        });
    }, foodAnalysisIntervalMs);
}

function registrarVisibilidadFood() {
    document.removeEventListener("visibilitychange", onVisibilityFood);
    document.addEventListener("visibilitychange", onVisibilityFood);
}

function onVisibilityFood() {
    if (document.visibilityState === "hidden") {
        detenerTimersFood();
        return;
    }
    if (streamComida) {
        programarSiguienteAnalisisComida();
    }
}

function primeraClasePrediccion(className) {
    return String(className || "").split(",")[0].trim().toLowerCase();
}

const IMAGENET_A_CATALOGO = {
    broccoli: "brocoli",
    cucumber: "pepino",
    carrot: "zanahoria",
    banana: "platano",
    orange: "naranja",
    apple: "manzana",
    cheese: "queso_panela",
    "sweet potato": "batata",
    corn: "maiz",
    spaghetti: "pasta",
    "mashed potato": "papa",
    burrito: "tortilla_maiz",
    guacamole: "aguacate",
    steak: "carne_res",
    sushi: "atun",
    omelet: "huevo",
    "fried egg": "huevo",
    waffle: "rebanada_pan",
    bagel: "rebanada_pan",
    pretzel: "rebanada_pan",
    doughnut: "chocolate_negro",
    "ice cream": "yogur_griego",
    pizza: "queso_rallado",
    "french fries": "papa",
    hamburger: "carne_res",
    cheeseburger: "carne_res",
    "hot dog": "jamon_pavo",
};

function catalogoIdDesdePrediccion(className) {
    const key = primeraClasePrediccion(className);
    return IMAGENET_A_CATALOGO[key] || null;
}

function registrarVotoPrediccion(preds) {
    if (!preds || !preds.length) return preds;
    const top = preds[0];
    const k = primeraClasePrediccion(top.className);
    FOOD_PRED_HISTORY.push(k);
    if (FOOD_PRED_HISTORY.length > FOOD_PRED_HISTORY_MAX) FOOD_PRED_HISTORY.shift();
    const counts = {};
    FOOD_PRED_HISTORY.forEach((x) => {
        counts[x] = (counts[x] || 0) + 1;
    });
    const estable = Object.keys(counts).reduce(
        (a, b) => (counts[a] >= counts[b] ? a : b),
        k
    );
    if (estable && estable !== k) {
        const alt = preds.find(
            (p) => primeraClasePrediccion(p.className) === estable
        );
        if (alt) return [alt, ...preds.filter((p) => p !== alt)];
    }
    return preds;
}

function aplicarSugerenciaCatalogo(catalogId) {
    const sel = document.getElementById("alimento");
    const cant = document.getElementById("cantidad");
    if (!sel || !alimentosDB[catalogId]) {
        alert("No hay coincidencia en el catálogo para esta sugerencia.");
        return;
    }
    sel.value = catalogId;
    sel.dispatchEvent(new Event("change", { bubbles: true }));
    if (cant && (!cant.value || parseFloat(cant.value) <= 0)) {
        const info = alimentosDB[catalogId];
        cant.value = info.porUnidad ? "1" : "150";
    }
    cant?.focus();
}

function todayKey() {
    const d = new Date();
    return (
        d.getFullYear() +
        "-" +
        String(d.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(d.getDate()).padStart(2, "0")
    );
}

function historialStorageKey(dateStr) {
    return "gainmass_comidas_" + dateStr;
}

function aguaStorageKey(dateStr) {
    return "gainmass_agua_" + dateStr;
}

function migrateLegacyHistorial() {
    const k = historialStorageKey(todayKey());
    if (localStorage.getItem(k)) return;
    const leg = localStorage.getItem("historialComidas");
    if (!leg) return;
    try {
        const arr = JSON.parse(leg);
        if (Array.isArray(arr) && arr.length) localStorage.setItem(k, leg);
        localStorage.removeItem("historialComidas");
    } catch {
        localStorage.removeItem("historialComidas");
    }
}

function getHistorial() {
    migrateLegacyHistorial();
    try {
        const raw = localStorage.getItem(historialStorageKey(todayKey()));
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function setHistorial(arr) {
    localStorage.setItem(historialStorageKey(todayKey()), JSON.stringify(arr));
}

function normalizarAlturaCm(valor) {
    const x = parseFloat(valor);
    if (!x || x <= 0) return null;
    if (x < 3) return Math.round(x * 100 * 100) / 100;
    return Math.round(x * 100) / 100;
}

function calcularMacrosObjetivo(kcalMeta, pesoKg) {
    const p = Math.round(1.75 * pesoKg);
    const f = Math.round(0.9 * pesoKg);
    let resto = kcalMeta - p * 4 - f * 9;
    let c = Math.round(resto / 4);
    if (c < 40) {
        const f2 = Math.round(0.75 * pesoKg);
        resto = kcalMeta - p * 4 - f2 * 9;
        c = Math.max(40, Math.round(resto / 4));
        return { p, c, g: f2 };
    }
    return { p, c, g: f };
}

function guardarMetasMacros(obj) {
    localStorage.setItem(STORAGE_META_P, String(obj.p));
    localStorage.setItem(STORAGE_META_C, String(obj.c));
    localStorage.setItem(STORAGE_META_G, String(obj.g));
}

function leerMetasMacros() {
    const p = localStorage.getItem(STORAGE_META_P);
    const c = localStorage.getItem(STORAGE_META_C);
    const g = localStorage.getItem(STORAGE_META_G);
    if (p == null || c == null || g == null) return null;
    return { p: parseInt(p, 10), c: parseInt(c, 10), g: parseInt(g, 10) };
}

function cargarAguaDelDia() {
    const raw = localStorage.getItem(aguaStorageKey(todayKey()));
    let n = parseInt(raw, 10);
    if (Number.isNaN(n) || n < 0) n = 0;
    n = Math.min(n, AGUA_MAX);
    const el = document.getElementById("conteo-agua");
    const bar = document.getElementById("barra-agua");
    if (el) el.textContent = String(n);
    if (bar) bar.style.width = (n * (100 / AGUA_MAX)) + "%";
}

function guardarAgua(n) {
    localStorage.setItem(aguaStorageKey(todayKey()), String(n));
}

function actualizarPlaceholderCantidad() {
    const sel = document.getElementById("alimento");
    const inp = document.getElementById("cantidad");
    if (!sel || !inp) return;
    const id = sel.value;
    const info = alimentosDB[id];
    if (info && info.porUnidad) {
        inp.placeholder =
            id === "whey"
                ? "Nº de scoops (ej. 1)"
                : id === "tortilla_maiz"
                  ? "Nº de tortillas (ej. 2)"
                  : "Nº de unidades (ej. 2 huevos)";
    } else {
        inp.placeholder = "Gramos (ej. 150)";
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    cargarPreferenciaDeviceId();
    cargarPreferenciaEspejo();
    foodCamFacingMode = esDispositivoTactil() ? "environment" : "user";

    try {
        const r = await fetch("/api/me");
        if (r.ok) {
            const d = await r.json();
            usuarioEsPremium = !!(d.usuario && d.usuario.premium);
            localStorage.setItem("premium", usuarioEsPremium ? "1" : "0");
        } else {
            usuarioEsPremium = localStorage.getItem("premium") === "1";
        }
    } catch {
        usuarioEsPremium = localStorage.getItem("premium") === "1";
    }

    const meta = localStorage.getItem("metaGainMass") || 2500;
    const elMeta = document.getElementById("calMeta");
    if (elMeta) elMeta.textContent = meta;

    const alSel = document.getElementById("alimento");
    if (alSel) {
        alSel.addEventListener("change", actualizarPlaceholderCantidad);
        actualizarPlaceholderCantidad();
    }

    const labelDia = document.getElementById("foodDiaLabel");
    if (labelDia) {
        const d = new Date();
        labelDia.textContent =
            "Registro del " +
            d.toLocaleDateString("es-MX", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
            });
    }

    const contCam = document.getElementById("contenedor-camara");
    if (contCam && !htmlInicialCamara) {
        htmlInicialCamara = contCam.innerHTML;
    }

    document.querySelectorAll(".btn-filtro").forEach((btn) => {
        btn.addEventListener("click", () => {
            const cat = btn.getAttribute("data-cat") || "todas";
            document.querySelectorAll(".btn-filtro").forEach((b) =>
                b.classList.remove("active")
            );
            btn.classList.add("active");
            renderRecetas(cat);
        });
    });

    renderRecetas("todas");
    mostrarComidas();
    cargarAguaDelDia();

    cargarTipAleatorio();
    setInterval(cargarTipAleatorio, 6000);
});

function cargarTipAleatorio() {
    const elementoTip = document.getElementById("texto-tip");
    if (!elementoTip) return;
    elementoTip.style.opacity = 0;
    setTimeout(() => {
        const indice = Math.floor(Math.random() * smartTips.length);
        elementoTip.textContent = smartTips[indice];
        elementoTip.style.opacity = 1;
    }, 500);
}

function generarPlanNutricional() {
    const p = parseFloat(document.getElementById("peso").value);
    const aRaw = document.getElementById("altura").value;
    const e = parseInt(document.getElementById("edad").value, 10);
    const act = parseFloat(document.getElementById("nivelActividad").value);

    const alturaCm = normalizarAlturaCm(aRaw);
    if (!p || !alturaCm || !e) {
        alert("Por favor completa peso, altura y edad con valores válidos.");
        return;
    }

    let tmb = 10 * p + 6.25 * alturaCm - 5 * e + 5;
    const meta = Math.round(tmb * act * 1.15);

    localStorage.setItem("metaGainMass", String(meta));
    localStorage.setItem("edad", String(e));
    localStorage.setItem("altura_cm", String(alturaCm));
    localStorage.setItem("peso_kg", String(p));
    const imc = p / Math.pow(alturaCm / 100, 2);
    localStorage.setItem("imc_ultimo", imc.toFixed(1));
    const macros = calcularMacrosObjetivo(meta, p);
    guardarMetasMacros(macros);

    document.getElementById("calMeta").textContent = String(meta);
    const res = document.getElementById("resultado-biometrico");
    if (res) {
        res.innerHTML =
            `Meta: <strong>${meta} kcal</strong> · IMC: <strong>${imc.toFixed(1)}</strong><br>` +
            `<span style="color:#8ecbff;">Objetivos macros (orientativos): ` +
            `P ~${macros.p}g · C ~${macros.c}g · G ~${macros.g}g</span>`;
    }
    mostrarComidas();
    actualizarLineasMacros();
}

function construirItemDesdeAlimento(id, cantidad) {
    const info = alimentosDB[id];
    if (!info) return null;
    if (info.porUnidad) {
        const u = Math.max(0, cantidad);
        return {
            n: info.nombre + (u !== 1 ? " ×" + u : ""),
            cal: Math.round(info.cal * u),
            p: Math.round(info.p * u),
            c: Math.round(info.c * u),
            g: Math.round(info.g * u),
        };
    }
    const g = cantidad;
    return {
        n: info.nombre,
        cal: Math.round((info.cal100 * g) / 100),
        p: Math.round((info.p * g) / 100),
        c: Math.round((info.c * g) / 100),
        g: Math.round((info.g * g) / 100),
    };
}

function agregarComida() {
    const id = document.getElementById("alimento").value;
    const cant = parseFloat(document.getElementById("cantidad").value);
    if (!cant || cant <= 0) {
        alert("Ingresa una cantidad válida.");
        return;
    }

    const item = construirItemDesdeAlimento(id, cant);
    if (!item) return;

    const mo =
        (document.getElementById("momentoComida") || {}).value || "";
    if (mo) item.mo = mo;

    const historial = getHistorial();
    historial.push(item);
    setHistorial(historial);
    mostrarComidas();
}

function agregarComidaManual() {
    const nombre = (document.getElementById("manualNombre") || {}).value.trim();
    const cal = parseFloat(document.getElementById("manualCal").value);
    const pr = parseFloat(document.getElementById("manualP").value);
    const cb = parseFloat(document.getElementById("manualC").value);
    const gr = parseFloat(document.getElementById("manualG").value);

    if (!nombre) {
        alert("Escribe un nombre para el alimento.");
        return;
    }
    if (
        Number.isNaN(cal) ||
        cal < 0 ||
        Number.isNaN(pr) ||
        pr < 0 ||
        Number.isNaN(cb) ||
        cb < 0 ||
        Number.isNaN(gr) ||
        gr < 0
    ) {
        alert("Completa calorías y macros con números válidos (0 o más).");
        return;
    }

    const item = {
        n: nombre,
        cal: Math.round(cal),
        p: Math.round(pr),
        c: Math.round(cb),
        g: Math.round(gr),
    };
    const mo = (document.getElementById("momentoManual") || {}).value || "";
    if (mo) item.mo = mo;

    const historial = getHistorial();
    historial.push(item);
    setHistorial(historial);
    mostrarComidas();
}

function añadirRecetaAlDiario(index) {
    const r = recetasDB[index];
    if (!r) return;
    const item = {
        n: r.nombre + " (receta)",
        cal: r.cal,
        p: r.p,
        c: r.c,
        g: r.g,
        mo: "Receta",
    };
    const historial = getHistorial();
    historial.push(item);
    setHistorial(historial);
    mostrarComidas();
}

function actualizarLineasMacros() {
    const m = leerMetasMacros();
    const fmt = (actual, meta) => {
        if (meta == null) return actual + "g";
        return actual + " / " + meta + "g";
    };

    const historial = getHistorial();
    let tP = 0,
        tC = 0,
        tG = 0;
    historial.forEach((item) => {
        tP += item.p;
        tC += item.c;
        tG += item.g;
    });

    const elP = document.getElementById("mProte");
    const elC = document.getElementById("mCarbo");
    const elG = document.getElementById("mGrasa");
    if (elP) elP.textContent = fmt(tP, m ? m.p : null);
    if (elC) elC.textContent = fmt(tC, m ? m.c : null);
    if (elG) elG.textContent = fmt(tG, m ? m.g : null);
}

function mostrarComidas() {
    const historial = getHistorial();
    const lista = document.getElementById("listaComidas");
    const meta = parseFloat(localStorage.getItem("metaGainMass")) || 2500;
    let tCal = 0;

    if (lista) {
        lista.innerHTML = "";
        historial.forEach((item, i) => {
            tCal += item.cal;
            const mo = item.mo
                ? `<span class="tabla-momento">${escapeHtml(item.mo)}</span>`
                : "—";
            lista.innerHTML += `
            <tr>
                <td>${mo}</td>
                <td>${escapeHtml(item.n)}</td>
                <td>${item.cal}</td>
                <td>${item.p}P | ${item.c}C | ${item.g}G</td>
                <td><button type="button" onclick="borrar(${i})" style="color:#ff4444; background:none; border:none; cursor:pointer; font-size:1.2rem;">&times;</button></td>
            </tr>`;
        });
    }

    const calCons = document.getElementById("calConsumidas");
    if (calCons) calCons.textContent = String(tCal);

    actualizarLineasMacros();

    const barra = document.getElementById("barra-interna");
    if (barra) {
        const porcentaje = Math.min((tCal / meta) * 100, 100);
        barra.style.width = porcentaje + "%";
    }
}

function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
}

function borrar(i) {
    const historial = getHistorial();
    historial.splice(i, 1);
    setHistorial(historial);
    mostrarComidas();
}

function renderRecetas(cat) {
    const filtradas =
        cat === "todas" ? recetasDB : recetasDB.filter((r) => r.tipo === cat);
    const wrapper = document.getElementById("wrapper-recetas");
    if (!wrapper) return;

    wrapper.innerHTML = filtradas
        .map((r) => {
            const globalIdx = recetasDB.indexOf(r);
            return `
        <div class="receta-card">
            <span class="cal-badge"><i class="fa-solid fa-fire-flame-curved"></i> ${r.cal} kcal</span>
            <h4 style="margin:5px 0; color:var(--azul-cian); font-size:1.1rem;">${escapeHtml(r.nombre)}</h4>
            <p style="font-size:0.8rem; color:#aaa; margin-bottom:10px;">${escapeHtml(r.desc)}</p>
            <div class="receta-macros-row" style="display:flex; justify-content:space-between; font-size:0.85rem; background:rgba(0,0,0,0.5); padding:8px; border-radius:8px; border: 1px solid rgba(255,255,255,0.05);">
                <span><abbr title="Proteínas (gramos)">P</abbr>: <strong>${r.p}</strong> g</span>
                <span><abbr title="Carbohidratos (gramos)">C</abbr>: <strong>${r.c}</strong> g</span>
                <span><abbr title="Grasas (gramos)">G</abbr>: <strong>${r.g}</strong> g</span>
            </div>
            <button type="button" class="btn-receta-anadir" onclick="añadirRecetaAlDiario(${globalIdx})">Añadir al diario</button>
        </div>`;
        })
        .join("");
}

function scrollRecetas(dir) {
    const w = document.getElementById("wrapper-recetas");
    if (w) w.scrollBy({ left: dir * 280, behavior: "smooth" });
}

function agregarAgua() {
    const raw = localStorage.getItem(aguaStorageKey(todayKey()));
    let n = parseInt(raw, 10);
    if (Number.isNaN(n) || n < 0) n = 0;
    n = Math.min(n + 1, AGUA_MAX);
    guardarAgua(n);
    cargarAguaDelDia();
}

function getMobilenetLib() {
    if (typeof mobilenet !== "undefined") return mobilenet;
    if (typeof window.mobilenet !== "undefined") return window.mobilenet;
    return null;
}

async function getMobilenetModel() {
    const lib = getMobilenetLib();
    if (!lib) throw new Error("mobilenet no cargado");
    if (modeloMobilenet) return modeloMobilenet;
    await tf.ready();
    try {
        await tf.setBackend("webgl");
    } catch (_) {
        await tf.setBackend("cpu");
    }
    await tf.ready();
    modeloMobilenet = await lib.load();
    return modeloMobilenet;
}

const ETIQUETA_ES = {
    "hot dog": "perrito caliente",
    cheeseburger: "hamburguesa con queso",
    hamburger: "hamburguesa",
    pizza: "pizza",
    "french fries": "patatas fritas",
    "ice cream": "helado",
    broccoli: "brócoli",
    cucumber: "pepino",
    carrot: "zanahoria",
    banana: "plátano",
    orange: "naranja",
    lemon: "limón",
    cheese: "queso",
    burrito: "burrito",
    guacamole: "guacamole",
    spaghetti: "espaguetis",
    "mashed potato": "puré de patata",
    mushroom: "champiñón",
    "sweet potato": "batata / camote",
    corn: "maíz",
    steak: "filete",
    "sushi bar": "sushi",
    sushi: "sushi",
    "potpie": "pastel de carne",
    "meat loaf": "pastel de carne",
    bagel: "bagel",
    pretzel: "pretzel",
    waffle: "gofre",
    doughnut: "dónut",
    "chocolate sauce": "salsa chocolate",
    carbonara: "carbonara",
    "eggs benedict": "huevos benedict",
    "eggs florentine": "huevos florentinos",
    "fried egg": "huevo frito",
    omelet: "tortilla francesa",
    "cabbage": "repollo",
    cauliflower: "coliflor",
    "bell pepper": "pimiento",
    apple: "manzana",
    strawberry: "fresa",
    watermelon: "sandía",
    grapefruit: "pomelo",
    pomegranate: "granada",
    "acorn squash": "calabaza",
    "butternut squash": "calabaza",
    "spaghetti squash": "calabaza espagueti",
};

function etiquetaLegible(className) {
    const first = (className || "").split(",")[0].trim();
    const key = first.toLowerCase();
    const es = ETIQUETA_ES[key];
    return es ? `${first} (${es})` : first;
}

async function analizarFotogramaComida() {
    if (analizandoFrame || !streamComida) return;
    const v = document.getElementById("food-webcam");
    const c = document.getElementById("food-canvas-hidden");
    const out = document.getElementById("food-detections");
    if (!v || !c || !out || !v.videoWidth) return;

    analizandoFrame = true;
    try {
        const t0 = performance.now();
        const model = await getMobilenetModel();
        const vw = v.videoWidth;
        const vh = v.videoHeight;
        const maxSide = Math.max(vw, vh);
        let tw = vw;
        let th = vh;
        if (maxSide > 480) {
            const s = 480 / maxSide;
            tw = Math.max(1, Math.round(vw * s));
            th = Math.max(1, Math.round(vh * s));
        }
        c.width = tw;
        c.height = th;
        const ctx = c.getContext("2d");
        ctx.drawImage(v, 0, 0, tw, th);
        const predsRaw = await model.classify(c);
        const ms = performance.now() - t0;
        actualizarRendimientoFood(ms);

        const preds = registrarVotoPrediccion(predsRaw);
        const top = preds.slice(0, 3);
        const filas = top.map((p, i) => {
            const label = etiquetaLegible(p.className);
            const pct = (p.probability * 100).toFixed(0);
            const catId = catalogoIdDesdePrediccion(p.className);
            const btn = catId
                ? `<button type="button" class="btn-food-sugerencia" data-catalog="${escapeHtml(catId)}">Usar en catálogo</button>`
                : "";
            return `<div class="food-detection-row"><span class="food-detection-rank">${i + 1}.</span><span class="food-detection-name">${escapeHtml(label)}</span><span class="food-detection-pct">${pct}%</span>${btn}</div>`;
        });
        out.innerHTML =
            filas.join("") +
            `<p class="food-detection-note">Clasificación local (ImageNet vía MobileNet). No mide gramos: confirma cantidad abajo. · ~${Math.round(foodInferMsEma || ms)} ms · cada ~${Math.round(foodAnalysisIntervalMs / 100) / 10}s</p>`;

        out.querySelectorAll(".btn-food-sugerencia").forEach((btn) => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-catalog");
                if (id) aplicarSugerenciaCatalogo(id);
            });
        });
    } catch (e) {
        console.error(e);
        out.innerHTML =
            '<p class="food-detection-err">Error al analizar. Reintenta.</p>';
    } finally {
        analizandoFrame = false;
    }
}

function cerrarCamaraComida() {
    detenerTimersFood();
    document.removeEventListener("visibilitychange", onVisibilityFood);
    FOOD_PRED_HISTORY.length = 0;
    foodInferMsEma = 0;
    foodAnalysisIntervalMs = 2000;
    const v = document.getElementById("food-webcam");
    if (v && v.srcObject) {
        v.srcObject.getTracks().forEach((t) => t.stop());
        v.srcObject = null;
    }
    streamComida = null;
    const cont = document.getElementById("contenedor-camara");
    if (cont && htmlInicialCamara != null) {
        cont.innerHTML = htmlInicialCamara;
    }
}

async function cambiarCamaraComida() {
    if (!streamComida) return;
    try {
        await enumerarCamarasVideo();
    } catch {
        foodVideoInputs = [];
    }

    if (foodVideoInputs.length >= 2) {
        foodVideoInputIndex = (foodVideoInputIndex + 1) % foodVideoInputs.length;
        const dev = foodVideoInputs[foodVideoInputIndex];
        foodCamDeviceId = dev.deviceId || null;
        if (foodCamDeviceId) guardarPreferenciaDeviceId(foodCamDeviceId);
    } else {
        foodCamFacingMode =
            foodCamFacingMode === "environment" ? "user" : "environment";
        foodCamDeviceId = null;
    }

    detenerTimersFood();
    if (streamComida) {
        streamComida.getTracks().forEach((t) => t.stop());
        streamComida = null;
    }

    try {
        streamComida = await abrirStreamComida();
        const video = document.getElementById("food-webcam");
        if (video) {
            video.srcObject = streamComida;
            await video.play();
        }
        aplicarEspejoVideoComida();
        const st = document.getElementById("food-model-status");
        if (st) {
            st.textContent =
                foodVideoInputs.length >= 2
                    ? `Cámara ${foodVideoInputIndex + 1}/${foodVideoInputs.length} · analizando…`
                    : `Cámara (${foodCamFacingMode}) · analizando…`;
        }
        poblarSelectFoodCam();
        analizarFotogramaComida();
        programarSiguienteAnalisisComida();
    } catch (e) {
        console.error(e);
        cerrarCamaraComida();
        alert(mensajeErrorCamaraFood(e));
    }
}

function alternarEspejoComida() {
    foodMirrorPreview = !foodMirrorPreview;
    guardarPreferenciaEspejo();
    aplicarEspejoVideoComida();
}

async function abrirCamara() {
    if (!usuarioEsPremium) {
        alert(
            "Esta función requiere GAIN MASS PREMIUM.\n\nInicia sesión con una cuenta premium o contrata el plan en la sección Premium."
        );
        return;
    }
    const cont = document.getElementById("contenedor-camara");
    if (!cont) return;
    if (streamComida) {
        return;
    }

    cont.innerHTML = `
        <div class="camara-food-wrap">
            <p class="camara-nota" id="food-model-status">Cargando modelo MobileNet…</p>
            <p class="camara-nota food-cam-priv">El análisis se hace en tu dispositivo; no subimos fotos a servidores.</p>
            <div class="food-cam-frame" aria-hidden="true"><span>Encuadra el plato aquí</span></div>
            <video id="food-webcam" class="food-webcam-video" autoplay playsinline muted></video>
            <canvas id="food-canvas-hidden" width="224" height="224" style="display:none;"></canvas>
            <div id="food-detections" class="food-detections"></div>
            <label class="food-cam-select-label" for="select-food-cam">Cámara</label>
            <select id="select-food-cam" class="select-cam-dispositivo select-food-cam" aria-label="Elegir cámara de video"></select>
            <div class="camara-food-actions">
                <button type="button" class="btn-accion-comida btn-cam-sec" onclick="cambiarCamaraComida()">Cambiar cámara</button>
                <button type="button" class="btn-accion-comida btn-cam-sec" onclick="alternarEspejoComida()">Espejo vista</button>
                <button type="button" class="btn-accion-comida btn-ia-stop" onclick="cerrarCamaraComida()">Detener cámara</button>
            </div>
        </div>`;

    try {
        await getMobilenetModel();
        const st = document.getElementById("food-model-status");
        if (st) st.textContent = "Modelo listo. Apunta al plato.";
    } catch (e) {
        console.error(e);
        cont.innerHTML =
            '<p class="food-detection-err">No se pudo cargar el modelo. Revisa la conexión e intenta de nuevo.</p>' +
            (htmlInicialCamara || "");
        alert("No se pudo cargar MobileNet. ¿Tienes internet?");
        return;
    }

    try {
        streamComida = await abrirStreamComida();
        try {
            await enumerarCamarasVideo();
        } catch {
            foodVideoInputs = [];
        }
        const video = document.getElementById("food-webcam");
        video.srcObject = streamComida;
        await video.play();
        aplicarEspejoVideoComida();

        const st = document.getElementById("food-model-status");
        if (st) {
            st.textContent =
                foodVideoInputs.length >= 2
                    ? `Analizando · ${foodVideoInputs.length} cámaras detectadas`
                    : `Analizando · modo ${foodCamFacingMode}`;
        }

        poblarSelectFoodCam();
        const selFood = document.getElementById("select-food-cam");
        if (selFood) {
            selFood.addEventListener("change", () => {
                aplicarCamaraFoodSeleccionada();
            });
        }

        registrarVisibilidadFood();
        foodInferMsEma = 0;
        foodAnalysisIntervalMs = 2000;
        FOOD_PRED_HISTORY.length = 0;
        analizarFotogramaComida();
        programarSiguienteAnalisisComida();
    } catch (e) {
        console.error(e);
        cerrarCamaraComida();
        alert(mensajeErrorCamaraFood(e));
    }
}

window.generarPlanNutricional = generarPlanNutricional;
window.agregarComida = agregarComida;
window.agregarComidaManual = agregarComidaManual;
window.añadirRecetaAlDiario = añadirRecetaAlDiario;
window.borrar = borrar;
window.scrollRecetas = scrollRecetas;
window.agregarAgua = agregarAgua;
window.abrirCamara = abrirCamara;
window.cerrarCamaraComida = cerrarCamaraComida;
window.cambiarCamaraComida = cambiarCamaraComida;
window.alternarEspejoComida = alternarEspejoComida;
