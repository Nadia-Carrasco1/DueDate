let form = null; 

function isVideoUrl(url) {
    return url && (url.startsWith('vid/') || url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.ogg'));
}

function seleccionarFondoParaSubmit(radioId) {
    if (!form) {
        console.error('Error: El formulario form-fondos-personalizar no fue inicializado');
        return;
    }

    const csrfToken = form.querySelector('input[name="csrfmiddlewaretoken"]').value;
    const aplicarFondoUrl = form.action; 

    const radio = document.getElementById(radioId);
    
    if (!radio) {
        console.error(`No se encontró el radio button con id: ${radioId}`);
        return;
    }

    const recompensaValue = radio.value; 

    radio.checked = true;
    
    const formData = new FormData();
    formData.append('csrfmiddlewaretoken', csrfToken);
    formData.append('recompensa_seleccionada', recompensaValue); 

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
            const videoFondo = document.getElementById('fondo-dinamico-video');
            
            const fullStaticUrl = data.fondo_url; 
            
            if (fullStaticUrl.includes('vid/')) { 
                cronometroGrande.style.backgroundImage = 'none';
                
                if (videoFondo) {
                    videoFondo.src = fullStaticUrl;
                    videoFondo.classList.remove('hidden');
                    videoFondo.classList.add('block');
                    videoFondo.load(); 
                    videoFondo.play().catch(e => console.log('Autoplay blocked:', e)); 
                }

            } else {
                cronometroGrande.style.backgroundImage = `url('${fullStaticUrl}')`; 
                
                if (videoFondo) {
                    videoFondo.classList.add('hidden'); 
                    videoFondo.classList.remove('block');
                    videoFondo.pause();
                }
            }
        }
    })
    .catch(error => console.error('Error al aplicar fondo:', error));
}

document.addEventListener('DOMContentLoaded', function() {
    form = document.getElementById('form-fondos-personalizar');
    
    if (!form) {
        console.error('El elemento #form-fondos-personalizar no se encontró');
    }
    
    const videoFondo = document.getElementById('fondo-dinamico-video');
    if (videoFondo && videoFondo.classList.contains('block') && videoFondo.src) {
        videoFondo.play().catch(e => console.log('Autoplay inicial bloqueado:', e));
    }
});