document.addEventListener("DOMContentLoaded", async () => {
    const totalUsuarios = document.getElementById("totalUsuarios");
    const cuerpoTabla = document.getElementById("cuerpoTabla");

    try {
        const resp = await fetch("/api/users");
        if (!resp.ok) {
            window.location.href = "index.html";
            return;
        }

        const usuarios = await resp.json();
        if (!Array.isArray(usuarios)) return;

        if (totalUsuarios) totalUsuarios.textContent = String(usuarios.length);

        if (!cuerpoTabla) return;
        cuerpoTabla.innerHTML = "";

        usuarios.forEach((u) => {
            const tr = document.createElement("tr");

            const telefono = u.telefono || "-";
            const correo_respaldo = u.correo_respaldo || "-";
            const creado = u.creado_en || "-";
            const premium = u.premium ? "Sí" : "No";

            tr.innerHTML = `
                <td style="padding:10px; border-bottom:1px solid #333;">${u.id ?? ""}</td>
                <td style="padding:10px; border-bottom:1px solid #333;">${u.nombre ?? ""}</td>
                <td style="padding:10px; border-bottom:1px solid #333; word-break: break-word;">${u.correo ?? ""}</td>
                <td style="padding:10px; border-bottom:1px solid #333;">${telefono}</td>
                <td style="padding:10px; border-bottom:1px solid #333; word-break: break-word;">${correo_respaldo}</td>
                <td style="padding:10px; border-bottom:1px solid #333;">${premium}</td>
                <td style="padding:10px; border-bottom:1px solid #333;">${creado}</td>
            `;

            cuerpoTabla.appendChild(tr);
        });
    } catch (error) {
        console.error(error);
    }
});
