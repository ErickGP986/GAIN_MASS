function guardarPerfilBiometricoLs(reg) {
    if (!reg) return;
    localStorage.setItem("edad", String(reg.edad));
    if (reg.sexo) localStorage.setItem("sexo", reg.sexo);
    localStorage.setItem("altura_cm", String(reg.altura_cm));
    localStorage.setItem("peso_kg", String(reg.peso_kg));
    localStorage.setItem("imc_ultimo", String(reg.imc));
}

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

    function mostrarRegistroImc(r) {
        if (!r) return;
        bloqueUltimo.classList.remove("oculto");
        textoUltimo.textContent = `${r.nombre}, ${r.edad} años — IMC ${r.imc} (peso ${r.peso_kg} kg, ${r.altura_cm} cm, ${r.sexo}). Registrado: ${r.creado_en || ""}`;
    }

    async function cargarUltimo() {
        let reg = null;
        try {
            const resp = await fetch("/api/imc/latest");
            if (GainMassLocal.responseIsJson(resp) && resp.ok) {
                const data = await resp.json();
                if (data.registro) reg = data.registro;
            }
        } catch (e) {
            console.error(e);
        }
        if (!reg) reg = GainMassLocal.getImcRegistro();
        if (reg) {
            guardarPerfilBiometricoLs(reg);
            mostrarRegistroImc(reg);
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

        const altura_m = altura_cm / 100.0;
        const imc_calc = Math.round((peso_kg / (altura_m * altura_m)) * 10) / 10;

        try {
            const resp = await fetch("/api/imc", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre, edad, sexo, peso_kg, altura_cm }),
            });
            if (GainMassLocal.responseIsJson(resp)) {
                const data = await resp.json();
                if (!resp.ok) {
                    mensaje(data.error || "No se pudo guardar.", false);
                    return;
                }
                mensaje(`IMC calculado: ${data.imc} — Guardado correctamente.`, true);
                guardarPerfilBiometricoLs({
                    edad,
                    sexo,
                    peso_kg,
                    altura_cm,
                    imc: data.imc != null ? data.imc : imc_calc,
                });
                form.reset();
                await cargarUltimo();
                setTimeout(() => {
                    window.location.href = "home.html";
                }, 1200);
                return;
            }
        } catch (err) {
            console.error(err);
        }

        const reg = {
            nombre,
            edad,
            sexo,
            peso_kg,
            altura_cm,
            imc: imc_calc,
            creado_en: new Date().toLocaleString("es-MX"),
        };
        GainMassLocal.saveImc(reg);
        guardarPerfilBiometricoLs(reg);
        mensaje(`IMC calculado: ${imc_calc} — Guardado en este equipo (sin servidor).`, true);
        form.reset();
        await cargarUltimo();
        setTimeout(() => {
            window.location.href = "home.html";
        }, 1200);
    });
});
