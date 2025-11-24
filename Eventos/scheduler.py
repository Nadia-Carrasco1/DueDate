from apscheduler.schedulers.background import BackgroundScheduler
from django_apscheduler.jobstores import DjangoJobStore
from django_apscheduler import util
from django.core.management import call_command

@util.close_old_connections
def enviar_recordatorios():
    call_command("enviar_recordatorios")

def start():
    scheduler = BackgroundScheduler(timezone="America/Argentina/Buenos_Aires")
    scheduler.add_jobstore(DjangoJobStore(), "default")

    scheduler.add_job(
        enviar_recordatorios,
        "interval",
        minutes=1,
        id="recordatorios_job",
        replace_existing=True,
    )

    scheduler.start()