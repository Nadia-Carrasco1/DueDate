document.addEventListener('DOMContentLoaded', () => {
    const barraSonido = document.getElementById('barra-sonido');
    const barraSonidoDinamica = document.getElementById('barra-sonido-dinamica');
    const toggleSonidoBtn = document.getElementById('toggle-sonido');
    const iconoSonido = document.getElementById('icono-sonido');
    const sonidoId = localStorage.getItem('sonidoId');
    
    const sonidoActivo = localStorage.getItem('sonidoActivo') === 'true'; 
    
    const volumenGuardado = localStorage.getItem('volumenSonido');

    const sonidoIdStorage = localStorage.getItem('sonidoId');
    const radioActual = document.getElementById(sonidoIdStorage);

    if (radioActual) {
        radioActual.checked = true;
    }

    const sonidos = {
        lluvia: document.getElementById('sonido-lluvia'),
        chimenea: document.getElementById('sonido-chimenea'),
        naturaleza: document.getElementById('sonido-naturaleza'),
        ambiente: document.getElementById('sonido-ambiente'),
        lofi: document.getElementById('sonido-lofi')
    };

    for (let i in sonidos) {
        sonidos[i].loop = true;
    }
    
    function actualizarIconoSonido() {
        if (!iconoSonido || !toggleSonidoBtn || !sonidoId || !sonidos[sonidoId]) return;

        const sonido = sonidos[sonidoId];

        setTimeout(() => {
            const estaReproduciendo = !sonido.paused && sonido.readyState >= 2;
            
            iconoSonido.src = estaReproduciendo ? window.rutaConVolumen : window.rutaSinVolumen;

            toggleSonidoBtn.onclick = () => {
                if (sonido.paused) {
                    sonido.play().then(() => {
                        localStorage.setItem('sonidoActivo', 'true');
                        iconoSonido.src = window.rutaConVolumen;

                        const iconoPlayPausa = document.getElementById('icono-play-pausa');
                        if (iconoPlayPausa) iconoPlayPausa.src = window.rutaPausar;
                    }).catch(() => {
                        iconoSonido.src = window.rutaSinVolumen;
                    });
                } else {
                    sonido.pause();
                    localStorage.setItem('sonidoActivo', 'false');
                    iconoSonido.src = window.rutaSinVolumen;

                    const iconoPlayPausa = document.getElementById('icono-play-pausa');
                    if (iconoPlayPausa) iconoPlayPausa.src = window.rutaPlay;
                }
            };
        }, 300);
    }

    function manejarBarraControl(idSonido) {
        const sonidoSeleccionado = sonidos[idSonido];
        const sonidoNombre = idSonido.charAt(0).toUpperCase() + idSonido.slice(1);
        const volumen = parseFloat(localStorage.getItem('volumenSonido') || 1);
        
        const iconoInicial = sonidoSeleccionado.paused ? window.rutaPlay : window.rutaPausar;

        const btnSonidos = `
            <button type="button" id="boton-play-pausa">
                <img id="icono-play-pausa" src="${iconoInicial}" alt="Boton play pausa" class="h-4 w-4">
            </button>
        `;
        
        if (barraSonido) {
            barraSonidoDinamica.innerHTML = `
                <div class="flex items-center justify-between text-white w-full rounded-full bg-black/80 px-3 py-3">
                    <div class="flex items-center justify-center space-x-2">
                        <img src="${window.rutaBtnCerrarBarraSonido}" alt="Botón cerrar" id="btn-cerrar-barra-sonido" class="p-1 w-5 h-5 hover:bg-neutral-700/20 hover:rounded-full hover:cursor-pointer" title="Cerrar">
                        ${btnSonidos}
                        <input type="range" id="volumenControl" min="0" max="1" step="0.01" class="accent-indigo-700" value="${volumen}">
                        <img id="icono-volumen" src="${volumen > 0 ? window.rutaConVolumen : window.rutaSinVolumen}" alt="Icono volumen" class="h-5 w-5">
                        <span id="nombre-sonido" class="text-sm pr-3">${sonidoNombre}</span>
                    </div>
                </div>
            `;
            barraSonidoDinamica.classList.remove('hidden');
        }

        const volumenSlider = document.getElementById('volumenControl');
        const iconoVolumen = document.getElementById('icono-volumen');
        const botonPlayPausa = document.getElementById('boton-play-pausa');
        const iconoPlayPausa = document.getElementById('icono-play-pausa');
        const btnCerrarBarraSonido = document.getElementById('btn-cerrar-barra-sonido');

        if (btnCerrarBarraSonido) {
            btnCerrarBarraSonido.addEventListener('click', () => {
                const audio = sonidos[localStorage.getItem('sonidoId')]; 
                const radioActual = document.getElementById(localStorage.getItem('sonidoId'));

                if (audio) {
                    audio.pause();
                    audio.currentTime = 0; 
                }

                if (radioActual) {
                    radioActual.checked = false;
                }

                barraSonidoDinamica.classList.add('hidden');
                localStorage.removeItem('sonidoActivo');
                localStorage.removeItem('sonidoId');
                
                iconoSonido.src = window.rutaSinVolumen;
            });
        }
        
        if (botonPlayPausa) {
            botonPlayPausa.addEventListener('click', () => {
                if (sonidoSeleccionado.paused) {
                    sonidoSeleccionado.play();
                    iconoPlayPausa.src = window.rutaPausar;
                    localStorage.setItem('sonidoActivo', 'true');
                } else {
                    sonidoSeleccionado.pause();
                    localStorage.setItem('sonidoActivo', 'false');
                    localStorage.setItem('sonidoTiempo', sonidoSeleccionado.currentTime);
                    iconoPlayPausa.src = window.rutaPlay;
                }
                actualizarIconoSonido();
            }); 
        }

        if (volumenSlider) {
            volumenSlider.addEventListener('input', function () {
                const nuevoVol = parseFloat(this.value);
                sonidoSeleccionado.volume = nuevoVol;
                localStorage.setItem('volumenSonido', nuevoVol);
                iconoVolumen.src = nuevoVol > 0 ? window.rutaConVolumen : window.rutaSinVolumen;
            });
        }
    }
    
    setTimeout(() => {
        if (sonidoId && sonidos[sonidoId]) {
            if (toggleSonidoBtn) {
                toggleSonidoBtn.classList.remove('hidden');
            }
            const sonido = sonidos[sonidoId];
            if (volumenGuardado) sonido.volume = parseFloat(volumenGuardado);

            if (sonidoActivo) {
                sonido.play().catch(() => {
                    iconoSonido.src = window.rutaSinVolumen;
                });
            }
            
            manejarBarraControl(sonidoId);
            
            actualizarIconoSonido();
        }
    }, 300);

    const iconoPantallaCompleta = document.getElementById('icono-pantalla-completa');

    if (iconoPantallaCompleta) {
        iconoPantallaCompleta.addEventListener('click', () => {
            if(document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                document.documentElement.requestFullscreen();
            }
        })
    }

    // Cambio de sonido
    const radios = document.querySelectorAll('input[name="sonido-ambiente"]');

    radios.forEach(radio => {
        radio.addEventListener('change', () => {
            for (let i in sonidos) {
                sonidos[i].pause();
                sonidos[i].currentTime = 0;
            }

            if (radio.checked) {
                localStorage.setItem('sonidoId', radio.id);
                localStorage.setItem('sonidoActivo', 'true');

                const sonidoSeleccionado = sonidos[radio.id];
                sonidoSeleccionado.volume = 1;
                sonidoSeleccionado.play();

                actualizarIconoSonido();
                
                manejarBarraControl(radio.id); 

                barraSonidoDinamica.classList.remove('hidden');
            }
        });
    });
});