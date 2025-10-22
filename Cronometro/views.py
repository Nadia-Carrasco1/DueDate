from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_protect
from django.http import JsonResponse
from django.utils.timezone import now
from django.shortcuts import render, redirect
from Cronometro.forms import SesionEstudioForm
from .models import SesionEstudio
from django.db.models import Sum
from django.http import JsonResponse
from django.utils.timezone import localtime
import calendar
from datetime import date, timedelta

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

def sumar_min_estudio(usuario, inicio, fin):
    return SesionEstudio.objects.filter(
        user=usuario,
        fecha_creacion__date__range=(inicio, fin)
    ).aggregate(minutos=Sum("meta_minutos_alcanzados"))["minutos"] or 0

def formatear_minutos(minutos):
    if minutos is None:
        return "0m"
    horas = int(minutos // 60)
    minutos_restantes = round(minutos % 60)

    if horas > 0 and minutos_restantes > 0:
        return f"{horas}h {minutos_restantes}m"
    elif horas > 0:
        return f"{horas}h"
    else:
        return f"{minutos_restantes}m"

DIAS_SEMANA_ES = {
    'Monday': 'Lunes',
    'Tuesday': 'Martes',
    'Wednesday': 'Miércoles',
    'Thursday': 'Jueves',
    'Friday': 'Viernes',
    'Saturday': 'Sábado',
    'Sunday': 'Domingo',
}

MESES_ES = {
    1: "Enero", 2: "Febrero", 3: "Marzo", 4: "Abril",
    5: "Mayo", 6: "Junio", 7: "Julio", 8: "Agosto",
    9: "Septiembre", 10: "Octubre", 11: "Noviembre", 12: "Diciembre"
}

@login_required
def datos_estadisticas_estudio(request):
    usuario = request.user
    periodo = request.GET.get("periodo", "semana-actual")

    hoy_local = localtime(now()).date()
    anio, mes = hoy_local.year, hoy_local.month 
    primer_dia = date(anio, mes, 1)
    ultimo_dia = date(anio, mes, calendar.monthrange(anio, mes)[1])

    labels = []
    data = []
    tiempos_formateados = []

    if periodo == "semana-actual":
        lunes = hoy_local - timedelta(days=hoy_local.weekday())
        dias_semana = [lunes + timedelta(days=i) for i in range(7)]

        for dia in dias_semana:
            minutos = SesionEstudio.objects.filter(
                user=usuario,
                fecha_creacion__date=dia
            ).aggregate(minutos=Sum("meta_minutos_alcanzados"))["minutos"] or 0

            nombre_dia = DIAS_SEMANA_ES[calendar.day_name[dia.weekday()]]
            labels.append(nombre_dia)
            data.append(minutos)
            tiempos_formateados.append(formatear_minutos(minutos))

    elif periodo == "mes":
        dias_mes = [primer_dia + timedelta(days=i) for i in range((ultimo_dia - primer_dia).days + 1)]
        bloques = [dias_mes[i:i+7] for i in range(0, len(dias_mes), 7)]

        for bloque in bloques:
            inicio, fin = bloque[0], bloque[-1]

            minutos = sumar_min_estudio(usuario, inicio, fin)

            etiqueta = f"{inicio.strftime('%d/%m')} - {fin.strftime('%d/%m')}"
            labels.append(etiqueta)
            data.append(minutos)
            tiempos_formateados.append(formatear_minutos(minutos))

    else:
        for mes in range(1, 13):
            primer_dia = date(anio, mes, 1)
            ultimo_dia = date(anio, mes, calendar.monthrange(anio, mes)[1])
            minutos = sumar_min_estudio(usuario, primer_dia, ultimo_dia)

            nombre_mes = MESES_ES[mes]
            labels.append(nombre_mes)
            data.append(minutos)
            tiempos_formateados.append(formatear_minutos(minutos))

    return JsonResponse({
        "labels": labels,
        "data": data,
        "tiempos_formateados": tiempos_formateados
    })