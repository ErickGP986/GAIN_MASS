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

        try {
            const resp = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre, correo, contrasena, telefono, correo_respaldo }),
            });
            const data = await resp.json();
            if (!resp.ok) {
                mostrarMensaje(data.error || "No se pudo registrar.", "error");
                return;
            }

            mostrarMensaje("Cuenta creada correctamente. Ahora inicia sesión.", "ok");
            formRegistro.reset();
            activarLogin();
        } catch (err) {
            console.error(err);
            mostrarMensaje("Error de conexión con el servidor.", "error");
        }
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
            const data = await resp.json();
            if (!resp.ok) {
                mostrarMensaje(data.error || "No se pudo iniciar sesión.", "error");
                return;
            }

            const u = data.usuario || {};
            localStorage.setItem("usuario", u.nombre || "");
            localStorage.setItem("correo", u.correo || "");
            localStorage.setItem("premium", u.premium ? "1" : "0");

            mostrarMensaje("Sesión iniciada. Redirigiendo...", "ok");
            setTimeout(() => {
                window.location.href = "imc.html";
            }, 700);
        } catch (err) {
            console.error(err);
            mostrarMensaje("Error de conexión con el servidor.", "error");
        }
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
        } catch (err) {
            console.error(err);
            mostrarMensaje("Error de conexión con el servidor.", "error");
        }
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
            const data = await resp.json();
            if (!resp.ok) {
                mostrarMensaje(data.error || "No se pudo cambiar la contraseña.", "error");
                return;
            }
            mostrarMensaje("Contraseña actualizada. Ahora inicia sesión.", "ok");
            formRecuperacion.reset();
            bloqueRecuperacion.classList.add("oculto");
            activarLogin();
        } catch (err) {
            console.error(err);
            mostrarMensaje("Error de conexión con el servidor.", "error");
        }
    });
});
