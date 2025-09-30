document.addEventListener('DOMContentLoaded', function () {
    const cambiarBtn = document.querySelector('#btn-cambiar-foto');
    const inputFoto = document.getElementById('input-foto');
    const subirBtn = document.getElementById('btn-subir-foto');
    const cancelarBtn = document.getElementById('btn-cancelar-foto');
    const eliminarForm = document.getElementById('form-eliminar-foto');
    const fileInput = inputFoto?.querySelector('input[type="file"]');

    function activarCambioFoto() {
        inputFoto.classList.remove('hidden');
        cancelarBtn.classList.remove('hidden');
        cambiarBtn.classList.add('hidden');
        subirBtn.classList.remove('hidden');
        subirBtn.disabled = true;

        if (eliminarForm) {
            eliminarForm.classList.add('hidden');
        }
    }

    function cancelarCambioFoto() {
        if (fileInput) fileInput.value = '';

        inputFoto.classList.add('hidden');
        subirBtn.classList.add('hidden');
        cancelarBtn.classList.add('hidden');
        subirBtn.disabled = true;
        cambiarBtn.classList.remove('hidden');

        if (eliminarForm) {
            eliminarForm.classList.remove('hidden');
        }
    }

    if (cambiarBtn && inputFoto && subirBtn && fileInput && cancelarBtn) {
        cambiarBtn.addEventListener('click', activarCambioFoto);
        cancelarBtn.addEventListener('click', cancelarCambioFoto);

        fileInput.addEventListener('change', function () {
            if (fileInput.files.length > 0) {
                subirBtn.disabled = false;
            } else {
                subirBtn.disabled = true;
            }
        });
    }
});
