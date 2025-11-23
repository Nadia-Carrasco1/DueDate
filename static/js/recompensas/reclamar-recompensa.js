function reclamarRecompensa(logroId) {
    const csrfToken = CSRF_TOKEN;

    fetch(`/Logros/${logroId}/reclamar/`, {
         method: 'POST',
         headers: {
             'Conten-Type': 'application/json',
             'X-CSRFToken': csrfToken
         },
     })
     .then(response => {
         if (!response.ok) {
             throw new Error('Error de red o del servidor ' + response.status);
         }
         return response.json()
     })
     .then(data => {
         console.log('Recompensa reclamada con éxito:', data);
         window.location.reload();
     })
     .catch(error => {
         console.error('Hubo un problema con la petición fetch:', error);
     });
}