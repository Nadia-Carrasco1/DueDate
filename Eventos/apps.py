from django.apps import AppConfig
from .scheduler import start_scheduler

class EventosConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "Eventos"

    def ready(self):
        start_scheduler()