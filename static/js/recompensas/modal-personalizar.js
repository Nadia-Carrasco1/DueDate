function mostrarFondosOAudios() {
    const formFondos = document.getElementById('form-fondos-personalizar');
    const divAudios = document.getElementById('audios-personalizar'); 
    const btnFondos = document.getElementById('btn-fondos');
    const btnAudios = document.getElementById('btn-audios');

    if (!formFondos || !divAudios || !btnFondos || !btnAudios) {
        console.error("Faltan elementos DOM para la personalización");
        return; 
    }

    btnAudios.addEventListener('click', () => {
        formFondos.classList.add('hidden');
        divAudios.classList.remove('hidden');
    });

    btnFondos.addEventListener('click', () => {
        formFondos.classList.remove('hidden');
        divAudios.classList.add('hidden');
    });
}

function mostrarModalPersonalizar() {
    const btnPersonalizar = document.getElementById('btn-personalizar');
    const modalPersonalizar = document.getElementById('modal-personalizar');
    const btnCerrarModalPersonalizar = document.getElementById('btn-cerrar-modal-personalizar');

    if (!btnPersonalizar || !modalPersonalizar || !btnCerrarModalPersonalizar) {
        console.error("Faltan elementos del DOM (btn-personalizar/modal-personalizar/btn-cerrar-modal-personalizar)");
        return;
    }

    btnCerrarModalPersonalizar.addEventListener('click', () => {
        modalPersonalizar.classList.add('hidden');
    })

    btnPersonalizar.addEventListener('click', () => {
        modalPersonalizar.classList.toggle('hidden');
    })
}

document.addEventListener('DOMContentLoaded', () => {
    mostrarModalPersonalizar(); 
    mostrarFondosOAudios();
});