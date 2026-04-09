/* =========================================
   1. LÓGICA DE SUSCRIPCIÓN Y PAGO
   ========================================= */

// Abre el modal de pago
function abrirModalPago() {
  const modal = document.getElementById('modalPago');
  if (modal) {
      modal.style.display = 'flex'; 
  }
}

// Cierra el modal de pago
function cerrarModalPago() {
  const modal = document.getElementById('modalPago');
  if (modal) {
      modal.style.display = 'none';
  }
}

// Procesa el pago y cambia la vista
function simularPago() {
  const btnConfirmar = document.querySelector('.btn-confirmar-pago');
  
  // Feedback visual en el botón
  if (btnConfirmar) {
      btnConfirmar.innerHTML = "Procesando...";
      btnConfirmar.disabled = true;
  }

  // Simulamos la espera del banco (1.5 segundos)
  setTimeout(() => {
      // 1. Cerramos el modal
      cerrarModalPago();
      
      // 2. OCULTAMOS la sección de venta y MOSTRAMOS la sección activa
      // Esto es mucho más seguro que reescribir el HTML con JS
      const seccionVenta = document.getElementById('seccionVenta');
      const seccionActiva = document.getElementById('seccionActiva');

      if (seccionVenta && seccionActiva) {
          seccionVenta.style.display = 'none';
          seccionActiva.style.display = 'block';
      }

      // 3. Mensaje de éxito
      alert("¡Pago procesado con éxito! ¡ACCESO CONCEDIDO, usuario!");
      
      console.log("Suscripción activada correctamente.");
  }, 1500);
}

// Función para el botón de cancelar del dibujo
function confirmarCancelacion() {
  if (confirm("¿Estás segura de que quieres cancelar tu suscripción? Perderás acceso a las herramientas IA.")) {
      // Recargamos la página para simular que volvió al estado inicial
      location.reload();
  }
}

/* =========================================
 2. INICIALIZACIÓN Y CIERRE EXTERNO
 ========================================= */

document.addEventListener("DOMContentLoaded", () => {
  // Cerrar modal si el usuario hace clic fuera de la caja blanca
  window.onclick = function(event) {
      const modal = document.getElementById('modalPago');
      if (event.target == modal) {
          cerrarModalPago();
      }
  }
  
  console.log("Módulo Premium de Gain Mass listo.");
});