const formFondos = document.getElementById('form-fondos-personalizar');
const divAudios = document.getElementById('audios-personalizar'); 
const btnFondos = document.getElementById('btn-fondos');
const btnAudios = document.getElementById('btn-audios');
const modalPersonalizar = document.getElementById('modal-personalizar');

function abrirModal(modal) {
    modal.classList.remove('hidden');
 
    setTimeout(() => {
        modal.classList.remove('translate-x-full');
    }, 10);
}

function cerrarModal(modal) {
    modal.classList.add('translate-x-full');
    
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 320); 
}

function mostrarFondosOAudios() {
    if (!formFondos || !divAudios || !btnFondos || !btnAudios) {
        console.error("Faltan elementos DOM para la personalización (fondos/audios/botones)");
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
    const btnCerrarModalPersonalizar = document.getElementById('btn-cerrar-modal-personalizar');

    if (!btnPersonalizar || !modalPersonalizar || !btnCerrarModalPersonalizar) {
        console.error("Faltan elementos del DOM (btn-personalizar/modal-personalizar/btn-cerrar-modal-personalizar)");
        return;
    }

    btnCerrarModalPersonalizar.addEventListener('click', () => {
        cerrarModal(modalPersonalizar);
        
        if (divAudios && formFondos && !divAudios.classList.contains('hidden')) {
            divAudios.classList.add('hidden');
            formFondos.classList.remove('hidden'); 
        }
    });

    btnPersonalizar.addEventListener('click', () => {
        if (modalPersonalizar.classList.contains('hidden')) {
            abrirModal(modalPersonalizar);
        } else {
            cerrarModal(modalPersonalizar);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    mostrarFondosOAudios();
    mostrarModalPersonalizar(); 
});