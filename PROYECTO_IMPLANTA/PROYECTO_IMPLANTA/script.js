/* Script compartido para home.html, perfil.html y páginas con cabecera */

const LS_FOTO_PERFIL = "gainmass_foto_perfil";
const MAX_FOTO_DATA_URL = 950000;

function escapeHtmlPerfil(s) {
  if (s == null) return "";
  const d = document.createElement("div");
  d.textContent = String(s);
  return d.innerHTML;
}

function formatearEstaturaPerfilHtml(alturaRaw) {
  const n = parseFloat(String(alturaRaw).replace(",", "."));
  if (isNaN(n)) return escapeHtmlPerfil(alturaRaw || "");
  if (n > 0 && n < 3) {
    const cm = Math.round(n * 100);
    return `${n} m <span class="perfil-subunidad">(${cm} cm)</span>`;
  }
  return `${n} cm`;
}

function imcPerfilMostrado(imcRaw, pesoRaw, alturaRaw) {
  const v = parseFloat(String(imcRaw).replace(",", "."));
  if (!isNaN(v) && v >= 12 && v <= 60) return v.toFixed(1);
  const p = parseFloat(pesoRaw);
  const a = parseFloat(String(alturaRaw).replace(",", "."));
  if (!isNaN(p) && !isNaN(a) && p > 0 && a > 0) {
    let cm = a;
    if (a > 0 && a < 3) cm = a * 100;
    if (cm > 40 && cm < 260) {
      const im = p / Math.pow(cm / 100, 2);
      if (im >= 12 && im < 65) return im.toFixed(1);
    }
  }
  if (!isNaN(v) && v > 0 && v < 200) return v.toFixed(1);
  return "—";
}

function redimensionarImagenDataUrl(file, maxLado, calidadJpeg) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      const escala = Math.min(1, maxLado / Math.max(w, h));
      w = Math.max(1, Math.round(w * escala));
      h = Math.max(1, Math.round(h * escala));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      try {
        resolve(canvas.toDataURL("image/jpeg", calidadJpeg));
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen."));
    };
    img.src = url;
  });
}

async function guardarFotoPerfilDesdeArchivo(file, imgEl) {
  if (!file || !file.type.startsWith("image/")) {
    alert("Elige un archivo de imagen (JPG, PNG, WebP o GIF).");
    return;
  }
  if (file.size > 8 * 1024 * 1024) {
    alert("La imagen es demasiado grande (máximo 8 MB).");
    return;
  }
  let dataUrl = await redimensionarImagenDataUrl(file, 400, 0.82);
  if (dataUrl.length > MAX_FOTO_DATA_URL) {
    dataUrl = await redimensionarImagenDataUrl(file, 280, 0.75);
  }
  if (dataUrl.length > MAX_FOTO_DATA_URL) {
    alert("La imagen sigue siendo muy pesada para guardarla en el navegador. Prueba con otra más pequeña.");
    return;
  }
  localStorage.setItem(LS_FOTO_PERFIL, dataUrl);
  if (imgEl) {
    imgEl.onerror = null;
    imgEl.src = dataUrl;
  }
}

function aplicarImagenPerfil(imgPerfil, nombre) {
  if (!imgPerfil) return;
  const guardada = localStorage.getItem(LS_FOTO_PERFIL);
  if (guardada && guardada.startsWith("data:image")) {
    imgPerfil.onerror = null;
    imgPerfil.src = guardada;
    return;
  }
  imgPerfil.src = "img/perfil.png";
  const enc = encodeURIComponent(nombre || "Usuario");
  const avatarApi = `https://ui-avatars.com/api/?name=${enc}&background=ff7a00&color=fff&size=180`;
  imgPerfil.addEventListener(
    "error",
    function fallbac() {
      imgPerfil.removeEventListener("error", fallbac);
      if (!imgPerfil.src.includes("ui-avatars.com")) imgPerfil.src = avatarApi;
    },
    { once: true }
  );
}

function actualizarBotonQuitarFoto() {
  const btn = document.getElementById("btnQuitarFoto");
  if (!btn) return;
  const hay = !!(localStorage.getItem(LS_FOTO_PERFIL) || "").startsWith("data:image");
  btn.classList.toggle("oculto", !hay);
}

