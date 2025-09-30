from django.shortcuts import render
from Eventos.models import Tarea
from django.contrib.auth.decorators import login_required


def home_view(request):
    if request.user.is_authenticated:
        tareasPendientes = Tarea.objects.filter(
            listaPendiente__user=request.user,
            completada=False
        ).order_by('listaPendiente__id', 'id')

        datos = {
            'tareasMostrar': tareasPendientes
        }
    else:
        datos = {
            'mensajeSinLoguear': "Por favor, inicia sesión para ver tus "
        }
    
    return render(request, 'Home.html', datos)
