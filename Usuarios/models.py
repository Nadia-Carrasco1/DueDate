from django.db import models
from django.contrib.auth.models import User

class Perfil(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    foto = models.ImageField(upload_to='fotos_perfil/', null=True, blank=True)
    fecha_nacimiento = models.DateField(null=True, blank=True)
    confirmado = models.BooleanField(default=False) 

    def __str__(self):
        return f'Perfil de {self.user.username}'