function initControlesFotoPerfil() {
  const input = document.getElementById("inputFotoPerfil");
  const btnElegir = document.getElementById("btnElegirFoto");
  const btnQuitar = document.getElementById("btnQuitarFoto");
  const img = document.getElementById("imgPerfil");
  if (!input || !btnElegir || !img) return;

  actualizarBotonQuitarFoto();

  btnElegir.addEventListener("click", () => input.click());

  input.addEventListener("change", async () => {
    const file = input.files && input.files[0];
    input.value = "";
    if (!file) return;
    try {
      await guardarFotoPerfilDesdeArchivo(file, img);
      actualizarBotonQuitarFoto();
    } catch (e) {
      console.error(e);
      alert("No se pudo guardar la foto. Prueba con otra imagen.");
    }
  });

  if (btnQuitar) {
    btnQuitar.addEventListener("click", () => {
      localStorage.removeItem(LS_FOTO_PERFIL);
      aplicarImagenPerfil(img, localStorage.getItem("usuario") || "Usuario");
      actualizarBotonQuitarFoto();
    });
  }
}

function toggleMenu() {
  const menu = document.getElementById("menuPerfil");
  if (!menu) return;

  const currentDisplay = window.getComputedStyle(menu).display;
  menu.style.display = currentDisplay === "none" ? "flex" : "none";
}

