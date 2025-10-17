from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_protect
from django.http import JsonResponse
from django.utils.timezone import now
from django.shortcuts import render, redirect
from Cronometro.forms import SesionEstudioForm
from .models import SesionEstudio
from django.db.models import Sum
from django.db.models.functions import TruncWeek, TruncMonth
from django.utils.timezone import now, timedelta
from django.http import JsonResponse
from django.utils.timezone import localtime
import calendar

# Cronómetro
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

# Estadísticas
@login_required
def mostrar_estadisticas(request):
    return render(request, 'Estadisticas.html')

@login_required
def datos_estadisticas_estudio(request):
    usuario = request.user
    periodo = request.GET.get("periodo", "semana")

    hoy = now()

    if periodo == "mes":
        sesiones = (
            SesionEstudio.objects.filter(user=usuario)
            .annotate(periodo=TruncMonth('fecha_creacion'))
            .values('periodo')
            .annotate(minutos=Sum('meta_minutos_alcanzados'))
            .order_by('periodo')
        )

        labels = [s['periodo'].strftime("%Y-%m") for s in sesiones]
        data = [s['minutos'] for s in sesiones]

    elif periodo == "semana_actual":
        hoy_local = localtime(now()).date()
        lunes = hoy_local - timedelta(days=hoy_local.weekday())
        dias = [lunes + timedelta(days=i) for i in range(7)]

        etiquetas = []
        sesiones_por_dia = []

        for dia in dias:
            total = SesionEstudio.objects.filter(
                user=usuario,
                fecha_creacion__date=dia
            ).aggregate(minutos=Sum("meta_minutos_alcanzados"))["minutos"] or 0

            nombre_dia = calendar.day_name[dia.weekday()]
            etiquetas.append(nombre_dia.capitalize())
            sesiones_por_dia.append(total)

        labels = etiquetas
        data = sesiones_por_dia

    else:
        hace_seis_semanas = hoy - timedelta(weeks=6)
        sesiones = (
            SesionEstudio.objects.filter(user=usuario, fecha_creacion__gte=hace_seis_semanas)
            .annotate(periodo=TruncWeek('fecha_creacion'))
            .values('periodo')
            .annotate(minutos=Sum('meta_minutos_alcanzados'))
            .order_by('periodo')
        )

        labels = [s['periodo'].strftime("%Y-%d-%m") for s in sesiones]
        data = [s['minutos'] for s in sesiones]
    print(labels)
    return JsonResponse({
        "labels": labels,
        "data": data,
    })