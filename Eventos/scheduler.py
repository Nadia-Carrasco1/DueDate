from apscheduler.schedulers.background import BackgroundScheduler
from django_apscheduler import util
from django.core.management import call_command

scheduler = None

@util.close_old_connections
def enviar_recordatorios():
    call_command("enviar_recordatorios")

def start_scheduler():
    global scheduler
    if scheduler is None:
        from django_apscheduler.jobstores import DjangoJobStore  # importar aquí, cuando apps ya están listas
        scheduler = BackgroundScheduler(timezone="America/Argentina/Buenos_Aires")
        scheduler.add_jobstore(DjangoJobStore(), "default")
        scheduler.start()

def programar_recordatorio(evento):
    if scheduler and evento.recordatorio_fecha_hora:
        job_id = f"recordatorio_{evento.id}"
        try:
            scheduler.remove_job(job_id, jobstore="default")
        except Exception:
            pass
        scheduler.add_job(
            enviar_recordatorios,
            "date",
            run_date=evento.recordatorio_fecha_hora,
            id=job_id,
            replace_existing=True,
            misfire_grace_time=1,
        )