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

            const data = await respuesta.json();

            if (!respuesta.ok) {
                mostrarResultado(data.error || "No se pudo iniciar sesión.", "error");
                return;
            }

            localStorage.setItem("usuario", data.usuario.nombre);
            localStorage.setItem("correo", data.usuario.correo);
            localStorage.setItem("premium", data.usuario && data.usuario.premium ? "1" : "0");
            mostrarResultado("Inicio de sesión correcto. Redirigiendo...", "ok");

            setTimeout(() => {
                window.location.href = "imc.html";
            }, 700);
        } catch (error) {
            console.error(error);
            mostrarResultado("No se pudo conectar con el servidor.", "error");
        }
    });
});
