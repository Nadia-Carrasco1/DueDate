from django.shortcuts import render
from django.utils import timezone
from Eventos.models import Tarea, Evento

def home_view(request):
    datos = {}
    if request.user.is_authenticated:
        tareasPendientes = Tarea.objects.filter(
            listaPendiente__user=request.user,
            completada=False
        ).order_by('listaPendiente__id', 'id')

        now = timezone.now()
        start_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        if now.month == 12:
            next_month = now.replace(year=now.year + 1, month=1, day=1)
        else:
            next_month = now.replace(month=now.month + 1, day=1)
        end_month = next_month - timezone.timedelta(seconds=1)

        eventos_mes = Evento.objects.filter(
            fecha_inicio__gte=start_month,
            fecha_inicio__lte=end_month,
            usuario=request.user
        ).order_by('fecha_inicio')

        datos = {
            'tareasMostrar': tareasPendientes,
            'eventos_mes': eventos_mes,
        }
    else:
        datos = {
            'mensajeSinLoguear': "Por favor, inicia sesión para ver tus tareas y eventos."
        }
    
    return render(request, 'Home.html', datos)
