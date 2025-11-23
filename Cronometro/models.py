from django.db import models
from django.contrib.auth.models import User

class SesionEstudio(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    tiempo_estudio = models.DurationField()
    tiempo_descanso = models.DurationField()
    repeticiones = models.IntegerField()

    repeticiones_completadas = models.IntegerField(default=0)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_fin = models.DateTimeField(null=True, blank=True)

    meta_en_minutos = models.IntegerField()
    meta_minutos_alcanzados = models.FloatField(default=0.0)
    porcentaje_exito = models.FloatField(default=0.0)

    def calcular_porcentaje_exito(self):
        porcentaje = 0
        if self.meta_en_minutos and self.meta_en_minutos != 0:
            porcentaje = round((self.meta_minutos_alcanzados / self.meta_en_minutos) * 100, 2)
        return porcentaje
    
    # Cada vez que yo hago instancia.save() se ejecuta esta función
    def save(self, *args, **kwargs):
        self.porcentaje_exito = self.calcular_porcentaje_exito()
        super().save(*args, **kwargs)
