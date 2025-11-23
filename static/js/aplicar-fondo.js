let form = null; 

function seleccionarFondoParaSubmit(radioId) {
    if (!form) {
        console.error('Error: El formulario form-fondos-personalizar fue inicializado');
        return;
    }

    const csrfToken = form.querySelector('input[name="csrfmiddlewaretoken"]').value;
    const aplicarFondoUrl = form.action; 

    const radio = document.getElementById(radioId);
    
    if (!radio) {
        console.error(`No se encontró el radio button con id: ${radioId}`);
        return;
    }

    radio.checked = true;
    
    const formData = new FormData();
    formData.append('csrfmiddlewaretoken', csrfToken);
    formData.append('recompensa_seleccionada', radio.value);

    fetch(aplicarFondoUrl, {
        method: 'POST',
        body: formData,
        credentials: 'same-origin',
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => Promise.reject(err));
        }
        return response.json();
    })
    .then(data => {
        if (data.fondo_url) {
            const cronometroGrande = document.getElementById('cronometro-grande');
            cronometroGrande.style.backgroundImage = `url(${data.fondo_url})`;
        }
    })
    .catch(error => console.error('Error al aplicar fondo:', error));
}

document.addEventListener('DOMContentLoaded', function() {
    form = document.getElementById('form-fondos-personalizar');
    
    if (!form) {
        console.error('El elemento #form-fondos-personalizar no se encontró');
    }
});