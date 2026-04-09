document.addEventListener("DOMContentLoaded", async () => {
    const requiereAuth = document.body.dataset.authRequired === "true";
    if (!requiereAuth) return;

    try {
        const respuesta = await fetch("/api/me");
        if (!respuesta.ok) {
            window.location.href = "index.html";
            return;
        }

        const data = await respuesta.json();
        if (!data.authenticated) {
            window.location.href = "index.html";
            return;
        }

        if (data.usuario && typeof data.usuario.premium !== "undefined") {
            localStorage.setItem("premium", data.usuario.premium ? "1" : "0");
        }

        const usuarioActual = document.getElementById("usuarioActual");
        if (usuarioActual && data.usuario?.nombre) {
            usuarioActual.textContent = data.usuario.nombre;
        }
    } catch (error) {
        console.error(error);
        window.location.href = "index.html";
    }
});