async function cerrarSesion() {
  if (typeof GainMassLocal !== "undefined") {
    GainMassLocal.clearLocalSessionFlag();
  }
  // Mantén el calendario si quieres; por defecto limpiamos todo para “cerrar sesión”
  localStorage.removeItem("usuario");
  localStorage.removeItem("correo");
  localStorage.removeItem("premium");
  localStorage.removeItem("edad");
  localStorage.removeItem("sexo");
  localStorage.removeItem("altura_cm");
  localStorage.removeItem("peso_kg");
  localStorage.removeItem("imc_ultimo");
  localStorage.removeItem("gainmass_foto_perfil");

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

  async function actualizarPanelPerfil() {
    const nombrePerfil = document.getElementById("nombrePerfil");
    const correoPerfil = document.getElementById("correoPerfil");
    const datosBio = document.getElementById("datosBioPerfil");
    const perfilSinDatos = document.getElementById("perfilSinDatos");
    const imgPerfil = document.getElementById("imgPerfil");

    if (!nombrePerfil && !datosBio) return;

    function aplicarRegistroPerfil(reg) {
      if (!reg) return;
      localStorage.setItem("edad", String(reg.edad));
      if (reg.sexo) localStorage.setItem("sexo", reg.sexo);
      localStorage.setItem("altura_cm", String(reg.altura_cm));
      localStorage.setItem("peso_kg", String(reg.peso_kg));
      localStorage.setItem("imc_ultimo", String(reg.imc));
    }

    try {
      const r = await fetch("/api/imc/latest");
      if (typeof GainMassLocal !== "undefined" && GainMassLocal.responseIsJson(r) && r.ok) {
        const d = await r.json();
        if (d.registro) aplicarRegistroPerfil(d.registro);
      }
    } catch (_) {}

    if (typeof GainMassLocal !== "undefined") {
      const loc = GainMassLocal.getImcRegistro();
      if (loc && !localStorage.getItem("imc_ultimo")) aplicarRegistroPerfil(loc);
    }

    const nombre = localStorage.getItem("usuario") || "Usuario";
    if (nombrePerfil) nombrePerfil.textContent = nombre;

    if (correoPerfil) {
      const c = localStorage.getItem("correo");
      correoPerfil.textContent = c || "";
      correoPerfil.style.display = c ? "block" : "none";
    }

    aplicarImagenPerfil(imgPerfil, nombre);

    if (datosBio) {
      datosBio.innerHTML = "";
      const edad = localStorage.getItem("edad");
      const sexo = localStorage.getItem("sexo");
      const altura = localStorage.getItem("altura_cm");
      const peso = localStorage.getItem("peso_kg");
      const imc = localStorage.getItem("imc_ultimo");
      const sexoLabels = {
        masculino: "Masculino",
        femenino: "Femenino",
        otro: "Otro / prefiero no decir",
      };
      const sexoTxt = sexo ? sexoLabels[sexo] || sexo : "";

      const filas = [];
      if (edad) {
        filas.push(
          `<li><span class="perfil-meta-label">Edad</span><span class="perfil-meta-valor">${escapeHtmlPerfil(edad)} años</span></li>`
        );
      }
      if (altura) {
        filas.push(
          `<li><span class="perfil-meta-label">Estatura</span><span class="perfil-meta-valor">${formatearEstaturaPerfilHtml(altura)}</span></li>`
        );
      }
      if (peso) {
        filas.push(
          `<li><span class="perfil-meta-label">Peso</span><span class="perfil-meta-valor">${escapeHtmlPerfil(peso)} kg <span class="perfil-subunidad">(último registro)</span></span></li>`
        );
      }
      if (sexoTxt) {
        filas.push(
          `<li><span class="perfil-meta-label">Sexo</span><span class="perfil-meta-valor">${escapeHtmlPerfil(sexoTxt)}</span></li>`
        );
      }
      if (imc) {
        const imcTxt = imcPerfilMostrado(imc, peso, altura);
        filas.push(
          `<li><span class="perfil-meta-label">IMC</span><span class="perfil-meta-valor">${imcTxt}</span></li>`
        );
      }

      if (filas.length) {
        datosBio.innerHTML = filas.join("");
        if (perfilSinDatos) perfilSinDatos.classList.add("oculto");
      } else if (perfilSinDatos) {
        perfilSinDatos.classList.remove("oculto");
      }
    }
  }

  actualizarPanelPerfil().then(() => initControlesFotoPerfil());

  function renderPerfilSeccionHabitos() {
    if (typeof GainMassHabitosResumen === "undefined") return;
    const pctGlob = document.getElementById("perfilHabPct");
    if (!pctGlob) return;

    const s = GainMassHabitosResumen.getSnapshot();
    const intro = document.getElementById("perfilHabitosIntro");
    const bar = document.getElementById("barraPerfilHabitos");
    const rachaEl = document.getElementById("perfilHabRacha");
    const claveEl = document.getElementById("perfilHabClave");
    const priWrap = document.getElementById("perfilPrioridadesWrap");
    const barPri = document.getElementById("barraPerfilPrioridades");
    const pctPri = document.getElementById("perfilPctPrioridades");
    const chips = document.getElementById("perfilChipsPrioridades");
    const vacio = document.getElementById("perfilHabitosVacio");

    if (intro) {
      if (s.pctGlobal >= 100) {
        intro.textContent =
          "¡Hoy completaste el 100% del tablero de hábitos! Mantén la constancia.";
      } else if (s.pctGlobal >= 80) {
        intro.textContent =
          "Vas muy bien con tus hábitos de hoy. Un empujón más y cierras el día redondo.";
      } else if (s.racha > 0) {
        intro.textContent = `Llevas ${s.racha} día${s.racha === 1 ? "" : "s"} de racha registrando buenos hábitos.`;
      } else {
        intro.textContent =
          "Tu progreso de hoy se calcula desde el tablero de Objetivos diarios (hábitos con peso).";
      }
    }

    pctGlob.textContent = s.pctGlobal + "%";
    if (rachaEl) rachaEl.textContent = String(s.racha);
    if (claveEl)
      claveEl.textContent = `${s.requeridosOk}/${s.requeridosTotal}`;

    if (bar) {
      const p = Math.min(s.pctGlobal, 100);
      bar.style.width = p + "%";
      if (p < 40) bar.style.background = "linear-gradient(90deg, rgba(0, 183, 255, 0.55), rgba(0, 183, 255, 0.9))";
      else if (p < 80) bar.style.background = "linear-gradient(90deg, #00b7ff, #ff7a00)";
      else bar.style.background = "linear-gradient(90deg, #ff7a00, #00e6a8)";
    }

    const hayPri = s.prioridades && s.prioridades.length > 0;
    if (priWrap) priWrap.classList.toggle("oculto", !hayPri);
    if (vacio) vacio.classList.toggle("oculto", hayPri);

    if (hayPri && s.pctPrioridades != null) {
      if (pctPri) pctPri.textContent = String(s.pctPrioridades);
      if (barPri) {
        const p = Math.min(s.pctPrioridades, 100);
        barPri.style.width = p + "%";
      }
    }

    if (chips) {
      chips.innerHTML = "";
      if (hayPri) {
        s.prioridades.forEach((h) => {
          const span = document.createElement("span");
          span.className = "perfil-hab-chip";
          span.textContent = h.titulo;
          span.title = h.titulo;
          chips.appendChild(span);
        });
      }
    }
  }

  renderPerfilSeccionHabitos();

  /** Resumen de progreso: calendario (días entrenados) + estimación tiempo y kcal */
  function contarDiasEntrenadosTotal() {
    let n = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || localStorage.getItem(k) !== "entrenado") continue;
      if (!/^\d{4}_\d{1,2}_\d{1,2}$/.test(k)) continue;
      n++;
    }
    return n;
  }

  function estadisticasMesActual() {
    const d = new Date();
    const y = d.getFullYear();
    const m = d.getMonth();
    const diasEnMes = new Date(y, m + 1, 0).getDate();
    const diaHoy = d.getDate();
    let ent = 0;
    for (let dia = 1; dia <= diasEnMes; dia++) {
      if (localStorage.getItem(`${y}_${m}_${dia}`) === "entrenado") ent++;
    }
    const diasTranscurridos = Math.min(diaHoy, diasEnMes);
    const consistencia =
      diasTranscurridos > 0
        ? Math.min(100, Math.round((ent / diasTranscurridos) * 100))
        : 0;
    return { ent, diasEnMes, diasTranscurridos, consistencia };
  }

  function minutosPorSesionEntreno() {
    const v = parseInt(localStorage.getItem("gainmass_min_por_sesion") || "70", 10);
    if (isNaN(v)) return 70;
    return Math.min(180, Math.max(30, v));
  }

  function pesoParaEstimacionKcal() {
    const p = parseFloat(localStorage.getItem("peso_kg") || "");
    if (!isNaN(p) && p >= 35 && p <= 250) return p;
    return 75;
  }

  function formatearMinutosTotales(min) {
    const m = Math.max(0, Math.round(min));
    if (m < 60) return `${m} min`;
    const h = Math.floor(m / 60);
    const rest = m % 60;
    if (rest === 0) return `${h}h`;
    return `${h}h ${rest}m`;
  }

  function siguienteHitoDias(actual) {
    const hitos = [5, 10, 15, 20, 25, 50, 75, 100, 150, 200];
    for (let i = 0; i < hitos.length; i++) {
      if (hitos[i] > actual) return { meta: hitos[i], faltan: hitos[i] - actual };
    }
    const meta = Math.ceil((actual + 1) / 25) * 25;
    return { meta, faltan: meta - actual };
  }

  function actualizarResumenProgreso() {
    const elDias = document.getElementById("resumenDiasEntrenados");
    if (!elDias) return;

    const totalDias = contarDiasEntrenadosTotal();
    const minSes = minutosPorSesionEntreno();
    const minutosTotales = totalDias * minSes;
    const horasTotales = minutosTotales / 60;
    const peso = pesoParaEstimacionKcal();
    const MET = 5.5;
    const kcal = Math.round(MET * peso * horasTotales);

    const elTiempo = document.getElementById("resumenTiempoTotal");
    const elKcal = document.getElementById("resumenKcalQuemadas");
    elDias.textContent = String(totalDias);
    if (elTiempo) elTiempo.textContent = formatearMinutosTotales(minutosTotales);
    if (elKcal) {
      elKcal.textContent =
        kcal >= 1000 ? `${(kcal / 1000).toFixed(kcal % 1000 === 0 ? 1 : 2)}k` : String(kcal);
    }

    const ul = document.getElementById("resumenInsights");
    if (!ul) return;

    const { ent, diasTranscurridos, consistencia } = estadisticasMesActual();
    const hito = siguienteHitoDias(totalDias);
    const ahora = new Date();
    const meses = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ];

    const lineas = [];
    lineas.push(
      `<li><span class="perfil-meta-label">Este mes (${meses[ahora.getMonth()]})</span><span class="perfil-meta-valor">${ent} día${ent === 1 ? "" : "s"} marcado${ent === 1 ? "" : "s"} como entrenado</span></li>`
    );
    lineas.push(
      `<li><span class="perfil-meta-label">Consistencia (mes en curso)</span><span class="perfil-meta-valor">${consistencia}% · ${diasTranscurridos} días transcurridos</span></li>`
    );
    if (totalDias > 0) {
      lineas.push(
        `<li><span class="perfil-meta-label">Cálculo tiempo y kcal</span><span class="perfil-meta-valor">~${minSes} min/sesión · MET ${MET} × ${Math.round(peso)} kg × ${horasTotales.toFixed(1)} h</span></li>`
      );
    }
    if (totalDias === 0) {
      lineas.push(
        `<li><span class="perfil-meta-label">Próximo paso</span><span class="perfil-meta-valor">Marca en el calendario los días que entrenaste para ver tu evolución aquí.</span></li>`
      );
    } else if (hito.faltan > 0) {
      lineas.push(
        `<li><span class="perfil-meta-label">Próximo hito</span><span class="perfil-meta-valor">${hito.faltan} día${hito.faltan === 1 ? "" : "s"} más → ${hito.meta} entrenos registrados</span></li>`
      );
    }

    ul.innerHTML = lineas.join("");
  }

  actualizarResumenProgreso();

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
        actualizarResumenProgreso();
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