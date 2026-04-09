/* --- BASE DE DATOS DE ALIMENTOS (Valores por 100g/unid) --- */
const alimentosDB = {
    pollo: { nombre: "Pechuga de Pollo", cal100: 165, p: 31, c: 0, g: 3.6 },
    arroz: { nombre: "Arroz Blanco", cal100: 130, p: 2.7, c: 28, g: 0.3 },
    huevo: { nombre: "Huevo (Pza)", cal100: 78, p: 6.3, c: 0.6, g: 5.3 }, // por unidad grande
    avena: { nombre: "Avena", cal100: 389, p: 16.9, c: 66, g: 6.9 },
    batido: { nombre: "Batido Ganador", cal100: 850, p: 50, c: 110, g: 20 } // Especial Gain Mass
};

/* --- VARIABLES DE ESTADO --- */
let metaCalorias = 2500;
let consumido = { cal: 0, p: 0, c: 0, g: 0 };
let esPremium = false; // Cambia a true para probar el modo desbloqueado

/* --- 1. CÁLCULO BIOMÉTRICO (UNITEC PROYECTO) --- */
function generarPlanNutricional() {
    const peso = parseFloat(document.getElementById('peso').value);
    const altura = parseFloat(document.getElementById('altura').value);
    const edad = parseInt(document.getElementById('edad').value);
    const actividad = parseFloat(document.getElementById('nivelActividad').value);

    if (!peso || !altura || !edad) {
        alert("Por favor, llena tus datos biométricos primero.");
        return;
    }

    // Fórmula de Harris-Benedict para hombres (ajustar si es necesario)
    let tmb = (10 * peso) + (6.25 * altura) - (5 * edad) + 5;
    let mantenimiento = tmb * actividad;
    
    // Objetivo: GAIN MASS (Superávit de 500 kcal)
    metaCalorias = Math.round(mantenimiento + 500);

    document.getElementById('calMeta').innerText = metaCalorias;
    document.getElementById('resultado-biometrico').innerHTML = `
        <div style="color: #00ff9c;">✅ Meta establecida: ${metaCalorias} kcal para ganar masa.</div>
        <small>Tu gasto base es de ${Math.round(mantenimiento)} kcal.</small>
    `;
    actualizarBarra();
}

/* --- 2. REGISTRO DE COMIDAS --- */
function agregarComida() {
    const tiempo = document.getElementById('tiempoComida').value;
    const idAlimento = document.getElementById('alimento').value;
    const cantidad = parseFloat(document.getElementById('cantidad').value);

    if (!cantidad || cantidad <= 0) {
        alert("Ingresa una cantidad válida.");
        return;
    }

    const info = alimentosDB[idAlimento];
    // Si es huevo o batido es por unidad, si no, es por cada 100g
    const factor = (idAlimento === 'huevo' || idAlimento === 'batido') ? cantidad : cantidad / 100;

    const nuevasCal = Math.round(info.cal100 * factor);
    const nuevasP = Math.round(info.p * factor);
    const nuevasC = Math.round(info.c * factor);
    const nuevasG = Math.round(info.g * factor);

    // Actualizar totales
    consumido.cal += nuevasCal;
    consumido.p += nuevasP;
    consumido.c += nuevasC;
    consumido.g += nuevasG;

    // Renderizar en la tabla
    const tabla = document.getElementById('listaComidas');
    const fila = `
        <tr>
            <td><strong>${tiempo}</strong></td>
            <td>${info.nombre}</td>
            <td>${nuevasCal} kcal</td>
            <td>P: ${nuevasP}g | C: ${nuevasC}g | G: ${nuevasG}g</td>
            <td><button onclick="this.parentElement.parentElement.remove()" style="background:none; border:none; color:red; cursor:pointer;">❌</button></td>
        </tr>
    `;
    tabla.innerHTML += fila;

    actualizarInterfaz();
}

/* --- 3. ACTUALIZACIÓN DE UI --- */
function actualizarInterfaz() {
    document.getElementById('calConsumidas').innerText = consumido.cal;
    document.getElementById('mProte').innerText = consumido.p;
    document.getElementById('mCarbo').innerText = consumido.c;
    document.getElementById('mGrasa').innerText = consumido.g;
    
    actualizarBarra();
}

function actualizarBarra() {
    const porcentaje = (consumido.cal / metaCalorias) * 100;
    const barra = document.getElementById('barra-interna');
    barra.style.width = Math.min(porcentaje, 100) + "%";
    
    // Cambio de color si se pasa de la meta
    if (porcentaje > 100) {
        barra.style.background = "linear-gradient(90deg, #ff0000, #ff7a00)";
    }
}

/* --- 4. LÓGICA PREMIUM (CONTROL DE ACCESO) --- */
function gestionarPremium() {
    const seccionCamara = document.getElementById('wrapper-camara');
    const seccionRecetas = document.getElementById('wrapper-recetas');

    if (!esPremium) {
        // Aplicar bloqueo visual
        seccionCamara.classList.add('premium-locked');
        seccionRecetas.classList.add('premium-locked');
        
        // Insertar botón de compra (simulado)
        seccionCamara.innerHTML += `<div class="premium-badge"><i class="fa-solid fa-lock"></i> Bloqueado</div>`;
    } else {
        seccionCamara.classList.remove('premium-locked');
        seccionRecetas.classList.remove('premium-locked');
        // Quitar badges de bloqueo si existen
        document.querySelectorAll('.premium-badge').forEach(el => el.remove());
    }
}

// Función que llamarás desde el botón de la cámara
function abrirCamara() {
    if (!esPremium) {
        alert("💎 Esta función requiere GAIN MASS PREMIUM.\n\nBeneficios:\n- Reconocimiento de alimentos con IA\n- Recetas exclusivas para ectomorfos");
    } else {
        alert("Iniciando escáner de visión artificial...");
        // Aquí iría la lógica de MediaPipe
    }
}

// Ejecutar al iniciar
window.onload = () => {
    gestionarPremium();
};