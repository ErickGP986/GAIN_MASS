document.addEventListener("DOMContentLoaded", () => {
    const tabRegistro = document.getElementById("tabRegistro");
    const tabLogin = document.getElementById("tabLogin");
    const formRegistro = document.getElementById("formRegistroAuth");
    const formLogin = document.getElementById("formLoginAuth");
    const formRecuperacion = document.getElementById("formRecuperacionAuth");
    const resultado = document.getElementById("resultadoAuth");
    const bloqueRecuperacion = document.getElementById("bloqueRecuperacion");
    const btnOlvideContrasena = document.getElementById("btnOlvideContrasena");
    const btnVolverLogin = document.getElementById("btnVolverLogin");
    const btnCambiarContrasena = document.getElementById("btnCambiarContrasena");

    function mostrarMensaje(texto, tipo) {
        resultado.textContent = texto;
        resultado.classList.remove("oculto", "ok", "error");
        resultado.classList.add(tipo === "ok" ? "ok" : "error");
    }

    function activarRegistro() {
        tabRegistro.classList.add("activo");
        tabLogin.classList.remove("activo");
        formRegistro.classList.remove("oculto");
        formLogin.classList.add("oculto");
        formRecuperacion.classList.add("oculto");
        resultado.classList.add("oculto");
        bloqueRecuperacion.classList.add("oculto");
    }

    function activarLogin() {
        tabLogin.classList.add("activo");
        tabRegistro.classList.remove("activo");
        formLogin.classList.remove("oculto");
        formRegistro.classList.add("oculto");
        formRecuperacion.classList.add("oculto");
        resultado.classList.add("oculto");
    }

    function activarRecuperacion() {
        tabLogin.classList.add("activo");
        tabRegistro.classList.remove("activo");
        formRecuperacion.classList.remove("oculto");
        formLogin.classList.add("oculto");
        formRegistro.classList.add("oculto");
        resultado.classList.add("oculto");
    }

    tabRegistro.addEventListener("click", activarRegistro);
    tabLogin.addEventListener("click", activarLogin);
    btnOlvideContrasena.addEventListener("click", activarRecuperacion);
    btnVolverLogin.addEventListener("click", activarLogin);

    formRegistro.addEventListener("submit", async (e) => {
        e.preventDefault();
        const nombre = document.getElementById("regNombre").value.trim();
        const correo = document.getElementById("regCorreo").value.trim();
        const contrasena = document.getElementById("regContrasena").value;
        const telefono = document.getElementById("regTelefono").value.trim();
        const correo_respaldo = document.getElementById("regCorreoRespaldo").value.trim();

        const body = { nombre, correo, contrasena, telefono, correo_respaldo };
        try {
            const resp = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (GainMassLocal.responseIsJson(resp)) {
                const data = await resp.json();
                if (!resp.ok) {
                    mostrarMensaje(data.error || "No se pudo registrar.", "error");
                    return;
                }
                GainMassLocal.clearLocalSessionFlag();
                mostrarMensaje("Cuenta creada correctamente. Ahora inicia sesión.", "ok");
                formRegistro.reset();
                activarLogin();
                return;
            }
        } catch (err) {
            console.error(err);
        }
        const loc = GainMassLocal.register(body);
        if (!loc.ok) {
            mostrarMensaje(loc.error || "No se pudo registrar.", "error");
            return;
        }
        mostrarMensaje("Cuenta guardada en este equipo (sin servidor). Ahora inicia sesión.", "ok");
        formRegistro.reset();
        activarLogin();
    });

    formLogin.addEventListener("submit", async (e) => {
        e.preventDefault();
        const correo = document.getElementById("logCorreo").value.trim();
        const contrasena = document.getElementById("logContrasena").value;

        try {
            const resp = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ correo, contrasena }),
            });
            if (GainMassLocal.responseIsJson(resp)) {
                const data = await resp.json();
                if (!resp.ok) {
                    mostrarMensaje(data.error || "No se pudo iniciar sesión.", "error");
                    return;
                }
                GainMassLocal.clearLocalSessionFlag();
                const u = data.usuario || {};
                GainMassLocal.applyUsuario(u);
                mostrarMensaje("Sesión iniciada. Redirigiendo...", "ok");
                setTimeout(() => {
                    window.location.href = "imc.html";
                }, 700);
                return;
            }
        } catch (err) {
            console.error(err);
        }
        const loc = GainMassLocal.login(correo, contrasena);
        if (!loc.ok) {
            mostrarMensaje(loc.error || "No se pudo iniciar sesión.", "error");
            return;
        }
        GainMassLocal.applyUsuario(loc.usuario);
        mostrarMensaje("Sesión local (sin servidor). Redirigiendo...", "ok");
        setTimeout(() => {
            window.location.href = "imc.html";
        }, 700);
    });

    formRecuperacion.addEventListener("submit", async (e) => {
        e.preventDefault();
        const correo = document.getElementById("recCorreo").value.trim();
        const metodo = document.getElementById("recMetodo").value;

        try {
            const resp = await fetch("/api/recovery-start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ correo, metodo }),
            });
            if (GainMassLocal.responseIsJson(resp)) {
                const data = await resp.json();
                if (!resp.ok) {
                    mostrarMensaje(data.error || "No se pudo iniciar recuperación.", "error");
                    return;
                }
                bloqueRecuperacion.classList.remove("oculto");
                mostrarMensaje(
                    `Codigo enviado a ${data.destino}. Demo local, codigo: ${data.demo_code}`,
                    "ok"
                );
                return;
            }
        } catch (err) {
            console.error(err);
        }
        const lr = GainMassLocal.recoveryStart(correo);
        if (!lr.ok) {
            mostrarMensaje(lr.error || "No se pudo iniciar recuperación.", "error");
            return;
        }
        bloqueRecuperacion.classList.remove("oculto");
        mostrarMensaje(
            `Codigo (solo en este navegador): ${lr.demo_code}. Destino: ${lr.destino}`,
            "ok"
        );
    });

    btnCambiarContrasena.addEventListener("click", async () => {
        const codigo = document.getElementById("recCodigo").value.trim();
        const nueva_contrasena = document.getElementById("recNuevaContrasena").value;
        try {
            const resp = await fetch("/api/recovery-reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ codigo, nueva_contrasena }),
            });
            if (GainMassLocal.responseIsJson(resp)) {
                const data = await resp.json();
                if (!resp.ok) {
                    mostrarMensaje(data.error || "No se pudo cambiar la contraseña.", "error");
                    return;
                }
                mostrarMensaje("Contraseña actualizada. Ahora inicia sesión.", "ok");
                formRecuperacion.reset();
                bloqueRecuperacion.classList.add("oculto");
                activarLogin();
                return;
            }
        } catch (err) {
            console.error(err);
        }
        const rr = GainMassLocal.recoveryReset(codigo, nueva_contrasena);
        if (!rr.ok) {
            mostrarMensaje(rr.error || "No se pudo cambiar la contraseña.", "error");
            return;
        }
        mostrarMensaje("Contraseña actualizada (local). Ahora inicia sesión.", "ok");
        formRecuperacion.reset();
        bloqueRecuperacion.classList.add("oculto");
        activarLogin();
    });
});
