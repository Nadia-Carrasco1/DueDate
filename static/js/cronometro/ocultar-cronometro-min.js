document.addEventListener('DOMContentLoaded', () => {
    const cronometroWrapper = document.getElementById('cronometro-wrapper');
    const toggleBtn = document.getElementById('btn-ocultar-cronometro');
    const flechaSvg = document.getElementById('flecha-ocultar'); 
    
    if (localStorage.getItem('cronometroMinimizado') === null) {
        localStorage.setItem('cronometroMinimizado', 'false');
    }
    
    let estaMinimizado = localStorage.getItem('cronometroMinimizado') === 'true';
    
    if (cronometroWrapper && toggleBtn && flechaSvg) {
        const CLASE_MINIMIZAR = 'translate-x-full'; 
        
        if (estaMinimizado) {
            cronometroWrapper.classList.add(CLASE_MINIMIZAR);
            toggleBtn.title = "Desplegar";
            toggleBtn.classList.remove('hidden');
            flechaSvg.classList.add('rotate-180');
            flechaSvg.classList.remove('rotate-0');
        } else {
            cronometroWrapper.classList.remove(CLASE_MINIMIZAR);
            toggleBtn.title = "Minimizar";
            flechaSvg.classList.remove('rotate-180'); 
            flechaSvg.classList.add('rotate-0');
        }

        toggleBtn.addEventListener('click', () => {
            if (estaMinimizado) {
                cronometroWrapper.classList.remove(CLASE_MINIMIZAR);
                toggleBtn.title = "Minimizar";
                flechaSvg.classList.remove('rotate-180'); 
                flechaSvg.classList.add('rotate-0');
                toggleBtn.classList.add('hidden'); 
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
            toggleBtn.classList.remove('hidden'); 
        });
    }
});