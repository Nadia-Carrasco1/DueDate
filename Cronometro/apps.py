from django.apps import AppConfig


class CronometroConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'Cronometro'

    def ready(self):
            import Cronometro.signals