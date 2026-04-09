document.addEventListener('change', function() {
    const total = document.querySelectorAll('input[type="checkbox"]').length;
    const marcados = document.querySelectorAll('input[type="checkbox"]:checked').length;
    
    const porcentaje = Math.round((marcados / total) * 100);
    
    // Actualizar texto y barra
    const txt = document.getElementById('porcentaje-habitos');
    const barra = document.getElementById('barra-habitos');
    
    if(txt && barra) {
        txt.innerText = porcentaje + "%";
        barra.style.width = porcentaje + "%";
        
        // Cambio de color dinámico
        if(porcentaje < 40) barra.style.background = "#ff4d4d";
        else if(porcentaje < 80) barra.style.background = "#ff7a00";
        else barra.style.background = "#00ff9c";
    }
});