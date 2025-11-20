from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from Cronometro.models import SesionEstudio

class GrupoEstudio(models.Model):
    nombre = models.CharField(max_length=50)
    cantUsuarios = models.IntegerField(default=0)
    metaCantHoras = models.IntegerField()
    plazoInicioEstudio = models.DateTimeField()
    plazoFinEstudio = models.DateTimeField()
    idPlanificadorLider = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='grupos_liderados')
    fechaCreacion = models.DateTimeField(auto_now_add=True) 

    def __str__(self):
        return self.nombre

    def actualizar_cantidad_usuarios(self):
        self.cantUsuarios = self.miembros.count()
        self.save(update_fields=['cantUsuarios'])

class Perfil(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    foto = models.ImageField(upload_to='fotos_perfil/', null=True, blank=True)
    fecha_nacimiento = models.DateField(null=True, blank=True)
    confirmado = models.BooleanField(default=False)
    grupo = models.ForeignKey(GrupoEstudio, on_delete=models.SET_NULL, null=True, blank=True, related_name='miembros')
    fecha_union_grupo = models.DateTimeField(null=True, blank=True)
    puntos = models.IntegerField(default=0)

    def __str__(self):
        return f'Perfil de {self.user.username}'

    def save(self, *args, **kwargs):
        self.puntos = self.calcular_puntos_grupo() 
        super().save(*args, **kwargs)               
        if self.grupo:
            self.grupo.actualizar_cantidad_usuarios()


    def calcular_puntos_grupo(self):
        grupo = self.grupo
        if not grupo or not self.fecha_union_grupo:
            return 0

        inicio_valido = max(self.fecha_union_grupo, grupo.plazoInicioEstudio)

        sesiones_usuario = SesionEstudio.objects.filter(
            user=self.user,
            fecha_creacion__gte=inicio_valido,
            fecha_creacion__lte=grupo.plazoFinEstudio
        )

        puntos = sum(s.meta_minutos_alcanzados for s in sesiones_usuario)
        return int(puntos)
