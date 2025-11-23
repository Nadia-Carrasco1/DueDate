from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_protect
from django.http import JsonResponse
from django.utils.timezone import now
from django.shortcuts import render, redirect, get_object_or_404
from Cronometro.forms import SesionEstudioForm
from .models import SesionEstudio
from django.db.models import Sum
from django.http import JsonResponse
from django.utils.timezone import localtime
import calendar
from datetime import date, timedelta
from Recompensas.utils import verificar_desbloquear_logros, verificar_logros_us_debloqueados
from Recompensas.models import Logro
from django.templatetags.static import static 

# Cronómetro
def mostrar_cronometro(request):
    logros = verificar_logros_us_debloqueados(usuario=request.user)
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
        'sesion': sesion,
        'logros': logros
    })

def forzar_finalizar_sesion(sesion):
    if not sesion.fecha_fin:
        sesion.fecha_fin = now()
        sesion.save()

@login_required
def crear_sesion_estudio(request):
    ultima_sesion = SesionEstudio.objects.filter(user=request.user, fecha_fin__isnull=True).order_by('-fecha_creacion').first()
    
    if ultima_sesion:
        forzar_finalizar_sesion(ultima_sesion)

    verificar_desbloquear_logros(user=request.user, tipo_accion='SESIONES_CREADAS')

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

            verificar_logros = request.POST.get('verificar_logros')

            logros_desbloqueados = []

            if verificar_logros:
                logros_desbloqueados = verificar_desbloquear_logros(user=request.user, tipo_accion=verificar_logros)

            return JsonResponse({
                'status': 'ok',
                'logros_desbloqueados': logros_desbloqueados
            })
        except SesionEstudio.DoesNotExist:
            return JsonResponse({'error': 'Sesión no encontrada'}, status=404)

    return JsonResponse({'error': 'Método no permitido'}, status=405)

# Personalización
def aplicar_fondo(request):
    if request.method == 'POST':
        logro_seleccionado = request.POST.get('recompensa_seleccionada')
        
        if logro_seleccionado == 'img/fondo-por-defecto.jpg':
            recompensa_url = logro_seleccionado
        else:
            try:
                logro = get_object_or_404(Logro, pk=logro_seleccionado)
                recompensa_url = logro.recompensa_url
            except Exception as e:
                print(f"Logro no encontrado o error al procesarlo: {e}")
                return JsonResponse({'status': 'error', 'message': 'Logro no válido'}, status=400)
        
        if recompensa_url:
            request.session['fondo_seleccionado_url'] = recompensa_url
            
            fondo_aplicado_url = static(recompensa_url)
            
            return JsonResponse({
                'status': 'success',
                'fondo_url': fondo_aplicado_url
            })

    return JsonResponse({'status': 'error', 'message': 'Petición inválida'}, status=400)

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

@login_required
def datos_estadisticas_exito(request):
    usuario = request.user
    periodo = request.GET.get("periodo", "semana-actual")

    hoy_local = localtime(now()).date()
    anio, mes = hoy_local.year, hoy_local.month
    primer_dia_mes = date(anio, mes, 1)
    ultimo_dia_mes = date(anio, mes, calendar.monthrange(anio, mes)[1])

    if periodo == "semana-actual":
        inicio = hoy_local - timedelta(days=hoy_local.weekday())
        fin = inicio + timedelta(days=6)
    elif periodo == "mes":
        inicio, fin = primer_dia_mes, ultimo_dia_mes
    else:
        inicio = date(anio, 1, 1)
        fin = date(anio, 12, 31)

    sesiones = SesionEstudio.objects.filter(
        user=usuario,
        fecha_creacion__date__range=(inicio, fin)
    )

    total = sesiones.count()
    exitosas = sesiones.filter(porcentaje_exito=100).count()
    no_exitosas = total - exitosas

    labels = ["Exitosas", "No exitosas"]
    data = [exitosas, no_exitosas]
    porcentajes = [
        f"{(exitosas / total * 100):.1f}%" if total else "0%",
        f"{(no_exitosas / total * 100):.1f}%" if total else "0%"
    ]

    return JsonResponse({
        "labels": labels,
        "data": data,
        "porcentajes": porcentajes,
        "total_sesiones": total,
        "exito_sesiones": exitosas
    })