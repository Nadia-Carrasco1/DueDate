from django.shortcuts import render, redirect
from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from Eventos.models import ListaPendientes
from Eventos.forms import TareaForm

MAX_TAREAS = 10 

@login_required
def mostrarLista(request, pk):
    lista = get_object_or_404(
        ListaPendientes, 
        pk=pk, 
        user=request.user
    )
    tareas = lista.tareas.all()
    
    error_message = None
    form = TareaForm()
    
    if request.method == 'POST':
        form = TareaForm(request.POST)
        
        if tareas.count() >= MAX_TAREAS:
            form = TareaForm()
            error_message = f"🚫 Límite de {MAX_TAREAS} tareas alcanzado."
        
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
        'error_message': error_message,
    }

    return render(request, 'mostrarLista.html', contexto)