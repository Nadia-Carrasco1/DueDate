document.addEventListener('DOMContentLoaded', () => {
    (function () {
        const barraSonidoDinamica = document.getElementById('barra-sonido-dinamica');

        const sonidos = {
            lluvia: document.getElementById('sonido-lluvia'),
            chimenea: document.getElementById('sonido-chimenea'),
            naturaleza: document.getElementById('sonido-naturaleza'),
            ambiente: document.getElementById('sonido-ambiente')
        };

        for (let i in sonidos) {
            sonidos[i].loop = true;
        }

        const radios = document.querySelectorAll('input[name="sonido-ambiente"]');

        radios.forEach(radio => {
            radio.addEventListener('change', () => {
                for (let i in sonidos) {
                    sonidos[i].pause();
                    sonidos[i].currentTime = 0;
                }

                if (radio.checked) {
                    sonidoNombre = String(radio.id).charAt(0).toUpperCase() + String(radio.id).slice(1);
                    const btnSonidos = `
                              <button id="boton-play-pausa">
                                  <img id="icono-play-pausa" src="${window.rutaPausar}" alt="Boton play pausa" class="h-6 w-6">
                              </button>
                          `;

                    const sonidoSeleccionado = sonidos[radio.id];
                    sonidoSeleccionado.volume = 1;
                    
                    barraSonidoDinamica.innerHTML = `
                        <div class="flex items-center justify-between text-white w-full">
                            <div class="flex items-center space-x-2">
                                ${btnSonidos}
                                <input type="range" id="volumenControl" min="0" max="1" step="0.01" value="${sonidoSeleccionado.volume}">
                                <img id="icono-volumen" src="${window.rutaConVolumen}" alt="Icono volumen" class="h-6 w-6">
                                <span id="nombre-sonido" class="font-bold">${sonidoNombre}</span>
                            </div>
                        </div>
                    `;

                    const volumenSlider = document.getElementById('volumenControl');
                    const iconoVolumen = document.getElementById('icono-volumen');

                    const botonPlayPausa = document.getElementById('boton-play-pausa');
                    const iconoPlayPausa = document.getElementById('icono-play-pausa');
                    const iconoPantallaCompleta = document.getElementById('icono-pantalla-completa');
                    
                    iconoPantallaCompleta.addEventListener('click', () => {
                        if(document.fullscreenElement) {
                            document.exitFullscreen();
                        } else {
                            document.documentElement.requestFullscreen();
                        }
                    })

                    botonPlayPausa.addEventListener('click', () => {
                        if (sonidoSeleccionado.paused) {
                            sonidoSeleccionado.play();
                            iconoPlayPausa.src = window.rutaPausar;
                        } else {
                            sonidoSeleccionado.pause();
                            iconoPlayPausa.src = window.rutaPlay;
                        }
                    });

                    volumenSlider.addEventListener('input', function () {
                        const nuevoVol = parseFloat(this.value);
                        sonidoSeleccionado.volume = nuevoVol;

                        if (iconoVolumen) {
                            iconoVolumen.src = nuevoVol > 0
                                ? window.rutaConVolumen
                                : window.rutaSinVolumen;
                        }
                    });

                    sonidoSeleccionado.play();
                }
            });
        });
    })();
});
