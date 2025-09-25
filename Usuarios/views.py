from django.shortcuts import render, redirect
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import login, logout
from django.core.mail import send_mail
from django.contrib.auth.decorators import login_required
from .forms import RegistroForm


def Registrarse(request):
    form = RegistroForm(request.POST or None)

    if request.method == 'POST' and form.is_valid():
        user = form.save()
        login(request, user)

        send_mail(
            subject='Bienvenida a Due_Date',
            message='Tu cuenta fue creada exitosamente.',
            from_email='Due Date <nadia.carrasco@est.fi.uncoma.edu.ar>',
            recipient_list=[user.email],
            fail_silently=False,
        )

        return redirect('home')

    return render(request, 'Registrarse.html', {'form': form})

def CerrarSesion(request):
    logout(request)
    return redirect('home')

def IniciarSesion(request):
    form = AuthenticationForm(request, data=request.POST or None)

    if request.method == 'POST' and form.is_valid():
        login(request, form.get_user())
        return redirect('home')

    return render(request, 'IniciarSesion.html', {'form': form})

def DesactivarCuenta(request):
    if  request.method == 'POST':
        user = request.user
        user.is_active = False
        user.save()

        return redirect('home')
    return render(request, 'DesactivarCuenta.html')