from django.contrib.auth.signals import user_logged_out
from django.dispatch import receiver
from django.utils.timezone import now
from .models import SesionEstudio
from django.db.models.signals import post_save
from Cronometro.models import SesionEstudio
from Usuarios.models import Perfil

@receiver(user_logged_out)
def finalizar_sesion_estudio_al_logout(sender, request, user, **kwargs):
    if user is not None:
        try:
            sesion_activa = SesionEstudio.objects.get(user=user, fecha_fin__isnull=True)
            sesion_activa.fecha_fin = now()
            sesion_activa.save()
        except SesionEstudio.DoesNotExist:
            pass


@receiver(post_save, sender=SesionEstudio)
def actualizar_puntos(sender, instance, **kwargs):
    try:
        perfil = instance.user.perfil
        perfil.puntos = perfil.calcular_puntos_grupo()
        perfil.save()
    except Perfil.DoesNotExist:
        pass
