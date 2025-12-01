document.addEventListener('DOMContentLoaded', () => {
    const cronometroWrapper = document.getElementById('cronometro-wrapper');
    const toggleBtn = document.getElementById('btn-ocultar-cronometro');
    const flechaSvg = document.getElementById('flecha-ocultar'); 
    
    let estaMinimizado = localStorage.getItem('cronometroMinimizado') === 'false';
    
    if (cronometroWrapper && toggleBtn && flechaSvg) {
        const CLASE_MINIMIZAR = 'translate-x-full'; // translate-x-full mueve el 100% del ancho del elemento
        
        if (estaMinimizado) {
            cronometroWrapper.classList.remove(CLASE_MINIMIZAR);
            toggleBtn.title = "Minimizar";
            toggleBtn.classList.add('hidden'); 
            flechaSvg.classList.remove('rotate-180'); 
            flechaSvg.classList.add('rotate-0');
        } else {
            cronometroWrapper.classList.add(CLASE_MINIMIZAR);
            toggleBtn.title = "Desplegar";
            toggleBtn.classList.remove('hidden'); 
            flechaSvg.classList.add('rotate-180');
            flechaSvg.classList.remove('rotate-0'); 
        }

        toggleBtn.addEventListener('click', () => {
            if (estaMinimizado) {
                cronometroWrapper.classList.remove(CLASE_MINIMIZAR);
                toggleBtn.title = "Minimizar";
                toggleBtn.classList.add('hidden'); 
                flechaSvg.classList.remove('rotate-180'); 
                flechaSvg.classList.add('rotate-0');
            } else {
                cronometroWrapper.classList.add(CLASE_MINIMIZAR);
                toggleBtn.title = "Desplegar";
                flechaSvg.classList.add('rotate-180');
                flechaSvg.classList.remove('rotate-0'); 
            }
            
            estaMinimizado = !estaMinimizado;
            localStorage.setItem('cronometroMinimizado', estaMinimizado);
        });

        cronometroWrapper.addEventListener('mouseenter', () => {
             cronometroWrapper.classList.add('opacity-100');
             cronometroWrapper.classList.remove('opacity-60');
             toggleBtn.classList.remove('hidden'); 
        });

        cronometroWrapper.addEventListener('mouseleave', () => {
             cronometroWrapper.classList.add('opacity-60');
             cronometroWrapper.classList.remove('opacity-100');
        });
    }
});