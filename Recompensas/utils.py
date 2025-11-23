from django.db.models import Count
from django.contrib.auth import get_user_model
from .models import Logro, LogroUsuario
import math

user = get_user_model()

def verificar_desbloquear_logros(user, tipo_accion):
    from Cronometro.models import SesionEstudio
    sesiones_estudio = SesionEstudio.objects.filter(user=user)
    valor_actual = 0

    if tipo_accion == 'SESIONES_CREADAS':
        valor_actual = sesiones_estudio.count()

    elif tipo_accion == 'MINUTOS_ACUMULADOS':
        for sesion in sesiones_estudio:
            minutos_alcanzados = sesion.meta_minutos_alcanzados or 0.0
            
            if math.isfinite(minutos_alcanzados):
                valor_actual += minutos_alcanzados

    elif tipo_accion == 'SESIONES_COMPLETADAS':
        for sesion in sesiones_estudio:
            if sesion.porcentaje_exito == 100:
                valor_actual+= 1

    if valor_actual == 0:
        return

    logros_por_desbloquear = Logro.objects.filter(
        tipo_logro = tipo_accion,
        requisito__lte = valor_actual # lte es <=
    ).exclude(
        logrousuario__user = user
    )

    logros_desbloqueados = []

    for logro in logros_por_desbloquear:
        creado = LogroUsuario.objects.get_or_create(user=user, logro=logro)
        
        if creado:
            logros_desbloqueados.append({
                'id': logro.id,
                'nombre': logro.nombre
            })

    return logros_desbloqueados

def verificar_logros_us_debloqueados(usuario):
    logros = Logro.objects.all();
    cant_logros_completados = 0
    cant_logros_reclamados = 0

    if usuario.is_authenticated:
        logros_usuario = LogroUsuario.objects.filter(user=usuario).select_related('logro')
        # logro_us.logro.id (clave (ej=1) : logro_us (valor(ej= intancia de logro_usuario))
        logros_usuarios_map = { logro_us.logro.id: logro_us for logro_us in logros_usuario }
        cant_logros_completados = 0
        cant_logros_reclamados = 0

        logros = Logro.objects.all().order_by('id')

        for logro in logros:
            logro_id = logro.id

            logro.desbloqueado = False
            logro.reclamado = False
            logro.fecha_desbloqueo = None

            if logro_id in logros_usuarios_map:
                logro_usuario_map = logros_usuarios_map[logro_id]
                cant_logros_completados += 1 

                logro.desbloqueado = True
                logro.reclamado = logro_usuario_map.reclamado
                logro.fecha_desbloqueo = logro_usuario_map.fecha_desbloqueo

                if logro.reclamado:
                    cant_logros_reclamados += 1
    
    return {
        'logros': logros,
        'cant_logros_completados': cant_logros_completados,
        'cant_logros_reclamados': cant_logros_reclamados
    }