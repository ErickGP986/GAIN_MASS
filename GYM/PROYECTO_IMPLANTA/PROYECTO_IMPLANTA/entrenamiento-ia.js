let usuarioEsPremium = false;

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const r = await fetch("/api/me");
        if (r.ok) {
            const d = await r.json();
            usuarioEsPremium = !!(d.usuario && d.usuario.premium);
            localStorage.setItem("premium", usuarioEsPremium ? "1" : "0");
        }
    } catch (_) {
        usuarioEsPremium = localStorage.getItem("premium") === "1";
    }
});

async function iniciarCamara() {
    if (!usuarioEsPremium) {
        alert(
            "Esta rutina con cámara requiere GAIN MASS PREMIUM.\n\nInicia sesión con una cuenta premium o visita la sección Premium."
        );
        return;
    }
    const video = document.getElementById("webcam");
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
    } catch (err) {
        alert("Error: No se pudo acceder a la cámara. Asegúrate de dar permisos.");
    }
}
