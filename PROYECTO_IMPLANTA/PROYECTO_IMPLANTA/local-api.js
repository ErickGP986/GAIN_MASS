/**
 * Modo local sin backend: registro, sesión e IMC en localStorage.
 * Se usa solo si /api/* no responde JSON (servidor estático, archivo local, etc.).
 */
(function () {
    const LS_USERS = "gainmass_local_users";
    const LS_IMC = "gainmass_local_imc";
    const LS_RECOVERY = "gainmass_local_recovery";
    const LS_LOCAL_SESSION = "gainmass_local_session_email";

    function normEmail(e) {
        return String(e || "").trim().toLowerCase();
    }

    function getUsers() {
        try {
            const raw = localStorage.getItem(LS_USERS);
            const o = raw ? JSON.parse(raw) : {};
            return o && typeof o === "object" ? o : {};
        } catch {
            return {};
        }
    }

    function setUsers(users) {
        localStorage.setItem(LS_USERS, JSON.stringify(users));
    }

    function responseIsJson(resp) {
        const ct = (resp.headers.get("content-type") || "").toLowerCase();
        return ct.includes("application/json");
    }

    window.GainMassLocal = {
        responseIsJson,

        clearLocalSessionFlag() {
            localStorage.removeItem(LS_LOCAL_SESSION);
        },

        markLocalSession(email) {
            localStorage.setItem(LS_LOCAL_SESSION, normEmail(email));
        },

        hasLocalSession() {
            const email = localStorage.getItem(LS_LOCAL_SESSION);
            if (!email) return false;
            const u = getUsers()[email];
            return !!u;
        },

        getLocalUser() {
            const email = localStorage.getItem(LS_LOCAL_SESSION);
            if (!email) return null;
            return getUsers()[email] || null;
        },

        register(payload) {
            const nombre = String(payload.nombre || "").trim();
            const correo = normEmail(payload.correo);
            const contrasena = payload.contrasena || "";
            const telefono = String(payload.telefono || "").trim();
            const correo_respaldo = String(payload.correo_respaldo || "").trim();
            if (!nombre || !correo) return { ok: false, error: "Nombre y correo son obligatorios." };
            if (contrasena.length < 6) return { ok: false, error: "La contraseña debe tener al menos 6 caracteres." };
            const users = getUsers();
            if (users[correo]) return { ok: false, error: "Este correo ya está registrado." };
            users[correo] = {
                nombre,
                correo,
                contrasena,
                telefono,
                correo_respaldo,
                premium: false,
            };
            setUsers(users);
            return { ok: true };
        },

        login(correoRaw, contrasena) {
            const correo = normEmail(correoRaw);
            const users = getUsers();
            const u = users[correo];
            if (!u || u.contrasena !== contrasena) {
                return { ok: false, error: "Correo o contraseña incorrectos." };
            }
            this.markLocalSession(correo);
            return {
                ok: true,
                usuario: {
                    nombre: u.nombre,
                    correo: u.correo,
                    premium: !!u.premium,
                },
            };
        },

        applyUsuario(u) {
            if (!u) return;
            localStorage.setItem("usuario", u.nombre || "");
            localStorage.setItem("correo", u.correo || "");
            localStorage.setItem("premium", u.premium ? "1" : "0");
        },

        recoveryStart(correoRaw) {
            const correo = normEmail(correoRaw);
            const users = getUsers();
            if (!users[correo]) return { ok: false, error: "No hay cuenta con ese correo." };
            const code = String(Math.floor(100000 + Math.random() * 900000));
            try {
                const m = JSON.parse(localStorage.getItem(LS_RECOVERY) || "{}");
                m[code] = correo;
                localStorage.setItem(LS_RECOVERY, JSON.stringify(m));
            } catch {
                localStorage.setItem(LS_RECOVERY, JSON.stringify({ [code]: correo }));
            }
            const local = correo.split("@")[0] || "u";
            const destino = local.length > 1 ? local[0] + "***@" + (correo.split("@")[1] || "") : "*@" + (correo.split("@")[1] || "");
            return { ok: true, destino, demo_code: code };
        },

        recoveryReset(codigoRaw, nueva) {
            const codigo = String(codigoRaw || "").trim();
            const nueva_contrasena = nueva || "";
            if (nueva_contrasena.length < 6) {
                return { ok: false, error: "La contraseña debe tener al menos 6 caracteres." };
            }
            let m = {};
            try {
                m = JSON.parse(localStorage.getItem(LS_RECOVERY) || "{}");
            } catch {
                return { ok: false, error: "Código inválido o expirado." };
            }
            const email = m[codigo];
            if (!email) return { ok: false, error: "Código inválido o expirado." };
            const users = getUsers();
            if (!users[email]) return { ok: false, error: "Código inválido o expirado." };
            users[email].contrasena = nueva_contrasena;
            setUsers(users);
            delete m[codigo];
            localStorage.setItem(LS_RECOVERY, JSON.stringify(m));
            return { ok: true };
        },

        imcKey() {
            const c = normEmail(localStorage.getItem("correo") || "");
            return c ? LS_IMC + "_" + c : LS_IMC;
        },

        getImcRegistro() {
            try {
                const raw = localStorage.getItem(this.imcKey());
                if (!raw) return null;
                const r = JSON.parse(raw);
                return r && typeof r === "object" ? r : null;
            } catch {
                return null;
            }
        },

        saveImc(reg) {
            localStorage.setItem(this.imcKey(), JSON.stringify(reg));
        },

        listUsersForAdmin() {
            const users = getUsers();
            let id = 1;
            return Object.values(users).map((u) => ({
                id: id++,
                nombre: u.nombre,
                correo: u.correo,
                telefono: u.telefono || "",
                correo_respaldo: u.correo_respaldo || "",
                premium: !!u.premium,
                creado_en: "—",
            }));
        },
    };
})();
