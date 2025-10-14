document.addEventListener('DOMContentLoaded', () => {
    const cerrarForm = document.getElementById('cerrar-form');
    const modal = document.getElementById('modal-definir-tiempos');
    const btnDefinirTiempo = document.getElementById('btn-definir-tiempos');
    const formDefinirTiempo = document.getElementById('form-definir-tiempos');

    btnDefinirTiempo.addEventListener('click', () => {
        modal.classList.remove('hidden');
        formDefinirTiempo.classList.remove('hidden');
    });

    cerrarForm.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    // Cerrar haciendo clic fuera del form
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
});
