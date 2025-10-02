from django.shortcuts import render, redirect
from django.urls import reverse
from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from Eventos.models import ListaPendientes
from Eventos.models import Tarea
from Eventos.forms import TareaForm
from django.http import JsonResponse

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
        Tarea, #Busco en Tarea
        pk=pk_tarea, #Con la pk
        listaPendiente__pk=pk_lista, #Busca la el campo listaPendiente de Tarea que tenga de valor la pk que le paso listaPendiente__pk != lista_pendiente__pk
        listaPendiente__user=request.user #Verifica que la lista pertenezca al usuario
    )

    # Guardo la pk de la lista antes de borrar, para la redirección
    lista_pk = tarea.listaPendiente.pk

    tarea.delete()

    # Redirijo al us a la vista
    return redirect('mostrarLista', pk=lista_pk)

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
