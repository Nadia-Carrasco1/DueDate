from django.core.management.base import BaseCommand
from Usuarios.models import GrupoEstudio

class Command(BaseCommand):
    help = 'Recalcula cantUsuarios para todos los grupos'

    def handle(self, *args, **kwargs):
        grupos = GrupoEstudio.objects.all()
        for grupo in grupos:
            grupo.actualizar_cantidad_usuarios()
            self.stdout.write(f'Grupo "{grupo.nombre}": {grupo.cantUsuarios} usuarios actualizados.')
        self.stdout.write(self.style.SUCCESS('Todos los grupos actualizados correctamente.'))