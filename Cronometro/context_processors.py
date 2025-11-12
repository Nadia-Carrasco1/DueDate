from Cronometro.models import SesionEstudio

def datos_cronometro(request):
    contexto = {
        'tiempo_estudio_segundos': 0,
        'tiempo_descanso_segundos': 0,
        'repeticiones': 0,
        'sesion': None,
        'mostrar_cronometro': True,
    }

    if request.path.lower() in ['/cronometro/']:
        contexto['mostrar_cronometro'] = False

    if request.user.is_authenticated:
        ultima_sesion = SesionEstudio.objects.filter(user=request.user, fecha_fin__isnull=True).order_by('-fecha_creacion').first()
        if ultima_sesion:
            contexto.update({
                'tiempo_estudio_segundos': int(ultima_sesion.tiempo_estudio.total_seconds()),
                'tiempo_descanso_segundos': int(ultima_sesion.tiempo_descanso.total_seconds()),
                'repeticiones': ultima_sesion.repeticiones,
                'sesion': ultima_sesion.id,
            })

    return contexto