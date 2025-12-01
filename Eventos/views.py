from django.shortcuts import render, redirect
from django.urls import reverse
from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from Eventos.models import ListaPendientes
from Eventos.models import Tarea
from Eventos.forms import TareaForm, EventoForm
from django.http import JsonResponse
from .models import Evento 
from django.utils.timezone import localtime
from django.contrib import messages
import json
from datetime import datetime

maxTareas = 10 

@login_required
def mostrarLista(request, pk):
    lista = get_object_or_404(
        ListaPendientes, 
        pk=pk, 
        user=request.user
    )
    tareas = lista.tareas.all()

    cant_tareas_pendientes = lista.tareas.filter(completada=False).count() 

    error_message = None
    form = TareaForm()
    
    if request.method == 'POST':
        form = TareaForm(request.POST)
        
        if tareas.count() >= maxTareas:
            form = TareaForm()
            error_message = f"🚫 Límite de {maxTareas} tareas alcanzado."
        
        elif form.is_valid():
            nueva_tarea = form.save(commit=False) 
            nueva_tarea.listaPendiente = lista
            nueva_tarea.save()

            return redirect('mostrarLista', pk=lista.pk)         
    else:
        form = TareaForm()

    contexto = {
        'lista': lista,
        'tareas': tareas,
        'form': form,
        'cant_tareas_pendientes': cant_tareas_pendientes,
        'error_message': error_message,
    }

    return render(request, 'mostrarLista.html', contexto)

@login_required
def acceso_lista_unica(request):
    lista, created = ListaPendientes.objects.get_or_create(
        user=request.user
    )
    
    return redirect(reverse('mostrarLista', kwargs={'pk': lista.pk}))

@login_required
def eliminar_tarea(request, pk_lista, pk_tarea):
    tarea = get_object_or_404(
        Tarea,
        pk=pk_tarea,
        listaPendiente__pk=pk_lista,
        listaPendiente__user=request.user
    )

    lista_pk = tarea.listaPendiente.pk

    tarea.delete()

    return redirect('mostrarLista', pk=lista_pk)

@login_required
def eliminar_todas_las_tareas(request, pk_lista):
    tareas = Tarea.objects.filter(listaPendiente_id=pk_lista)

    for tarea in tareas:
        tarea.delete()

    return redirect('mostrarLista', pk=pk_lista)

@login_required
@require_POST
def cambiar_estado_tarea(request, pk_tarea):
    tarea = get_object_or_404(
        Tarea,
        pk=pk_tarea,
        listaPendiente__user=request.user
    )

    tarea.completada = not tarea.completada
    tarea.save()

    return JsonResponse({'success': True, 'completada': tarea.completada})

@login_required
def calendario_view(request):
    if request.method == 'POST':
        form = EventoForm(request.POST)
        if form.is_valid():
            evento = form.save(commit=False)
            evento.usuario = request.user
            evento.save()
            messages.success(request, 'Evento agendado correctamente.')
            return redirect('calendario')
    else:
        form = EventoForm()

    return render(request, 'calendario.html', {'form': form})


@require_POST
@login_required
def editar_evento(request):
    evento_id = request.POST.get('evento_id')
    evento = get_object_or_404(Evento, id=evento_id, usuario=request.user)
    form = EventoForm(request.POST, instance=evento)

    if form.has_changed():
        if form.is_valid():
            form.save()
            return JsonResponse({'status': 'ok'})
        else:
            errors = form.errors.as_json()
            return JsonResponse({'status': 'error', 'message': errors}, status=400)
    else:
        return JsonResponse({'status': 'error', 'message': 'sin_cambios'})


@login_required
def obtener_formulario_edicion(request, evento_id):
    evento = get_object_or_404(Evento, id=evento_id, usuario=request.user)
    form = EventoForm(instance=evento)
    return render(request, 'partials/form_edicion.html', {'form': form, 'evento_id': evento.id})


@require_POST
@login_required
def eliminar_evento(request):
    evento_id = request.POST.get('evento_id')
    evento = get_object_or_404(Evento, id=evento_id, usuario=request.user)
    evento.delete()
    messages.success(request, 'El evento fue eliminado correctamente.')
    return redirect('calendario')


@require_POST
@login_required
def actualizar_fecha(request, evento_id):
    evento = get_object_or_404(Evento, id=evento_id, usuario=request.user)
    data = json.loads(request.body)

    fecha_inicio = datetime.fromisoformat(data['fecha_inicio'])
    fecha_fin = datetime.fromisoformat(data['fecha_fin']) if data.get('fecha_fin') else None

    if fecha_fin and fecha_fin < fecha_inicio:
        return JsonResponse({'status': 'error', 'message': 'La fecha de fin no puede ser anterior a la de inicio.'}, status=400)

    evento.fecha_inicio = fecha_inicio
    evento.fecha_fin = fecha_fin
    evento.save()

    return JsonResponse({'status': 'ok'})


def timedelta_to_iso(duration):
    total_seconds = int(duration.total_seconds())
    hours, remainder = divmod(total_seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    return f"PT{hours}H{minutes:02d}M{seconds:02d}S"


@login_required
def eventos_json(request):
    eventos = Evento.objects.filter(usuario=request.user)
    data = []

    for evento in eventos:
        try:
            if not evento.fecha_inicio:
                continue

            color = '#2563eb'
            if evento.recordatorio_fecha_hora:
                color = '#dc2626'

            if evento.repetir_anualmente:
                if not evento.fecha_inicio:
                    continue  

                duration = timedelta_to_iso(evento.fecha_fin - evento.fecha_inicio) if evento.fecha_fin else "PT1H"
                data.append({
                    "id": evento.id,
                    "title": evento.titulo,
                    "rrule": {
                        "freq": "yearly",
                        "dtstart": localtime(evento.fecha_inicio).isoformat()
                    },
                    "duration": duration,
                    "color": "#9333ea",
                    "descripcion": evento.descripcion,
                    "recordatorio_fecha_hora": evento.recordatorio_fecha_hora.isoformat() if evento.recordatorio_fecha_hora else None,
                })
            else:
                data.append({
                    "id": evento.id,
                    "title": evento.titulo,
                    "start": localtime(evento.fecha_inicio).isoformat(),
                    "end": evento.fecha_fin.isoformat() if evento.fecha_fin else None,
                    "color": color,
                    "descripcion": evento.descripcion,
                    "recordatorio_fecha_hora": evento.recordatorio_fecha_hora.isoformat() if evento.recordatorio_fecha_hora else None,
                })

        except Exception as e:
            print(f"Error procesando evento ID {evento.id}: {e}")
            continue

    return JsonResponse(data, safe=False)
