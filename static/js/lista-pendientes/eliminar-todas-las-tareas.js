document.addEventListener('DOMContentLoaded', function() {
    const modalLimpiarLista = document.getElementById('confirmacion-limpiar-modal');
    const btnLimpiarLista = document.getElementById('btn-limpiar-lista');
    const btnConfirmar = document.getElementById('btn-confirmar-limpieza');
    const btnCancelar = document.getElementById('btn-cancelar');
    
    if (!btnLimpiarLista) {
        return;
    }

    btnLimpiarLista.addEventListener('click', () => {
        modalLimpiarLista.classList.remove('hidden');
        modalLimpiarLista.classList.add('flex');
    })
    btnCancelar.addEventListener('click', () => {
        modalLimpiarLista.classList.add('hidden');
        modalLimpiarLista.classList.remove('flex');
    })

    btnConfirmar.addEventListener('click', () => {
        const limparUrl = btnLimpiarLista.getAttribute('data-url');
        console.log(limparUrl);
        if (limparUrl) {
            window.location.href = limparUrl;
        }
    })

})