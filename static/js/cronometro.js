(function() {
    const dataCronometro = document.getElementById('cronometro-data');

    const tiempoEstudioEnSegundos = parseInt(dataCronometro.dataset.tiempoEstudio);
    const tiempoDescansoEnSegundos = parseInt(dataCronometro.dataset.tiempoDescanso);
    const repeticionesTotales = parseInt(dataCronometro.dataset.repeticiones);
    const sesionId = dataCronometro.dataset.sesionId;
    const csrftoken = dataCronometro.dataset.csrfToken;
    const finalizarSesionUrl = dataCronometro.dataset.finalizarUrl;

    let tiempoEstudioInicial = tiempoEstudioEnSegundos;
    let tiempoDescansoInicial = tiempoDescansoEnSegundos;
    let estaCorriendo = false;
    let esModoEstudio = true;
    let tiempoRestante = tiempoEstudioInicial;
    let intervaloTemporizador;
    let repeticionesSesionActual = 0;
    let sesionFinalizada = false;
    let segundosEstudiados = 0

    const visorRepeticiones = document.getElementById('repeticiones');
    const visorModo = document.getElementById('modo-actual');
    const cronometro = document.getElementById('cronometro');
    const btnIniciar = document.getElementById('btn-iniciar');
    const btnPausar = document.getElementById('btn-pausar');
    const audioFinEstudio = document.getElementById('audio-fin-estudio')
    const audioFinDescanso = document.getElementById('audio-fin-descanso')
    const audioFinSesionEstudio = document.getElementById('audio-fin-sesion-estudio')

    const estadoGuardado = JSON.parse(localStorage.getItem('estado_cronometro'));

    if (estadoGuardado && estadoGuardado.sesionId === sesionId) {
        const tiempoTranscurrido = Math.floor((Date.now() - estadoGuardado.timestamp) / 1000);
        tiempoRestante = Math.max(estadoGuardado.tiempoRestante - tiempoTranscurrido, 0);
        esModoEstudio = estadoGuardado.esModoEstudio;
        repeticionesSesionActual = estadoGuardado.repeticionesSesionActual;
        segundosEstudiados = estadoGuardado.segundosEstudiados + tiempoTranscurrido;

        visorModo.innerHTML = esModoEstudio ? "Modo <span>estudio</span>" : "Modo <span>descanso</span>";
        if (visorRepeticiones) {
            visorRepeticiones.innerHTML = `${repeticionesSesionActual}/${repeticionesTotales}`;
        }

        actualizarVista();
        iniciarTemporizador();
    }

    function actualizarVista() {
        const horas = Math.floor(tiempoRestante / 3600);
        const minutos = Math.floor((tiempoRestante % 3600) / 60);
        const segundos = tiempoRestante % 60;
        const visor = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;

        cronometro.textContent = visor;
    }

    function tic() {
        if (tiempoRestante > 0) {
            tiempoRestante--;
            actualizarVista();
            guardarEstadoCronometro();

            if (esModoEstudio) {
                segundosEstudiados++
                if (segundosEstudiados % 10 === 0) {
                    actualizarProgresoParcial();
                }
            }
        } else {
            clearInterval(intervaloTemporizador);
            estaCorriendo = false;
            cambiarModo()
        }
    }

    function iniciarTemporizador() {
        if (!estaCorriendo) {
            estaCorriendo = true;
            btnIniciar.disabled = true;
            btnPausar.disabled = false;
            intervaloTemporizador = setInterval(tic, 1000);
        }
    }

    function pausarTemporizador() {
        if (estaCorriendo) {
            estaCorriendo = false;
            btnIniciar.disabled = false;
            btnPausar.disabled = true;
            clearInterval(intervaloTemporizador);
        }
    }

    function cambiarModo() {
        esModoEstudio = !esModoEstudio;
        btnIniciar.disabled = false;
        if (esModoEstudio) {
            if (tiempoDescansoInicial) {
                audioFinDescanso.play();
            }

            visorModo.innerHTML = "Modo <span>estudio</span>";
            tiempoRestante = tiempoEstudioInicial;
            iniciarTemporizador()
        } else {
            repeticionesSesionActual++;
            
            if ((repeticionesSesionActual < repeticionesTotales) && repeticionesSesionActual != 0) {
                audioFinEstudio.play();

                visorRepeticiones.innerHTML = `Rep: ${repeticionesSesionActual}/${repeticionesTotales}`;
                tiempoRestante = tiempoDescansoInicial;
                visorModo.innerHTML = "Modo <span>descanso</span>";
                iniciarTemporizador()
            } else {
                if (repeticionesSesionActual == repeticionesTotales) {
                    audioFinSesionEstudio.play();
                }

                visorRepeticiones.innerHTML = "";
                cronometro.innerHTML = "00:00:00";
                visorModo.innerHTML = `<p class="text-center">Rep: ${repeticionesSesionActual}/${repeticionesTotales}<p> <p>Sesión finalizada ✅</p>`;
                btnIniciar.disabled = true;
                btnPausar.disabled = true;
                finalizarSesion();
            }
        }
        actualizarVista();
    }

    btnIniciar.addEventListener('click', iniciarTemporizador);
    btnPausar.addEventListener('click', pausarTemporizador);

    actualizarVista();

    function actualizarProgresoParcial() {
        const minutos = segundosEstudiados / 60;

        const data = new FormData();
        data.append('minutos_estudiados', minutos);
        data.append('sesion_id', sesionId);
        data.append('csrfmiddlewaretoken', csrftoken);

        fetch(finalizarSesionUrl, {
            method: 'POST',
            body: data,
            credentials: 'same-origin',
        });
    }

    function finalizarSesion() {
        if (sesionFinalizada) return;
        sesionFinalizada = true;
        localStorage.removeItem('sonidoId');
        localStorage.removeItem('sonidoActivo');
        localStorage.removeItem('estado_cronometro');
        console.log('asdadasdadasddadas');
        const minutosEstudiados = (repeticionesSesionActual * tiempoEstudioInicial) / 60;

        const data = new FormData();
        data.append('minutos_estudiados', minutosEstudiados);
        data.append('sesion_id', sesionId);
        data.append('csrfmiddlewaretoken', csrftoken);
        data.append('finalizar', 1); // para que Django cierre la sesión

        fetch(finalizarSesionUrl, {
            method: 'POST',
            body: data,
            credentials: 'same-origin',
        });
    }

    /*window.addEventListener('unload', function () {
        if (sesionId && sesionId !== "None" && !sesionFinalizada) {
            const minutosEstudiados = segundosEstudiados / 60;

            const data = new URLSearchParams();
            data.append('minutos_estudiados', minutosEstudiados);
            data.append('sesion_id', sesionId);
            data.append('csrfmiddlewaretoken', csrftoken);
            data.append('finalizar', 1); // para que Django cierre la sesión

            navigator.sendBeacon(finalizarSesionUrl, data);
        }
    });*/

    let navegacionInterna = false;

    // Detecta navegación interna (clic en enlaces o formularios)
    document.addEventListener('click', function (e) {
        const target = e.target.closest('a, form');
        if (target && target.href && target.href.includes(window.location.origin)) {
            navegacionInterna = true;
        }
    });

    // Detecta cierre de pestaña o ventana (no navegación ni recarga)
    window.addEventListener('pagehide', function (event) {
        const esRecarga = performance.getEntriesByType("navigation")[0]?.type === "reload";
        const cerrandoVentana = document.visibilityState === 'hidden' && !navegacionInterna && !esRecarga;

        if (cerrandoVentana) {
            localStorage.clear();                
            finalizarSesion();
        }
    });

    if (performance.getEntriesByType("navigation")[0].type === "back_forward") {
        window.location.reload();
    }

    function guardarEstadoCronometro() {
        const estado = {
            tiempoRestante,
            esModoEstudio,
            repeticionesSesionActual,
            segundosEstudiados,
            timestamp: Date.now(),
            sesionId
        };
        localStorage.setItem('estado_cronometro', JSON.stringify(estado));
    }
})();
