(function() {
    const dataCronometro = document.getElementById('cronometro-data');

    const tiempoEstudioEnSegundos = dataCronometro ? parseInt(dataCronometro.dataset.tiempoEstudio) : 0;
    const tiempoDescansoEnSegundos = dataCronometro ? parseInt(dataCronometro.dataset.tiempoDescanso) : 0;
    const repeticionesTotales = dataCronometro ? parseInt(dataCronometro.dataset.repeticiones) : 0;
    const sesionId = dataCronometro ? dataCronometro.dataset.sesionId : null;
    const csrftoken = dataCronometro ? dataCronometro.dataset.csrfToken : null;
    const finalizarSesionUrl = dataCronometro ? dataCronometro.dataset.finalizarUrl : null;

    let tiempoEstudioInicial = tiempoEstudioEnSegundos;
    let tiempoDescansoInicial = tiempoDescansoEnSegundos;
    let estaCorriendo = false;
    let esModoEstudio = true;
    let tiempoRestante = tiempoEstudioInicial;
    let intervaloTemporizador;
    let repeticionesSesionActual = 0;
    let sesionFinalizada = false;
    let segundosEstudiados = 0
    let fondoUrl = document.getElementById('fondo-url');

    if (fondoUrl) {
        const urlValue = fondoUrl.textContent.trim(); 
        localStorage.setItem('fondoUrl', urlValue);

        
        console.log("Fondo URL guardada en localStorage:", urlValue);
    }

    const visorModo = document.getElementById('modo-actual');
    const cronometro = document.getElementById('cronometro');
    const btnIniciar = document.getElementById('btn-iniciar');
    //const btnPausar = document.getElementById('btn-pausar');
    const audioFinEstudio = document.getElementById('audio-fin-estudio');
    const audioFinDescanso = document.getElementById('audio-fin-descanso');
    const audioFinSesionEstudio = document.getElementById('audio-fin-sesion-estudio');

    const estadoGuardado = JSON.parse(localStorage.getItem('estado_cronometro'));

    if (estadoGuardado && estadoGuardado.sesionId === sesionId) {
        const tiempoTranscurrido = Math.floor((Date.now() - estadoGuardado.timestamp) / 1000);
        tiempoRestante = Math.max(estadoGuardado.tiempoRestante - tiempoTranscurrido, 0);
        esModoEstudio = estadoGuardado.esModoEstudio;
        repeticionesSesionActual = estadoGuardado.repeticionesSesionActual;
        segundosEstudiados = estadoGuardado.segundosEstudiados + tiempoTranscurrido;

        const ciclos = `<p>Ciclo ${repeticionesSesionActual}/${repeticionesTotales} -</p> `
        visorModo.innerHTML = esModoEstudio ? `${ciclos} Modo <span>estudio 📖</span>` : `${ciclos} Modo <span>descanso 😌</span>`;

        actualizarVista();
        iniciarTemporizador();
    }

    function actualizarVista() {
        const horas = Math.floor(tiempoRestante / 3600);
        const minutos = Math.floor((tiempoRestante % 3600) / 60);
        const segundos = tiempoRestante % 60;
        const visor = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;

        if (cronometro) { cronometro.textContent = visor; }
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
            if (tiempoEstudioEnSegundos > 0) { 
                btnIniciar.disabled = true; 
                btnIniciar.innerHTML = `<img src="${window.rutaPausar}" alt="Cronometro iniciado" class="h-4 w-4" title="Bloqueado"></img>`;
            }
            //btnPausar.disabled = false;
            intervaloTemporizador = setInterval(tic, 1000);
        }
    }

    /*function pausarTemporizador() {
        if (estaCorriendo) {
            estaCorriendo = false;
            btnIniciar.disabled = false;
            btnPausar.disabled = true;
            clearInterval(intervaloTemporizador);
        }
    }*/

    function cambiarModo() {
        esModoEstudio = !esModoEstudio;
        btnIniciar.disabled = false;
        if (esModoEstudio) {
            if (tiempoDescansoInicial) {
                audioFinDescanso.play();
            }

            const ciclos = `<p>Ciclo ${repeticionesSesionActual}/${repeticionesTotales} -</p> `
            visorModo.innerHTML = `${ciclos} Modo <span>estudio 📖</span>`;
            tiempoRestante = tiempoEstudioInicial;
            iniciarTemporizador()
        } else {
            repeticionesSesionActual++;
            const ciclos = `<p>Ciclo ${repeticionesSesionActual}/${repeticionesTotales} -</p> `

            if ((repeticionesSesionActual < repeticionesTotales) && repeticionesSesionActual != 0) {
                audioFinEstudio.play();

                tiempoRestante = tiempoDescansoInicial;
                visorModo.innerHTML = `${ciclos} Modo <span>descanso 😌</span>`;
                iniciarTemporizador()
            } else {
                if (repeticionesSesionActual == repeticionesTotales) {
                    audioFinSesionEstudio.play();
                }

                cronometro.innerHTML = "00:00:00";
                if (repeticionesTotales) {
                    visorModo.innerHTML = `<p>${ciclos} Sesión finalizada 🙌</p>`;
                }
                btnIniciar.innerHTML = `<img src="${window.rutaPlay}" alt="Boton play" class="h-4 w-4"></img>`
                btnIniciar.disabled = true;
                //btnPausar.disabled = true;
                finalizarSesion();
            }
        }
        actualizarVista();
    }

    if (btnIniciar) { btnIniciar.addEventListener('click', iniciarTemporizador); }
    //if (btnPausar) { btnPausar.addEventListener('click', pausarTemporizador); }

    actualizarVista();

    function actualizarProgresoParcial() {
        const minutos = segundosEstudiados / 60;

        const data = new FormData();
        data.append('minutos_estudiados', minutos);
        data.append('sesion_id', sesionId);
        data.append('csrfmiddlewaretoken', csrftoken);
        data.append('verificar_logros', 'MINUTOS_ACUMULADOS');

        fetchVerificaLogros(data);
    }

    function finalizarSesion() {
        if (sesionFinalizada) return;
        sesionFinalizada = true;
        localStorage.removeItem('sonidoId');
        localStorage.removeItem('sonidoActivo');
        localStorage.removeItem('estado_cronometro');
        const minutosEstudiados = (repeticionesSesionActual * tiempoEstudioInicial) / 60;

        const data = new FormData();
        data.append('minutos_estudiados', minutosEstudiados);
        data.append('sesion_id', sesionId);
        data.append('verificar_logros', 'SESIONES_COMPLETADAS');
        data.append('csrfmiddlewaretoken', csrftoken);
        data.append('finalizar', 1); // para que Django cierre la sesión

        fetchVerificaLogros(data);
    }

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
            sesionId,
        };
        localStorage.setItem('estado_cronometro', JSON.stringify(estado));
    }
})();
