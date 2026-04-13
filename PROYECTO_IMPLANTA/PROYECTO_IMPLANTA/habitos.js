/**
 * Tablero de hábitos: persistencia por día, pesos, racha, prioridades,
 * hidratación y pasos medibles, enlaces a otras secciones, historial 7 días.
 */
(function () {
  "use strict";

  const STORAGE_PREFIX = "gainmass_habitos_";
  const STREAK_KEY = "gainmass_habitos_streak_v1";
  const FOCUS_KEY = "gainmass_habitos_focus_v1";
  const HISTORY_KEY = "gainmass_habitos_history_v1";
  const TOAST_100_KEY = "gainmass_habitos_toast100_";

  const CATEGORIAS = [
    { id: "todos", label: "Todos" },
    { id: "nut", label: "Nutrición" },
    { id: "ent", label: "Entreno" },
    { id: "rec", label: "Recuperación" },
    { id: "men", label: "Mental" },
  ];

  const HABITOS = [
    {
      id: "hidratacion",
      cat: "nut",
      titulo: "💧 Hidratación (3L)",
      desc: "12 vasos de ~250 ml. Fundamental para el transporte de nutrientes.",
      tipo: "counter",
      max: 12,
      weight: 2,
      required: true,
    },
    {
      id: "proteina",
      cat: "nut",
      titulo: "🍗 Proteína Base",
      desc: "Consumir 1.5g - 2g de proteína por kilo.",
      tipo: "check",
      weight: 3,
      required: true,
      link: { href: "registro-comida.html", text: "Ir a alimentación" },
    },
    {
      id: "vegetales",
      cat: "nut",
      titulo: "🥗 Vegetales Verdes",
      desc: "Fibra para una mejor digestión.",
      tipo: "check",
      weight: 1,
      required: false,
      link: { href: "registro-comida.html", text: "Registrar comida" },
    },
    {
      id: "alcohol",
      cat: "nut",
      titulo: "🚫 Cero Alcohol",
      desc: "Evita frenar la síntesis de proteína.",
      tipo: "check",
      weight: 2,
      required: true,
    },
    {
      id: "desayuno",
      cat: "nut",
      titulo: "🍳 Desayuno Real",
      desc: "Sin ultraprocesados al iniciar el día.",
      tipo: "check",
      weight: 2,
      required: false,
    },
    {
      id: "rutina",
      cat: "ent",
      titulo: "🏋️ Rutina de Pesas",
      desc: "Completar el bloque programado.",
      tipo: "check",
      weight: 3,
      required: true,
      link: { href: "ejercicios.html", text: "Ver rutinas" },
    },
    {
      id: "calentamiento",
      cat: "ent",
      titulo: "🔥 Calentamiento Pro",
      desc: "Movilidad articular previa.",
      tipo: "check",
      weight: 2,
      required: true,
      link: { href: "calentamiento.html", text: "Calentamiento" },
    },
    {
      id: "pasos",
      cat: "ent",
      titulo: "🚶 10.000 Pasos",
      desc: "Mantenerse activo fuera del gym.",
      tipo: "steps",
      goal: 10000,
      weight: 2,
      required: false,
    },
    {
      id: "sobrecarga",
      cat: "ent",
      titulo: "📈 Sobrecarga",
      desc: "Intentar subir peso o repeticiones.",
      tipo: "check",
      weight: 1,
      required: false,
    },
    {
      id: "descansos",
      cat: "ent",
      titulo: "⏱️ Descansos",
      desc: "Respetar los 60-90 seg entre series.",
      tipo: "check",
      weight: 1,
      required: false,
    },
    {
      id: "sueno",
      cat: "rec",
      titulo: "😴 Sueño de Calidad",
      desc: "Mínimo 7 horas ininterrumpidas.",
      tipo: "check",
      weight: 3,
      required: true,
    },
    {
      id: "estiramiento",
      cat: "rec",
      titulo: "🧘 Estiramiento",
      desc: "Relajar los músculos al finalizar.",
      tipo: "check",
      weight: 1,
      required: false,
    },
    {
      id: "suplementos",
      cat: "rec",
      titulo: "💊 Suplementos",
      desc: "Creatina o vitaminas diarias.",
      tipo: "check",
      weight: 1,
      required: false,
    },
    {
      id: "ducha",
      cat: "rec",
      titulo: "🚿 Ducha Relajante",
      desc: "Bajar niveles de cortisol post-entreno.",
      tipo: "check",
      weight: 1,
      required: false,
    },
    {
      id: "sol",
      cat: "rec",
      titulo: "☀️ Sol (15 min)",
      desc: "Vitamina D y salud ósea.",
      tipo: "check",
      weight: 1,
      required: false,
    },
    {
      id: "detox",
      cat: "men",
      titulo: "📵 Detox Digital",
      desc: "Sin celular 30 min antes de dormir.",
      tipo: "check",
      weight: 1,
      required: false,
    },
    {
      id: "visualizacion",
      cat: "men",
      titulo: "🧠 Visualización",
      desc: "Repasar metas antes de empezar.",
      tipo: "check",
      weight: 1,
      required: false,
    },
    {
      id: "aprendizaje",
      cat: "men",
      titulo: "📖 Aprendizaje",
      desc: "Leer sobre técnica o nutrición.",
      tipo: "check",
      weight: 1,
      required: false,
    },
    {
      id: "refrescos",
      cat: "men",
      titulo: "🥤 Cero Refrescos",
      desc: "Sustituir por agua o infusiones.",
      tipo: "check",
      weight: 2,
      required: false,
    },
    {
      id: "diario",
      cat: "men",
      titulo: "📝 Diario",
      desc: "Anotar sensaciones del día.",
      tipo: "check",
      weight: 1,
      required: false,
    },
    {
      id: "agenda",
      cat: "men",
      titulo: "📅 Agenda Mañana",
      desc: "Planifica tus tareas para reducir estrés.",
      tipo: "check",
      weight: 1,
      required: false,
    },
  ];

  let tabActiva = "todos";
  let lastPctGlobal = 0;

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

  function yesterdayKey() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0")
    );
  }

  function dayStateKey(dateStr) {
    return STORAGE_PREFIX + dateStr;
  }

  function loadDayState(dateStr) {
    try {
      return JSON.parse(localStorage.getItem(dayStateKey(dateStr)) || "{}");
    } catch {
      return {};
    }
  }

  function saveDayState(dateStr, state) {
    localStorage.setItem(dayStateKey(dateStr), JSON.stringify(state));
  }

  function loadFocusIds() {
    try {
      const raw = JSON.parse(localStorage.getItem(FOCUS_KEY) || "[]");
      return Array.isArray(raw)
        ? raw.filter((id) => HABITOS.some((h) => h.id === id)).slice(0, 5)
        : [];
    } catch {
      return [];
    }
  }

  function saveFocusIds(ids) {
    const u = [...new Set(ids)].slice(0, 5);
    localStorage.setItem(FOCUS_KEY, JSON.stringify(u));
  }

  function loadStreakMeta() {
    try {
      return JSON.parse(
        localStorage.getItem(STREAK_KEY) || '{"count":0,"last":""}'
      );
    } catch {
      return { count: 0, last: "" };
    }
  }

  function saveStreakMeta(m) {
    localStorage.setItem(STREAK_KEY, JSON.stringify(m));
  }

  function loadHistory() {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function saveHistory(h) {
    const keys = Object.keys(h).sort();
    const trimmed = {};
    keys.slice(-14).forEach((k) => {
      trimmed[k] = h[k];
    });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  }

  function habitContribution(h, state) {
    const raw = state[h.id];
    if (h.tipo === "check") {
      return raw === true ? h.weight : 0;
    }
    if (h.tipo === "counter") {
      const n = Math.max(0, Math.min(h.max, Number(raw) || 0));
      return h.weight * (n / h.max);
    }
    if (h.tipo === "steps") {
      const n = Math.max(0, Number(raw) || 0);
      return h.weight * Math.min(1, n / h.goal);
    }
    return 0;
  }

  function weightedPercent(state, ids) {
    const list = ids
      ? HABITOS.filter((h) => ids.includes(h.id))
      : HABITOS;
    if (!list.length) return 0;
    const w = list.reduce((s, h) => s + h.weight, 0);
    if (w <= 0) return 0;
    const c = list.reduce((s, h) => s + habitContribution(h, state), 0);
    return Math.round((c / w) * 100);
  }

  function allRequiredComplete(state) {
    return HABITOS.filter((h) => h.required).every((h) => {
      const c = habitContribution(h, state);
      return c >= h.weight - 0.001;
    });
  }

  function requiredProgress(state) {
    const req = HABITOS.filter((h) => h.required);
    let num = 0;
    let den = req.length;
    req.forEach((h) => {
      if (habitContribution(h, state) >= h.weight - 0.001) num++;
    });
    return { ok: num, total: den };
  }

  function updateStreakIfNeeded(state) {
    if (!allRequiredComplete(state)) return;
    const t = todayKey();
    const y = yesterdayKey();
    const meta = loadStreakMeta();
    if (meta.last === t) return;
    if (meta.last === y) {
      meta.count = (meta.count || 0) + 1;
      meta.last = t;
    } else {
      meta.count = 1;
      meta.last = t;
    }
    saveStreakMeta(meta);
  }

  function streakDisplayCount() {
    const meta = loadStreakMeta();
    const t = todayKey();
    const y = yesterdayKey();
    if (!meta.last) return 0;
    if (meta.last === t || meta.last === y) return meta.count || 0;
    return 0;
  }

  function readStateFromDom() {
    const state = {};
    HABITOS.forEach((h) => {
      if (h.tipo === "check") {
        const el = document.querySelector(`input[data-habito-id="${h.id}"]`);
        state[h.id] = !!(el && el.checked);
      } else if (h.tipo === "counter") {
        const el = document.querySelector(`input[data-habito-counter="${h.id}"]`);
        state[h.id] = Math.max(0, Math.min(h.max, parseInt(el?.value, 10) || 0));
      } else if (h.tipo === "steps") {
        const el = document.querySelector(`input[data-habito-steps="${h.id}"]`);
        state[h.id] = Math.max(0, parseInt(el?.value, 10) || 0);
      }
    });
    return state;
  }

  function applyStateToDom(state) {
    HABITOS.forEach((h) => {
      if (h.tipo === "check") {
        const el = document.querySelector(`input[data-habito-id="${h.id}"]`);
        if (el) el.checked = state[h.id] === true;
      } else if (h.tipo === "counter") {
        const el = document.querySelector(`input[data-habito-counter="${h.id}"]`);
        const v = Math.max(0, Math.min(h.max, Number(state[h.id]) || 0));
        if (el) el.value = String(v);
        const label = document.querySelector(`[data-habito-counter-label="${h.id}"]`);
        if (label) label.textContent = `${v} / ${h.max}`;
      } else if (h.tipo === "steps") {
        const el = document.querySelector(`input[data-habito-steps="${h.id}"]`);
        const v = Math.max(0, Number(state[h.id]) || 0);
        if (el) el.value = v ? String(v) : "";
      }
    });
  }

  function persistFromDom() {
    const t = todayKey();
    const state = readStateFromDom();
    saveDayState(t, state);
    updateStreakIfNeeded(state);

    const pct = weightedPercent(state, null);
    const hist = loadHistory();
    hist[t] = pct;
    saveHistory(hist);

    return { state, pct };
  }

  function updateProgressUI() {
    const state = readStateFromDom();
    const pctGlobal = weightedPercent(state, null);
    const focusIds = loadFocusIds();
    const pctFocus =
      focusIds.length > 0 ? weightedPercent(state, focusIds) : null;

    const txt = document.getElementById("porcentaje-habitos");
    const barra = document.getElementById("barra-habitos");
    if (txt) txt.textContent = pctGlobal + "%";
    if (barra) {
      barra.style.width = Math.min(pctGlobal, 100) + "%";
      if (pctGlobal < 40) barra.style.background = "#ff4d4d";
      else if (pctGlobal < 80) barra.style.background = "#ff7a00";
      else barra.style.background = "#00ff9c";
    }

    const rachaEl = document.getElementById("racha-dias");
    if (rachaEl) rachaEl.textContent = String(streakDisplayCount());

    const req = requiredProgress(state);
    const reqEl = document.getElementById("requeridos-texto");
    if (reqEl) {
      reqEl.textContent = `Hábitos clave: ${req.ok}/${req.total}`;
    }

    const filaPri = document.getElementById("fila-prioridades");
    const barPri = document.getElementById("barra-prioridades");
    const wrapPri = document.getElementById("barra-prioridades-wrap");
    const txtPri = document.getElementById("porcentaje-prioridades");
    if (focusIds.length && pctFocus != null) {
      if (filaPri) filaPri.hidden = false;
      if (wrapPri) wrapPri.hidden = false;
      if (txtPri) txtPri.textContent = pctFocus + "%";
      if (barPri) barPri.style.width = Math.min(pctFocus, 100) + "%";
    } else {
      if (filaPri) filaPri.hidden = true;
      if (wrapPri) wrapPri.hidden = true;
    }

    if (pctGlobal >= 100 && lastPctGlobal < 100) {
      const k = TOAST_100_KEY + todayKey();
      if (!sessionStorage.getItem(k)) {
        sessionStorage.setItem(k, "1");
        showToast("¡Día completo en el tablero! Buen trabajo.");
      }
    }
    lastPctGlobal = pctGlobal;

    renderHistorialMini();
  }

  function showToast(msg) {
    const el = document.getElementById("habitos-toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("habitos-toast--visible");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      el.classList.remove("habitos-toast--visible");
    }, 4200);
  }

  function renderHistorialMini() {
    const host = document.getElementById("historia-habitos");
    if (!host) return;
    host.innerHTML = "";
    const hist = loadHistory();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key =
        d.getFullYear() +
        "-" +
        String(d.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(d.getDate()).padStart(2, "0");
      const pct = hist[key];
      const day = document.createElement("div");
      day.className = "historia-dia";
      day.title = key + (pct != null ? `: ${pct}%` : ": sin datos");
      const fill = document.createElement("div");
      fill.className = "historia-dia-fill";
      if (pct != null) {
        fill.style.height = Math.min(pct, 100) + "%";
        if (pct < 40) fill.style.background = "#ff4d4d";
        else if (pct < 80) fill.style.background = "#ff7a00";
        else fill.style.background = "#00ff9c";
      } else {
        fill.style.height = "8%";
        fill.style.background = "#333";
      }
      day.appendChild(fill);
      const lab = document.createElement("span");
      lab.className = "historia-dia-label";
      lab.textContent = String(d.getDate());
      day.appendChild(lab);
      host.appendChild(day);
    }
  }

  function toggleFocus(id) {
    let ids = loadFocusIds();
    if (ids.includes(id)) {
      ids = ids.filter((x) => x !== id);
    } else {
      if (ids.length >= 5) {
        showToast("Máximo 5 prioridades por día.");
        return;
      }
      ids.push(id);
    }
    saveFocusIds(ids);
    document.querySelectorAll("[data-habito-foco]").forEach((btn) => {
      const hid = btn.getAttribute("data-habito-foco");
      btn.classList.toggle("habito-foco--on", ids.includes(hid));
      btn.setAttribute(
        "aria-pressed",
        ids.includes(hid) ? "true" : "false"
      );
    });
    updateProgressUI();
  }

  function renderTabs() {
    const nav = document.getElementById("habitos-tabs");
    if (!nav) return;
    nav.innerHTML = "";
    CATEGORIAS.forEach((c) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "habitos-tab" + (c.id === tabActiva ? " habitos-tab--activa" : "");
      b.textContent = c.label;
      b.setAttribute("data-tab", c.id);
      b.addEventListener("click", () => {
        tabActiva = c.id;
        nav.querySelectorAll(".habitos-tab").forEach((x) => {
          x.classList.toggle(
            "habitos-tab--activa",
            x.getAttribute("data-tab") === tabActiva
          );
        });
        filterCards();
      });
      nav.appendChild(b);
    });
  }

  function filterCards() {
    document.querySelectorAll(".card-habito").forEach((card) => {
      const cat = card.getAttribute("data-cat");
      const show = tabActiva === "todos" || cat === tabActiva;
      card.style.display = show ? "" : "none";
    });
  }

  function renderCards(root) {
    const focusIds = loadFocusIds();
    root.innerHTML = "";
    HABITOS.forEach((h) => {
      const card = document.createElement("div");
      card.className = "card-habito " + h.cat;
      card.setAttribute("data-cat", h.cat);

      const left = document.createElement("div");
      left.className = "habito-check";

      if (h.tipo === "check") {
        const inp = document.createElement("input");
        inp.type = "checkbox";
        inp.dataset.habitoId = h.id;
        left.appendChild(inp);
      } else if (h.tipo === "counter") {
        const wrap = document.createElement("div");
        wrap.className = "habito-counter-wrap";
        const minus = document.createElement("button");
        minus.type = "button";
        minus.className = "btn-habito-counter";
        minus.textContent = "−";
        minus.addEventListener("click", () => {
          const inp = document.querySelector(`input[data-habito-counter="${h.id}"]`);
          if (!inp) return;
          let v = (parseInt(inp.value, 10) || 0) - 1;
          v = Math.max(0, v);
          inp.value = String(v);
          inp.dispatchEvent(new Event("input", { bubbles: true }));
        });
        const inp = document.createElement("input");
        inp.type = "number";
        inp.min = "0";
        inp.max = String(h.max);
        inp.className = "habito-counter-input";
        inp.dataset.habitoCounter = h.id;
        inp.value = "0";
        const plus = document.createElement("button");
        plus.type = "button";
        plus.className = "btn-habito-counter";
        plus.textContent = "+";
        plus.addEventListener("click", () => {
          const el = document.querySelector(`input[data-habito-counter="${h.id}"]`);
          if (!el) return;
          let v = (parseInt(el.value, 10) || 0) + 1;
          v = Math.min(h.max, v);
          el.value = String(v);
          el.dispatchEvent(new Event("input", { bubbles: true }));
        });
        wrap.appendChild(minus);
        wrap.appendChild(inp);
        wrap.appendChild(plus);
        left.appendChild(wrap);
      } else if (h.tipo === "steps") {
        const inp = document.createElement("input");
        inp.type = "number";
        inp.min = "0";
        inp.max = "50000";
        inp.step = "500";
        inp.placeholder = "Pasos";
        inp.className = "habito-pasos";
        inp.dataset.habitoSteps = h.id;
        left.appendChild(inp);
      }

      const info = document.createElement("div");
      info.className = "habito-info";

      const head = document.createElement("div");
      head.className = "habito-titulo-fila";

      const h3 = document.createElement("h3");
      h3.textContent = h.titulo;
      head.appendChild(h3);

      if (h.required) {
        const badge = document.createElement("span");
        badge.className = "badge-requerido";
        badge.textContent = "Clave";
        head.appendChild(badge);
      }

      const btnFoco = document.createElement("button");
      btnFoco.type = "button";
      btnFoco.className =
        "habito-foco" + (focusIds.includes(h.id) ? " habito-foco--on" : "");
      btnFoco.setAttribute("data-habito-foco", h.id);
      btnFoco.setAttribute("aria-label", "Prioridad de hoy");
      btnFoco.setAttribute("aria-pressed", focusIds.includes(h.id) ? "true" : "false");
      btnFoco.textContent = "★";
      btnFoco.addEventListener("click", (e) => {
        e.preventDefault();
        toggleFocus(h.id);
      });
      head.appendChild(btnFoco);

      info.appendChild(head);

      const p = document.createElement("p");
      p.textContent = h.desc;
      info.appendChild(p);

      if (h.tipo === "counter") {
        const sub = document.createElement("p");
        sub.className = "habito-counter-sub";
        sub.dataset.habitoCounterLabel = h.id;
        sub.textContent = "0 / " + h.max;
        info.appendChild(sub);
      }
      if (h.tipo === "steps") {
        const sub = document.createElement("p");
        sub.className = "habito-steps-sub";
        sub.textContent = "Meta: " + h.goal.toLocaleString("es-MX") + " pasos";
        info.appendChild(sub);
      }

      if (h.link) {
        const a = document.createElement("a");
        a.href = h.link.href;
        a.className = "habito-enlace";
        a.textContent = h.link.text;
        info.appendChild(a);
      }

      card.appendChild(left);
      card.appendChild(info);
      root.appendChild(card);
    });
  }

  function bindEvents(root) {
    root.addEventListener("change", onFieldChange);
    root.addEventListener("input", onFieldChange);
  }

  function onFieldChange() {
    const { state, pct } = persistFromDom();
    applyStateToDom(state);
    updateProgressUI();
  }

  function init() {
    const root = document.getElementById("habitos-root");
    if (!root) return;

    renderTabs();
    renderCards(root);
    bindEvents(root);

    const t = todayKey();
    const saved = loadDayState(t);
    applyStateToDom(saved);
    filterCards();

    lastPctGlobal = weightedPercent(readStateFromDom(), null);
    updateProgressUI();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  /**
   * Resumen para perfil / otros paneles (sin depender del DOM del tablero).
   */
  window.GainMassHabitosResumen = {
    getSnapshot() {
      const t = todayKey();
      const state = loadDayState(t);
      const focusIds = loadFocusIds();
      const pctGlobal = weightedPercent(state, null);
      const pctPrioridades =
        focusIds.length > 0 ? weightedPercent(state, focusIds) : null;
      const req = requiredProgress(state);
      const prioridades = focusIds
        .map((id) => {
          const h = HABITOS.find((x) => x.id === id);
          return h
            ? { id: h.id, titulo: h.titulo, cat: h.cat }
            : null;
        })
        .filter(Boolean);
      return {
        pctGlobal,
        pctPrioridades,
        racha: streakDisplayCount(),
        requeridosOk: req.ok,
        requeridosTotal: req.total,
        prioridades,
      };
    },
  };
})();
