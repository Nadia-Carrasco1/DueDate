document.addEventListener('DOMContentLoaded', () => {
    const barraSonido = document.getElementById('barra-sonido');
    const barraSonidoDinamica = document.getElementById('barra-sonido-dinamica');
    const toggleSonidoBtn = document.getElementById('toggle-sonido');
    const iconoSonido = document.getElementById('icono-sonido');
    const sonidoId = localStorage.getItem('sonidoId');
    const sonidoActivo = localStorage.getItem('sonidoActivo');
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
        ambiente: document.getElementById('sonido-ambiente')
    };

    for (let i in sonidos) {
        sonidos[i].loop = true;
    }

    // Restaurar sonido guardado
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

            actualizarIconoSonido();
        }
    }, 300);

    // Icono de volumen interactivo
    function actualizarIconoSonido() {
        if (!iconoSonido || !toggleSonidoBtn) return;

        if (sonidoId && sonidos[sonidoId]) {
            const sonido = sonidos[sonidoId];

            setTimeout(() => {
                const estaReproduciendo = !sonido.paused && sonido.readyState >= 2;

                iconoSonido.src = estaReproduciendo ? window.rutaConVolumen : window.rutaSinVolumen;

                toggleSonidoBtn.onclick = () => {
                    if (sonido.paused) {
                        sonido.play().then(() => {
                            localStorage.setItem('sonidoActivo', 'true');
                            iconoSonido.src = window.rutaConVolumen;
                        }).catch(() => {
                            iconoSonido.src = window.rutaSinVolumen;
                        });
                    } else {
                        sonido.pause();
                        localStorage.setItem('sonidoActivo', 'false');
                        iconoSonido.src = window.rutaSinVolumen;
                    }
                };
            }, 300);
        }
    }

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

    // Cambiar
    if (sonidoId && sonidoActivo && sonidos[sonidoId]) {
        const sonidoSeleccionado = sonidos[sonidoId];
        const sonidoNombre = sonidoId.charAt(0).toUpperCase() + sonidoId.slice(1);

        const btnSonidos = `
            <button id="boton-play-pausa">
                <img id="icono-play-pausa" src="${window.rutaPausar}" alt="Boton play pausa" class="h-4 w-4">
            </button>
        `;

        if (barraSonido) {
            barraSonidoDinamica.innerHTML = `
              <div class="flex items-center justify-between text-white w-full rounded-full bg-black/80 px-3 py-3">
                  <div class="flex items-center justify-center space-x-2">
                      <img src="${window.rutaBtnCerrarBarraSonido}" alt="Botón cerrar" id="btn-cerrar-barra-sonido" class="p-1 w-5 h-5 hover:bg-neutral-700/20 hover:rounded-full hover:cursor-pointer" title="Cerrar">
                      ${btnSonidos}
                      <input type="range" id="volumenControl" min="0" max="1" step="0.01" class="accent-indigo-700" value="${volumenGuardado || 1}">
                      <img id="icono-volumen" src="${window.rutaConVolumen}" alt="Icono volumen" class="h-5 w-5">
                      <span id="nombre-sonido" class="text-sm pr-3">${sonidoNombre}</span>
                  </div>
              </div>
            `;
        }

        const volumenSlider = document.getElementById('volumenControl');
        const iconoVolumen = document.getElementById('icono-volumen');
        const botonPlayPausa = document.getElementById('boton-play-pausa');
        const iconoPlayPausa = document.getElementById('icono-play-pausa');

        sonidoSeleccionado.volume = parseFloat(volumenGuardado || 1);
        sonidoSeleccionado.play();

        if (botonPlayPausa) {
            botonPlayPausa.addEventListener('click', () => {
                if (sonidoSeleccionado.paused) {
                    sonidoSeleccionado.play();
                    iconoPlayPausa.src = window.rutaPausar;
                    localStorage.setItem('sonidoActivo', 'true');
                } else {
                    sonidoSeleccionado.pause();
                    iconoPlayPausa.src = window.rutaPlay;
                    localStorage.setItem('sonidoActivo', 'false');
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
                console.log(sonidoSeleccionado + " aaaaaaaaaaaa");
                sonidoSeleccionado.volume = 1;
                sonidoSeleccionado.play();

                actualizarIconoSonido();

                const sonidoNombre = radio.id.charAt(0).toUpperCase() + radio.id.slice(1);
                const btnSonidos = `
                    <button type="button" id="boton-play-pausa">
                        <img id="icono-play-pausa" src="${window.rutaPausar}" alt="Boton play pausa" class="h-4 w-4">
                    </button>
                `;
                
                barraSonidoDinamica.innerHTML = `
                    <div class="flex items-center justify-between text-white w-full rounded-full bg-black/80 px-3 py-3">
                        <div class="flex items-center justify-center space-x-2">
                            <img src="${window.rutaBtnCerrarBarraSonido}" alt="Botón cerrar" id="btn-cerrar-barra-sonido" class="p-1 w-5 h-5 hover:bg-neutral-700/20 hover:rounded-full hover:cursor-pointer" title="Cerrar">
                            ${btnSonidos}
                            <input type="range" id="volumenControl" min="0" max="1" step="0.01" class="accent-indigo-700" value="${sonidoSeleccionado.volume}">
                            <img id="icono-volumen" src="${window.rutaConVolumen}" alt="Icono volumen" class="h-5 w-5">
                            <span id="nombre-sonido" class="text-sm pr-3">${sonidoNombre}</span>
                        </div>
                    </div>
                `;

                barraSonidoDinamica.classList.remove('hidden');

                const volumenSlider = document.getElementById('volumenControl');
                const iconoVolumen = document.getElementById('icono-volumen');
                const botonPlayPausa = document.getElementById('boton-play-pausa');
                const iconoPlayPausa = document.getElementById('icono-play-pausa');

                const btnCerrarBarraSonido = document.getElementById('btn-cerrar-barra-sonido');

                if (btnCerrarBarraSonido) {
                    btnCerrarBarraSonido.addEventListener('click', () => {
                        const audio = sonidos[radio.id]; 
                        const sonidoId = localStorage.getItem('sonidoId');
                        const radioActual = document.getElementById(sonidoId);

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
                    });
                }

                botonPlayPausa.addEventListener('click', () => {
                    if (sonidoSeleccionado.paused) {
                        sonidoSeleccionado.play();
                        iconoPlayPausa.src = window.rutaPausar;
                        localStorage.setItem('sonidoActivo', 'true');
                    } else {
                        sonidoSeleccionado.pause();
                        iconoPlayPausa.src = window.rutaPlay;
                        localStorage.setItem('sonidoActivo', 'false');
                    }
                    actualizarIconoSonido();
                });

                if (volumenSlider){
                    volumenSlider.addEventListener('input', function () {
                        const nuevoVol = parseFloat(this.value);
                        sonidoSeleccionado.volume = nuevoVol;
                        localStorage.setItem('volumenSonido', nuevoVol);
                        iconoVolumen.src = nuevoVol > 0 ? window.rutaConVolumen : window.rutaSinVolumen;
                    });
                }
            }
        });
    });
});