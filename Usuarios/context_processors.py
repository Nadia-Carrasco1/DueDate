def perfil_global(request):
    if request.user.is_authenticated:
        try:
            return {'perfil': request.user.perfil}
        except Exception:
            return {'perfil': None}
    return {'perfil': None}