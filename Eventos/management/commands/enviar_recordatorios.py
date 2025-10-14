from django.core.management.base import BaseCommand
from django.utils import timezone
from django.core.mail import send_mail
from Eventos.models import Evento
from django.conf import settings

class Command(BaseCommand):
    help = 'Envía recordatorios por correo electrónico'

    def handle(self, *args, **kwargs):
        ahora = timezone.now()
        eventos = Evento.objects.filter(
            recordatorio_fecha_hora__lte=ahora,
            recordatorio_enviado=False
        )

        for evento in eventos:
            message = (
                f'Hola {evento.usuario.username},\n\n'
                f'Este es un recordatorio para tu evento: {evento.titulo}\n\n'
                f'Fecha: {evento.fecha_inicio.strftime("%d/%m/%Y %H:%M")}'
            )

            if evento.descripcion:
                message += f'\nDescripción: {evento.descripcion}'

            send_mail(
                subject=f'Recordatorio: {evento.titulo}',
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[evento.usuario.email],
                fail_silently=False,
            )

            evento.recordatorio_enviado = True
            evento.save()