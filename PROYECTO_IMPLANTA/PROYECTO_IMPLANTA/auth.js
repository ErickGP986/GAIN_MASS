document.addEventListener("DOMContentLoaded", async () => {
    const requiereAuth = document.body.dataset.authRequired === "true";
    if (!requiereAuth) return;

    let data = null;
    try {
        const respuesta = await fetch("/api/me");
        if (GainMassLocal.responseIsJson(respuesta) && respuesta.ok) {
            data = await respuesta.json();
        }
    } catch (error) {
        console.error(error);
    }

    if (data && data.authenticated) {
        if (data.usuario && typeof data.usuario.premium !== "undefined") {
            localStorage.setItem("premium", data.usuario.premium ? "1" : "0");
        }
        if (data.usuario?.nombre) {
            localStorage.setItem("usuario", data.usuario.nombre);
        }
        if (data.usuario?.correo) {
            localStorage.setItem("correo", data.usuario.correo);
        }
        const usuarioActual = document.getElementById("usuarioActual");
        if (usuarioActual && data.usuario?.nombre) {
            usuarioActual.textContent = data.usuario.nombre;
        }
        return;
    }

    if (GainMassLocal.hasLocalSession()) {
        const u = GainMassLocal.getLocalUser();
        if (u) {
            GainMassLocal.applyUsuario({
                nombre: u.nombre,
                correo: u.correo,
                premium: !!u.premium,
            });
            const usuarioActual = document.getElementById("usuarioActual");
            if (usuarioActual && u.nombre) {
                usuarioActual.textContent = u.nombre;
            }
            return;
        }
    }

    window.location.href = "index.html";
});
