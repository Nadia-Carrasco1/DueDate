from django.db import models
from django.conf import settings

class Logro(models.Model):
    nombre = models.CharField(max_length=30)
    descripcion = models.CharField(max_length=100)
    recompensa_url = models.URLField(null=True, blank=True)
    recompensa_descripcion = models.CharField(max_length=30)
    #audio_url = models.URLField(null=True, blank=True)
    tipo_logro = models.CharField(max_length=30)
    requisito = models.IntegerField(default=1)
    
    def __str__(self):
        return self.nombre

class LogroUsuario(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    logro = models.ForeignKey(Logro, on_delete=models.CASCADE)
    fecha_desbloqueo = models.DateTimeField(auto_now_add=True)
    reclamado = models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'logro')