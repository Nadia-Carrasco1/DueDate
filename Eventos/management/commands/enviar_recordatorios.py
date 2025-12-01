from django.core.management.base import BaseCommand
from django.utils import timezone
from django.utils.timezone import localtime
from django.core.mail import send_mail
from django.conf import settings
from Eventos.models import Evento


class Command(BaseCommand):
    help = 'Envía recordatorios por correo electrónico'

    def add_arguments(self, parser):
        parser.add_argument(
            '--evento_id',
            type=int,
            help='ID de un evento específico para enviar su recordatorio'
        )

    def handle(self, *args, **kwargs):
        ahora = timezone.now()
        evento_id = kwargs.get('evento_id')

        if evento_id:
            eventos = Evento.objects.filter(
                id=evento_id,
                recordatorio_enviado=False
            )
        else:
            desde = ahora - timezone.timedelta(minutes=1)
            hasta = ahora + timezone.timedelta(minutes=1)

            eventos = Evento.objects.filter(
                recordatorio_fecha_hora__gte=desde,
                recordatorio_fecha_hora__lte=hasta,
                recordatorio_enviado=False
            )

        for evento in eventos:
            if not evento.usuario.email:
                continue

            fecha_local = localtime(evento.fecha_inicio)
            hora_formateada = fecha_local.strftime("%d/%m/%Y %H:%M")

            message = (
                f'Hola {evento.usuario.username},\n\n'
                f'Este es un recordatorio para tu evento: {evento.titulo}\n\n'
                f'Fecha: {hora_formateada}'
            )

            if evento.descripcion:
                message += f'\nDescripción: {evento.descripcion}'

            try:
                send_mail(
                    subject=f'Recordatorio: {evento.titulo}',
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[evento.usuario.email],
                    fail_silently=False,
                )
                evento.recordatorio_enviado = True
                evento.save()
                self.stdout.write(self.style.SUCCESS(
                    f'Recordatorio enviado a {evento.usuario.email} para el evento "{evento.titulo}"'
                ))
            except Exception as e:
                self.stdout.write(self.style.ERROR(
                    f'Error al enviar recordatorio para "{evento.titulo}": {e}'
                ))