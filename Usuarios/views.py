from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth import login, logout, update_session_auth_hash, authenticate
from django.core.mail import send_mail
from django.contrib.auth.decorators import login_required
from .forms import RegistroForm, UsuarioForm, PerfilForm, FotoPerfilForm, LoginForm
from .models import Perfil



def Registrarse(request):
    if request.user.is_authenticated:
        return redirect('home')  

    form = RegistroForm(request.POST or None)

    if request.method == 'POST' and form.is_valid():
        user = form.save()
        Perfil.objects.create(user=user)
        username = form.cleaned_data.get('username')
        password = form.cleaned_data.get('password1')
        user = authenticate(request, username=username, password=password)

        if user is not None:
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
    form = LoginForm(request, data=request.POST or None)
    next_url = request.GET.get('next') or request.POST.get('next') or 'home'

    if request.method == 'POST' and form.is_valid():
        user = form.get_user()
        if not user.is_active:
            form.add_error(None, 'Tu cuenta está desactivada.')
        else:
            login(request, user)
            return redirect(next_url)

    return render(request, 'IniciarSesion.html', {
        'form': form,
        'next': next_url
    })


@login_required
def verPerfil(request):
    modo_edicion = request.GET.get('editar') == '1'
    campo_con_error = None

    user_form = UsuarioForm(instance=request.user)
    perfil_form = PerfilForm(instance=request.user.perfil)
    password_form = PasswordChangeForm(request.user)
    foto_form = FotoPerfilForm(instance=request.user.perfil)

    for field in password_form.fields.values():
        field.widget.attrs.update({
            'class': 'w-full px-3 py-2 border rounded text-gray-800'
        })

    if request.method == 'POST':
        if 'actualizar_foto' in request.POST:
            foto_form = FotoPerfilForm(request.POST, request.FILES, instance=request.user.perfil)
            if foto_form.is_valid():
                foto_form.save()
                messages.success(request, "Foto de perfil actualizada correctamente.")
                return redirect('Perfil')

        elif 'eliminar_foto' in request.POST:
            perfil = request.user.perfil
            perfil.foto.delete(save=False)
            perfil.foto = None
            perfil.save()
            messages.success(request, "Foto de perfil eliminada correctamente.")
            return redirect('Perfil')

        elif 'desactivar_cuenta' in request.POST:
            request.user.is_active = False
            request.user.save()
            return redirect('home')

        elif 'editar_usuario' in request.POST:
            user_form = UsuarioForm(request.POST, instance=request.user)
            if user_form.is_valid():
                if user_form.has_changed():
                    user_form.save()
                    messages.success(request, "Nombre de usuario actualizado correctamente.")
                return redirect('Perfil')
            else:
                campo_con_error = 'username'

        elif 'editar_contraseña' in request.POST:
            password_form = PasswordChangeForm(request.user, request.POST)
            for field in password_form.fields.values():
                field.widget.attrs.update({
                    'class': 'w-full px-3 py-2 border rounded text-gray-800'
                })
            if password_form.is_valid():
                password_form.save()
                update_session_auth_hash(request, request.user)
                messages.success(request, "Contraseña actualizada correctamente.")
                return redirect('Perfil')
            else:
                campo_con_error = 'password'

    return render(request, 'Perfil.html', {
        'user_form': user_form,
        'password_form': password_form,
        'foto_form': foto_form,
        'perfil': request.user.perfil,
        'modo_edicion': modo_edicion,
        'campo_con_error': campo_con_error
    })

