from django.shortcuts import render
from .models import LogroUsuario
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_POST
import json
from .utils import verificar_logros_us_debloqueados

@login_required
def mostrar_logros(request):
    logros_us = verificar_logros_us_debloqueados(usuario=request.user)

    return render(request, 'Logros.html', {
        'logros': logros_us['logros'],
        'cant_logros_completados': logros_us['cant_logros_completados'],
        'cant_logros_reclamados': logros_us['cant_logros_reclamados']
    })

@login_required
@require_POST
def reclamar_recompensa(request, pk_recompensa):
    try:
        logro_id = pk_recompensa
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)

    if not logro_id:
        return JsonResponse({'error': 'ID de logro faltante'}, status=400)

    try:
        logro_usuario = LogroUsuario.objects.get(
            user=request.user, 
            logro_id=logro_id,
            reclamado=False
        )

        logro_usuario.reclamado = True
        logro_usuario.save()

        return JsonResponse({
            'status': 'success',
            'message': 'Recompensa reclamada',
            'logro_id': logro_id
        })
    except LogroUsuario.DoesNotExist:
        return JsonResponse({'error': 'Logro no encontrado o ya reclamado'}, status=404)
    except Exception as e:
        # Manejo de errores de BD o servidor
        return JsonResponse({'error': f'Error interno: {str(e)}'}, status=500)