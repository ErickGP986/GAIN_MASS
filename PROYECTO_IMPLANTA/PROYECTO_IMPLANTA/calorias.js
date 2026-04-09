// 1. BASE DE DATOS DE ALIMENTOS (Para registro manual)
const alimentosDB = {
    pollo: { nombre: "Pechuga de Pollo", cal100: 165, p: 31, c: 0, g: 3.6 },
    arroz: { nombre: "Arroz Blanco", cal100: 130, p: 2.7, c: 28, g: 0.3 },
    huevo: { nombre: "Huevo (Unidad)", cal100: 70, p: 6, c: 0, g: 5 },
    atun: { nombre: "Atún", cal100: 132, p: 28, c: 0, g: 1 },
    avena: { nombre: "Avena", cal100: 389, p: 16, c: 66, g: 7 }
};

// 2. BASE DE DATOS DE RECETAS (Categorizadas)
const recetasDB = [
    { tipo: 'masa', nombre: "Batido Bulk", cal: 900, p: 45, c: 120, g: 25, desc: "Avena, leche, maní y proteína." },
    { tipo: 'masa', nombre: "Pasta con Res", cal: 650, p: 35, c: 85, g: 12, desc: "Pasta integral con carne magra." },
    { tipo: 'energia', nombre: "Bowl Energético", cal: 400, p: 8, c: 80, g: 5, desc: "Fruta, miel y granola." },
    { tipo: 'energia', nombre: "Tostadas Miel", cal: 300, p: 6, c: 60, g: 4, desc: "Pan integral con miel y plátano." },
    { tipo: 'snack', nombre: "Yogur Pro", cal: 200, p: 20, c: 15, g: 2, desc: "Yogur griego y fresas." },
    { tipo: 'snack', nombre: "Mix de Nueces", cal: 250, p: 7, c: 10, g: 18, desc: "Almendras y nueces." }
];

// 3. BASE DE DATOS DE CONSEJOS (Smart Tips)
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

let usuarioEsPremium = false;

// --- FUNCIONES DE INICIO ---

document.addEventListener('DOMContentLoaded', async () => {
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

    // Cargar meta guardada o poner 2500 por defecto
    const meta = localStorage.getItem("metaGainMass") || 2500;
    const elMeta = document.getElementById('calMeta');
    if(elMeta) elMeta.innerText = meta;
    
    // Iniciar Smart Tips
    cargarTipAleatorio();
    setInterval(cargarTipAleatorio, 6000); // Cambia cada 6 segundos

    // Cargar interfaz
    filtrarRecetas('todas');
    mostrarComidas();
});

// Función para cambiar el texto del consejo con efecto suave
function cargarTipAleatorio() {
    const elementoTip = document.getElementById('texto-tip');
    if(elementoTip) {
        elementoTip.style.opacity = 0;
        setTimeout(() => {
            const indice = Math.floor(Math.random() * smartTips.length);
            elementoTip.innerText = smartTips[indice];
            elementoTip.style.opacity = 1;
        }, 500);
    }
}

// --- LÓGICA DE CÁLCULOS ---

function generarPlanNutricional() {
    const p = parseFloat(document.getElementById('peso').value);
    const a = parseFloat(document.getElementById('altura').value);
    const e = parseInt(document.getElementById('edad').value);
    const act = parseFloat(document.getElementById('nivelActividad').value);

    if (!p || !a || !e) { alert("Jessica, por favor completa todos los campos."); return; }

    // Fórmula Harris-Benedict (Hombres/General simplificado para el proyecto)
    let tmb = (10 * p) + (6.25 * a) - (5 * e) + 5; 
    let meta = Math.round((tmb * act) * 1.15); // +15% para Superávit Calórico (Gain Mass)
    
    localStorage.setItem("metaGainMass", meta);
    document.getElementById('calMeta').innerText = meta;
    document.getElementById('resultado-biometrico').innerHTML = `Meta establecida: <strong>${meta} kcal</strong> | IMC: ${(p/((a/100)**2)).toFixed(1)}`;
    mostrarComidas(); // Actualiza la barra con la nueva meta
}

