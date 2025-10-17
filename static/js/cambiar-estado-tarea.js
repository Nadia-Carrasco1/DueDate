$(document).ready(function() {
    const $cantTareasPendientes = $('#cant_tareas_pendientes');
    
    function revertirCambios($checkbox, $elementoSpan, $contadorSpan, noChecked, contadorAnterior) {
        $checkbox.prop('checked', !noChecked); 
        $contadorSpan.text(contadorAnterior);
        if (noChecked) { // Si originalmente estaba marcada el usuario intentó desmarcar
            $elementoSpan.css({'text-decoration': 'none', 'color': 'inherit'});
        } else {
            $elementoSpan.css({'text-decoration': 'line-through', 'color': 'gray'});
        }
    }

    $('.tarea-checkbox').on('change', function() {
        var $checkbox = $(this);
        var $elementoSpan = $checkbox.closest('label').find('span');
        var tareaId = $checkbox.data('tarea-id'); 
        var url = `/Tarea/${tareaId}/estado/`;

        var contadorActual = parseInt($cantTareasPendientes[0].innerText.trim())  || 0; 
        
        const estaChecked = $checkbox.prop('checked');

        if (estaChecked) {
            var nuevoValor = contadorActual > 0 ? contadorActual - 1 : 0;

            $cantTareasPendientes.text(nuevoValor);
            $elementoSpan.css({'text-decoration': 'line-through', 'color': 'gray'});
        } else {
            var nuevoValor = contadorActual + 1;

            $cantTareasPendientes.text(nuevoValor);
            $elementoSpan.css({'text-decoration': 'none', 'color': 'inherit'});
        }

        $.ajax({
            url: url,
            method: 'POST',
            headers: {
                'X-CSRFToken': $('[name="csrfmiddlewaretoken"]').val() 
            },
            success: function(response) {
                if (response.success === false) {
                    revertirCambios($checkbox, $elementoSpan, $cantTareasPendientes, estaChecked, contadorActual);
                }
            },
            error: function(xhr, status, error) {
                revertirCambios($checkbox, $elementoSpan, $cantTareasPendientes, estaChecked, contadorActual);
            }
        });
    });
});