function crearContenedorNotificacionRecompensa() {
  const contenedor = document.createElement('div');
  contenedor.id = 'contenedor-notificaciones';
  document.body.appendChild(contenedor);

  return contenedor;
}

function mostrarNotificacionRecompensa(logro, esUltimo = false) {
    const sonidoNotificacionRecompensa = document.getElementById('sonido-notificacion-recompensa');
    const idNotificacion = `notificacion-logro-${logro.id}`;
    const contenedor = document.getElementById('contenedor-notificaciones') || crearContenedorNotificacionRecompensa();
    const notificacion = document.createElement('div');

    notificacion.id = idNotificacion;
    notificacion.classList.add('notificacion-logro'); 
    notificacion.innerHTML = `
        <a href="${logrosUrl}">
            <div class="logro-texto fixed bottom-4 left-32 z-50 p-1 rounded-full shadow-lg bg-gradient-to-r from-indigo-700 from-10% via-indigo-800 via-30% to-indigo-900 to-90%">
                <div class="p-3 hover:underline">
                    <h4 class="font-bold">¡Recompensa obtenida!</h4>
                    <p class="logro-nombre">${logro.nombre}</p>
                </div>
            </div>
        </a>
    `;
    
    if (sonidoNotificacionRecompensa) {
        sonidoNotificacionRecompensa.play();
    }
    
    contenedor.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.classList.add('mostrar');
    }, 10);
    
    setTimeout(() => {
        notificacion.classList.remove('mostrar');
        
        setTimeout(() => {
            notificacion.remove();
            
            if (esUltimo) {
                window.location.reload(); 
            }
        }, 1000); 
    }, 7000); 
}

function fetchVerificaLogros(data) {
    fetch(finalizarSesionUrl, {
        method: 'POST',
        body: data,
        credentials: 'same-origin',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error de red o del servidor ' + response.status);
        }
        return response.json()
    })
    .then(data => {
        const logros = data.logros_desbloqueados;

        if (logros && logros.length > 0) {
            const duracionNotificacion = 6200;
            let tiempoAcumulado = 0;
            const totalLogros = logros.length;

            logros.forEach((logro, index) => {
                const esUltimo = index === totalLogros - 1;

                console.log(logro);
                setTimeout(() => {
                    mostrarNotificacionRecompensa(logro, esUltimo); 
                }, tiempoAcumulado);

                tiempoAcumulado += duracionNotificacion;
            });
        }
    })
    .catch(error => {
        console.error('Hubo un problema con la petición fetch:', error);
    });
}