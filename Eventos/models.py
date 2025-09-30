from django.db import models
from django.contrib.auth.models import User

class ListaPendientes(models.Model):
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        # (user.listaPendientes.all())
        related_name='listaPendientes'
    )
    fechaCreacion = models.DateTimeField(auto_now_add=True)
    fechaFin = models.DateTimeField(null=True, blank=None)
    titulo = models.CharField(max_length=50, default="Tareas pendientes")

    def __str__(self):
        return f"{self.titulo}"

class Tarea(models.Model):
    listaPendiente = models.ForeignKey(
        ListaPendientes, 
        on_delete=models.CASCADE,
        related_name='tareas'
    )
    descripcion = models.CharField(max_length=100)
    completada = models.BooleanField(default=False)

    def __str__(self):
        return f"Tarea: {self.descripcion[:20]}..."