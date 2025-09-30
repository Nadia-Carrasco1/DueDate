from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth.models import User
from django.contrib.auth import login, logout, update_session_auth_hash, authenticate
from django.core.mail import send_mail
from django.contrib.auth.decorators import login_required
from .forms import RegistroForm, UsuarioForm, PerfilForm, FotoPerfilForm, LoginForm
from .models import Perfil
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.urls import reverse


def Registrarse(request):
    if request.user.is_authenticated:
        return redirect('home')

    form = RegistroForm(request.POST or None)

    if request.method == 'POST' and form.is_valid():
        user = form.save(commit=False)
        user.is_active = False
        user.save()

        fecha_nacimiento = form.cleaned_data.get('fecha_nacimiento')
        Perfil.objects.create(user=user, fecha_nacimiento=fecha_nacimiento)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        confirm_url = request.build_absolute_uri(
            reverse('confirmar_registro', kwargs={'uidb64': uid, 'token': token})
        )

        send_mail(
            subject='Confirmá tu cuenta en Due_Date',
            message=f'Hola {user.username}, confirmá tu cuenta haciendo clic en el siguiente enlace:\n{confirm_url}',
            from_email='Due Date <nadia.carrasco@est.fi.uncoma.edu.ar>',
            recipient_list=[user.email],
            fail_silently=False,
        )

        return render(request, 'RegistroPendiente.html', {'email': user.email})

    return render(request, 'Registrarse.html', {'form': form})


def confirmar_registro(request, uidb64, token):
    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        user = User.objects.get(pk=uid)
    except (User.DoesNotExist, ValueError, TypeError):
        user = None

    if user and default_token_generator.check_token(user, token):
        user.is_active = True
        user.save()
        perfil = Perfil.objects.get(user=user)
        perfil.confirmado = True
        perfil.save()
        login(request, user)
        return redirect('home')
    else:
        return render(request, 'RegistroError.html')

def reenviar_confirmacion(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        try:
            user = User.objects.get(email=email, is_active=False)
        except User.DoesNotExist:
            messages.error(request, "Tu cuenta expiró. Registrate nuevamente.")
            return redirect('home')

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        confirm_url = request.build_absolute_uri(
            reverse('confirmar_registro', kwargs={'uidb64': uid, 'token': token})
        )

        send_mail(
            subject='Reenvío de confirmación - Due_Date',
            message=f'Hola {user.username}, confirmá tu cuenta haciendo clic en el siguiente enlace:\n{confirm_url}',
            from_email='Due Date <nadia.carrasco@est.fi.uncoma.edu.ar>',
            recipient_list=[user.email],
            fail_silently=False,
        )

        messages.success(request, "Correo reenviado correctamente.")
        return redirect('IniciarSesion')



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

