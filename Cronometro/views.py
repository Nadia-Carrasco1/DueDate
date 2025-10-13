from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_protect
from django.http import JsonResponse
from django.utils.timezone import now
from django.shortcuts import render, redirect
from Cronometro.forms import SesionEstudioForm
from .models import SesionEstudio

def mostrar_cronometro(request):
    form = SesionEstudioForm()
    
    tiempo_estudio_segundos = 0
    tiempo_descanso_segundos = 0
    repeticiones = 0
    sesion = None

    if request.user.is_authenticated:
        ultima_sesion = SesionEstudio.objects.filter(user=request.user, fecha_fin__isnull=True).order_by('-fecha_creacion').first()

        if ultima_sesion:
            tiempo_estudio_segundos = int(ultima_sesion.tiempo_estudio.total_seconds())
            tiempo_descanso_segundos = int(ultima_sesion.tiempo_descanso.total_seconds())
            repeticiones = ultima_sesion.repeticiones
            sesion = ultima_sesion.id  
    
    return render(request, 'Cronometro.html', {
        'form': form,
        'tiempo_estudio_segundos': tiempo_estudio_segundos,
        'tiempo_descanso_segundos': tiempo_descanso_segundos,
        'repeticiones': repeticiones,
        'sesion': sesion
    })

@login_required
def crear_sesion_estudio(request):
    if request.method == 'POST':
        form = SesionEstudioForm(request.POST)
        if form.is_valid():
            sesion_estudio = form.save(commit=False)
            sesion_estudio.user = request.user
            sesion_estudio.save()
            return redirect('cronometro')
    else:
        form = SesionEstudioForm()

    return render(request, 'Cronometro.html', {'form': form})

@login_required
@csrf_protect
def finalizar_sesion(request):
    if request.method == 'POST':
        sesion_id = request.POST.get('sesion_id')
        minutos = request.POST.get('minutos_estudiados')
        try:
            sesion = SesionEstudio.objects.get(id=sesion_id, user=request.user)
            nuevos_minutos = float(minutos) if minutos is not None else 0

            if nuevos_minutos > sesion.meta_minutos_alcanzados:
                sesion.meta_minutos_alcanzados = nuevos_minutos

            if not sesion.fecha_fin and 'finalizar' in request.POST:
                sesion.fecha_fin = now()

            sesion.save()

            return JsonResponse({'status': 'ok'})
        except SesionEstudio.DoesNotExist:
            return JsonResponse({'error': 'Sesión no encontrada'}, status=404)

    return JsonResponse({'error': 'Método no permitido'}, status=405)