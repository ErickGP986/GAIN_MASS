document.addEventListener("DOMContentLoaded", function () {
    const formLogin = document.getElementById("formLogin");
    const resultadoLogin = document.getElementById("resultadoLogin");

    function mostrarResultado(mensaje, tipo) {
        if (!resultadoLogin) return;
        resultadoLogin.textContent = mensaje;
        resultadoLogin.classList.remove("oculto", "ok", "error");
        resultadoLogin.classList.add(tipo === "ok" ? "ok" : "error");
    }

    if (!formLogin) return;

    formLogin.addEventListener("submit", async function (e) {
        e.preventDefault();

        const correo = document.getElementById("loginCorreo")?.value?.trim() || "";
        const contrasena = document.getElementById("loginContrasena")?.value || "";

        try {
            const respuesta = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ correo, contrasena }),
            });

            if (GainMassLocal.responseIsJson(respuesta)) {
                const data = await respuesta.json();
                if (!respuesta.ok) {
                    mostrarResultado(data.error || "No se pudo iniciar sesión.", "error");
                    return;
                }
                GainMassLocal.clearLocalSessionFlag();
                GainMassLocal.applyUsuario(data.usuario);
                mostrarResultado("Inicio de sesión correcto. Redirigiendo...", "ok");
                setTimeout(() => {
                    window.location.href = "imc.html";
                }, 700);
                return;
            }
        } catch (error) {
            console.error(error);
        }

        const loc = GainMassLocal.login(correo, contrasena);
        if (!loc.ok) {
            mostrarResultado(loc.error || "No se pudo iniciar sesión.", "error");
            return;
        }
        GainMassLocal.applyUsuario(loc.usuario);
        mostrarResultado("Sesión local (sin servidor). Redirigiendo...", "ok");
        setTimeout(() => {
            window.location.href = "imc.html";
        }, 700);
    });
});
