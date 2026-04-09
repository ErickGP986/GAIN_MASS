document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formImc");
    const resultado = document.getElementById("resultadoImc");
    const bloqueUltimo = document.getElementById("bloqueUltimo");
    const textoUltimo = document.getElementById("textoUltimo");

    function mensaje(texto, ok) {
        resultado.textContent = texto;
        resultado.classList.remove("oculto", "ok", "error");
        resultado.classList.add(ok ? "ok" : "error");
    }

    async function cargarUltimo() {
        try {
            const resp = await fetch("/api/imc/latest");
            if (!resp.ok) return;
            const data = await resp.json();
            if (!data.registro) return;
            const r = data.registro;
            bloqueUltimo.classList.remove("oculto");
            textoUltimo.textContent = `${r.nombre}, ${r.edad} años — IMC ${r.imc} (peso ${r.peso_kg} kg, ${r.altura_cm} cm, ${r.sexo}). Registrado: ${r.creado_en || ""}`;
        } catch (e) {
            console.error(e);
        }
    }

    cargarUltimo();

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const nombre = document.getElementById("imcNombre").value.trim();
        const edad = parseInt(document.getElementById("imcEdad").value, 10);
        const sexo = document.getElementById("imcSexo").value;
        const peso_kg = parseFloat(document.getElementById("imcPeso").value);
        const altura_cm = parseFloat(document.getElementById("imcAltura").value);

        if (!nombre || !edad || !sexo || !peso_kg || !altura_cm) {
            mensaje("Completa todos los campos.", false);
            return;
        }

        try {
            const resp = await fetch("/api/imc", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre, edad, sexo, peso_kg, altura_cm }),
            });
            const data = await resp.json();
            if (!resp.ok) {
                mensaje(data.error || "No se pudo guardar.", false);
                return;
            }
            mensaje(`IMC calculado: ${data.imc} — Guardado correctamente.`, true);
            form.reset();
            await cargarUltimo();
            setTimeout(() => {
                window.location.href = "home.html";
            }, 1200);
        } catch (err) {
            console.error(err);
            mensaje("Error de conexión con el servidor.", false);
        }
    });
});
