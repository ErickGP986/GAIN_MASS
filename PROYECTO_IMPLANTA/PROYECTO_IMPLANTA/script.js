/* Script compartido para home.html, perfil.html y páginas con cabecera */

function toggleMenu() {
  const menu = document.getElementById("menuPerfil");
  if (!menu) return;

  const currentDisplay = window.getComputedStyle(menu).display;
  menu.style.display = currentDisplay === "none" ? "flex" : "none";
}

async function cerrarSesion() {
  // Mantén el calendario si quieres; por defecto limpiamos todo para “cerrar sesión”
  localStorage.removeItem("usuario");
  localStorage.removeItem("correo");
  localStorage.removeItem("premium");
  localStorage.removeItem("edad");
  localStorage.removeItem("sexo");

  // Opcional: limpia también claves del calendario (formato: año_mes_dia)
  // Si prefieres conservar el histórico, elimina este bloque.
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && /^\d{4}_\d{1,2}_\d{1,2}$/.test(key)) {
      localStorage.removeItem(key);
    }
  }

  try {
    await fetch("/api/logout", { method: "POST" });
  } catch (error) {
    console.error(error);
  }

  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", () => {
  // Exponer funciones para los onclick del HTML
  window.toggleMenu = toggleMenu;
  window.cerrarSesion = cerrarSesion;

  // Cerrar el menú si se hace click fuera
  document.addEventListener("click", (event) => {
    const menu = document.getElementById("menuPerfil");
    const icono = document.getElementById("perfilIcono");
    if (!menu || !icono) return;

    const clickDentro = icono.contains(event.target) || menu.contains(event.target);
    if (!clickDentro) menu.style.display = "none";
  });

  // Mostrar datos del usuario en perfil, si existen elementos
  const nombrePerfil = document.getElementById("nombrePerfil");
  const edadPerfil = document.getElementById("edadPerfil");

  if (nombrePerfil) {
    nombrePerfil.textContent = localStorage.getItem("usuario") || "Usuario";
  }
  if (edadPerfil) {
    edadPerfil.textContent = "Edad: " + (localStorage.getItem("edad") || "--");
  }

  // Calendario dinámico (solo si existe en la página)
  const mesTexto = document.getElementById("mesActual");
  const diasContenedor = document.getElementById("diasCalendario");
  if (!mesTexto || !diasContenedor) return;

  let fecha = new Date();

  function generarCalendario() {
    const año = fecha.getFullYear();
    const mes = fecha.getMonth();

    const primerDia = new Date(año, mes, 1).getDay();
    const diasMes = new Date(año, mes + 1, 0).getDate();

    const nombresMes = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];

    mesTexto.textContent = `${nombresMes[mes]} ${año}`;
    diasContenedor.innerHTML = "";

    for (let i = 0; i < primerDia; i++) {
      diasContenedor.appendChild(document.createElement("div"));
    }

    for (let dia = 1; dia <= diasMes; dia++) {
      const div = document.createElement("div");
      div.textContent = String(dia);
      div.classList.add("dia");

      const clave = `${año}_${mes}_${dia}`;
      if (localStorage.getItem(clave) === "entrenado") div.classList.add("entrenado");

      div.addEventListener("click", () => {
        div.classList.toggle("entrenado");
        if (div.classList.contains("entrenado")) {
          localStorage.setItem(clave, "entrenado");
        } else {
          localStorage.removeItem(clave);
        }
      });

      diasContenedor.appendChild(div);
    }
  }

  const botonAnterior = document.getElementById("mesAnterior");
  const botonSiguiente = document.getElementById("mesSiguiente");

  if (botonAnterior) {
    botonAnterior.addEventListener("click", () => {
      fecha.setMonth(fecha.getMonth() - 1);
      generarCalendario();
    });
  }

  if (botonSiguiente) {
    botonSiguiente.addEventListener("click", () => {
      fecha.setMonth(fecha.getMonth() + 1);
      generarCalendario();
    });
  }

  generarCalendario();
});

// ===== LÓGICA DE BIENVENIDA DINÁMICA GAIN MASS (ESTILO PRO) =====
const frases = [
  "¿Listo para entrenar hoy?",
  "El intentarlo es el primer paso.",
  "Tus músculos no crecen en la zona de confort.",
  "La disciplina es el puente entre metas y logros.",
  "Un entrenamiento a la vez, un gramo a la vez.",
  "Tu mejor versión se construye hoy.",
  "Ingeniería corporal en proceso.",
  "No te detengas hasta que te guste lo que vez"
];

const contenedorFrase = document.getElementById("frase-motivadora");
const usuarioSpan = document.getElementById("usuarioActual");

// 1. Cargar el nombre (Se queda fijo y con estilo)
if (usuarioSpan) {
  const nombreGuardado = localStorage.getItem("usuario");
  if (nombreGuardado) {
    usuarioSpan.textContent = nombreGuardado;
    usuarioSpan.style.color = "#ff7a00"; // Asegura el color naranja de Gain Mass
    usuarioSpan.style.fontWeight = "800";
  }
}

// 2. Lógica de Rotación Infinita con Transición Suave
if (contenedorFrase) {
  let indice = 0;
  
  // Estilo inicial para asegurar que la transición funcione
  contenedorFrase.style.transition = "opacity 0.8s ease-in-out, transform 0.8s ease-in-out";
  contenedorFrase.style.opacity = "1";

  function cambiarFraseAuto() {
    // 1. Desaparece y sube un poco (Fade out + Slide)
    contenedorFrase.style.opacity = 0;
    contenedorFrase.style.transform = "translateY(-5px)";

    setTimeout(() => {
      // 2. Cambia el texto
      indice = (indice + 1) % frases.length;
      contenedorFrase.textContent = frases[indice];
      
      // Reset de posición para el efecto de entrada
      contenedorFrase.style.transform = "translateY(5px)";
      
      // 3. Aparece y baja a su lugar (Fade in + Slide)
      setTimeout(() => {
        contenedorFrase.style.opacity = 1;
        contenedorFrase.style.transform = "translateY(0)";
      }, 50);
    }, 800); 
  }

  // Ejecutar el cambio cada 5 segundos
  setInterval(cambiarFraseAuto, 5000);
}
// =======================================================

//video index//
// Lógica para que el video no tenga cortes bruscos
const v1 = document.getElementById('video1');
const v2 = document.getElementById('video2');

if (v1 && v2) {
    v1.addEventListener('timeupdate', () => {
        if (v1.currentTime > v1.duration - 0.5) { // 0.5 segundos antes de acabar
            v2.play();
            v2.classList.add('active');
            v1.classList.remove('active');
        }
    });
    v2.addEventListener('timeupdate', () => {
        if (v2.currentTime > v2.duration - 0.5) {
            v1.play();
            v1.classList.add('active');
            v2.classList.remove('active');
        }
    });
}