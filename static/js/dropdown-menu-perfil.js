document.addEventListener('DOMContentLoaded', function() {
    const boton = document.getElementById('dropdown-boton');
    const menu = document.getElementById('dropdown-menu');

    if (boton && menu) {
        function controlarMenu() {
            menu.classList.toggle('hidden');

            const estaExpandido = !menu-classList.contains('hidden');
            boton.setAttribute('aria-expanded', estaExpandido);
        }
    }
    
    boton.addEventListener('click', function(event) {
        event.stopPropagation();
        controlarMenu();
    });

    document.addEventListener('click', function(event) {
         if (!boton.contains(event.target) && !menu.contains(event.target)) {
            if (!menu.classList.contains('hidden')) {
                menu.classList.add('hidden');
                boton.setAttribute('aria-expanded', 'false');
            }
        }
    });
});