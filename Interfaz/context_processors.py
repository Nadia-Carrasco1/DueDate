from Recompensas.utils import verificar_logros_us_debloqueados

def navbar_context(request):
    user = request.user
    return {
        'is_authenticated': user.is_authenticated,
        'username': user.username if user.is_authenticated else '',
        'is_admin': user.is_staff if user.is_authenticated else False,
    }

def verificar_logros_us_sin_reclamar(request):
    cant_logros_sin_reclamar = 0 
    
    if request.user.is_authenticated:
        logros_data = verificar_logros_us_debloqueados(usuario=request.user)
        
        cant_completados = logros_data['cant_logros_completados']
        cant_reclamados = logros_data['cant_logros_reclamados']

        cant_logros_sin_reclamar = cant_completados - cant_reclamados
        
        if cant_logros_sin_reclamar < 0:
            cant_logros_sin_reclamar = 0

    return {
        'cant_logros_sin_reclamar': cant_logros_sin_reclamar
    }