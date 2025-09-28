document.addEventListener('DOMContentLoaded', function () {
    const cambiarBtn = document.querySelector('#btn-cambiar-foto');
    const inputFoto = document.getElementById('input-foto');
    const subirBtn = document.getElementById('btn-subir-foto');
    const eliminarForm = document.getElementById('form-eliminar-foto');
    const fileInput = inputFoto?.querySelector('input[type="file"]');

    function activarCambioFoto() {
        inputFoto.classList.remove('hidden');
        subirBtn.classList.remove('hidden');
        cambiarBtn.classList.add('hidden');
        if (eliminarForm) {
            eliminarForm.classList.add('hidden');
        }
    }

    if (cambiarBtn && inputFoto && subirBtn && fileInput) {
        cambiarBtn.addEventListener('click', activarCambioFoto);

        fileInput.addEventListener('change', function () {
            if (fileInput.files.length > 0) {
                subirBtn.classList.remove('hidden');
                activarCambioFoto(); // 👈 Asegura que todo se oculte si el usuario selecciona directamente
            } else {
                subirBtn.classList.add('hidden');
            }
        });

        // 👇 Si ya hay un archivo seleccionado (por ejemplo, tras recarga), activamos el modo cambio
        if (fileInput.files.length > 0) {
            activarCambioFoto();
        }
    }
});