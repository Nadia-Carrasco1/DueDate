from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth.models import User

class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        limite = timezone.now() - timezone.timedelta(minutes=1)
        usuarios = User.objects.filter(is_active=False, date_joined__lt=limite)

        for user in usuarios:
            user.delete()