function crearContenedorNotificacionRecompensa() {
  const contenedor = document.createElement('div');
  contenedor.id = 'contenedor-notificaciones';
  document.body.appendChild(contenedor);
  return contenedor;
}

function mostrarNotificacionRecompensa(logro) {
    const sonidoNotificacionRecompensa = document.getElementById('sonido-notificacion-recompensa');
    const idNotificacion = `notificacion-logro-${logro.id}`;
    const contenedor = document.getElementById('contenedor-notificaciones') || crearContenedorNotificacionRecompensa();
    const notificacion = document.createElement('div');

    notificacion.id = idNotificacion;
    notificacion.classList.add('notificacion-logro');
    notificacion.innerHTML = `
        <div class="logro-texto fixed bottom-4 right-4 z-50 bg-neutral-900 p-1 rounded-full shadow-lg">
            <div class="p-3">
                <h4>¡Recompensa obtenida! 🏆</h4>
                <p class="logro-nombre">${logro.nombre}</p>
                <a href="${logrosUrl}" class="text-right">Ver</a>
            </div>
        </div>
    `;
    sonidoNotificacionRecompensa.play();
    contenedor.appendChild(notificacion);
    setTimeout(() => {
        notificacion.classList.add('mostrar');
    }, 10);
    setTimeout(() => {
        notificacion.classList.remove('mostrar');
        setTimeout(() => {
            notificacion.remove();
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
        const tiempoExtraDeEspera = 5000;

        if (logros && logros.length > 0) {
            const duracionNotificacion = 8200;
            let tiempoAcumulado = 0;

            logros.forEach(logro => {
                console.log(logro);
                setTimeout(() => {
                    mostrarNotificacionRecompensa(logro)
                }, tiempoAcumulado);

                tiempoAcumulado += duracionNotificacion;
            });

            const tiempoTotalEspera = tiempoAcumulado + tiempoExtraDeEspera;  

            setTimeout(() => {
                window.location.reload(); 
            }, tiempoTotalEspera);
        }
    })
    .catch(error => {
        console.error('Hubo un problema con la petición fetch:', error);
    });
}