function agregarComida() {
    const id = document.getElementById('alimento').value;
    const gramos = parseFloat(document.getElementById('cantidad').value);
    if (!gramos || gramos <= 0) { alert("Ingresa una cantidad válida."); return; }

    const info = alimentosDB[id];
    const item = {
        n: info.nombre,
        cal: Math.round((info.cal100 * gramos) / 100),
        p: Math.round((info.p * gramos) / 100),
        c: Math.round((info.c * gramos) / 100),
        g: Math.round((info.g * gramos) / 100)
    };

    let historial = JSON.parse(localStorage.getItem("historialComidas")) || [];
    historial.push(item);
    localStorage.setItem("historialComidas", JSON.stringify(historial));
    mostrarComidas();
}

function mostrarComidas() {
    const historial = JSON.parse(localStorage.getItem("historialComidas")) || [];
    const lista = document.getElementById('listaComidas');
    const meta = localStorage.getItem("metaGainMass") || 2500;
    let tCal = 0, tP = 0, tC = 0, tG = 0;

    lista.innerHTML = "";
    historial.forEach((item, i) => {
        tCal += item.cal; tP += item.p; tC += item.c; tG += item.g;
        lista.innerHTML += `
            <tr>
                <td>${item.n}</td>
                <td>${item.cal}</td>
                <td>${item.p}P | ${item.c}C | ${item.g}G</td>
                <td><button onclick="borrar(${i})" style="color:#ff4444; background:none; border:none; cursor:pointer; font-size:1.2rem;">&times;</button></td>
            </tr>`;
    });

    // Actualizar números en pantalla
    document.getElementById('calConsumidas').innerText = tCal;
    document.getElementById('mProte').innerText = tP + "g";
    document.getElementById('mCarbo').innerText = tC + "g";
    document.getElementById('mGrasa').innerText = tG + "g";
    
    // Actualizar barra de progreso
    const porcentaje = Math.min((tCal / meta) * 100, 100);
    document.getElementById('barra-interna').style.width = porcentaje + "%";
}

function borrar(i) {
    let historial = JSON.parse(localStorage.getItem("historialComidas"));
    historial.splice(i, 1);
    localStorage.setItem("historialComidas", JSON.stringify(historial));
    mostrarComidas();
}

// --- INTERFAZ DE RECETAS ---

function filtrarRecetas(cat) {
    // Manejo de botones activos
    document.querySelectorAll('.btn-filtro').forEach(b => b.classList.remove('active'));
    if(event && event.target.classList.contains('btn-filtro')) {
        event.target.classList.add('active');
    }

    const filtradas = cat === 'todas' ? recetasDB : recetasDB.filter(r => r.tipo === cat);
    const wrapper = document.getElementById('wrapper-recetas');
    
    wrapper.innerHTML = filtradas.map(r => `
        <div class="receta-card">
            <span class="cal-badge"><i class="fa-solid fa-fire-flame-curved"></i> ${r.cal} kcal</span>
            <h4 style="margin:5px 0; color:var(--azul-cian); font-size:1.1rem;">${r.nombre}</h4>
            <p style="font-size:0.8rem; color:#aaa; margin-bottom:10px;">${r.desc}</p>
            <div style="display:flex; justify-content:space-between; font-size:0.85rem; background:rgba(0,0,0,0.5); padding:8px; border-radius:8px; border: 1px solid rgba(255,255,255,0.05);">
                <span><strong>P:</strong> ${r.p}g</span>
                <span><strong>C:</strong> ${r.c}g</span>
                <span><strong>G:</strong> ${r.g}g</span>
            </div>
        </div>
    `).join('');
}

function scrollRecetas(dir) {
    document.getElementById('wrapper-recetas').scrollBy({ left: dir * 280, behavior: 'smooth' });
}

// --- EXTRAS ---

let agua = 0;
function agregarAgua() {
    agua = Math.min(agua + 1, 10);
    document.getElementById('conteo-agua').innerText = agua;
    document.getElementById('barra-agua').style.width = (agua * 10) + "%";
}

async function abrirCamara() {
    if (!usuarioEsPremium) {
        alert("Esta función requiere GAIN MASS PREMIUM.\n\nInicia sesión con una cuenta premium o contrata el plan en la sección Premium.");
        return;
    }
    const cont = document.getElementById('contenedor-camara');
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        cont.innerHTML = `<video id="v" autoplay playsinline style="width:100%; border-radius:15px; border: 2px solid var(--naranja-gain);"></video>`;
        document.getElementById('v').srcObject = stream;
    } catch (e) { 
        alert("No se pudo acceder a la cámara. Asegúrate de dar permisos."); 
    }
}