def navbar_context(request):
    user = request.user
    return {
        'is_authenticated': user.is_authenticated,
        'username': user.username if user.is_authenticated else '',
        'is_admin': user.is_staff if user.is_authenticated else False,
    }