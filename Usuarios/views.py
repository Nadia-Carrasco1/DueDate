from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth.models import User
from django.contrib.auth import login, logout, update_session_auth_hash, authenticate
from django.core.mail import send_mail
from django.contrib.auth.decorators import login_required
from .forms import RegistroForm, UsuarioForm, PerfilForm, FotoPerfilForm, LoginForm, GrupoEstudioForm
from .models import Perfil, GrupoEstudio
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.urls import reverse
from django.http import JsonResponse
from django.templatetags.static import static
from django.views.decorators.http import require_POST

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
        user.backend = 'Usuarios.backends.EmailOrUsernameModelBackend'
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
            'class': 'w-full px-3 py-2 border rounded  text-white bg-neutral-800'
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
                    'class': 'w-full px-3 py-2 border rounded  text-white bg-neutral-800'
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

@login_required
def vista_grupo_estudio(request):
    perfil = request.user.perfil
    tiene_grupo = perfil.grupo is not None
    miembros = Perfil.objects.filter(grupo=perfil.grupo).select_related('user').order_by('-puntos')[:5]
    return render(request, 'GrupoEstudio.html', {
        'tiene_grupo': tiene_grupo,
        'perfil': perfil,
        'miembros': miembros,
    })

@login_required
@require_POST
def invitar_usuario_ajax(request):
    username = request.POST.get('usuario')
    perfil_lider = request.user.perfil
    grupo = perfil_lider.grupo

    try:
        usuario = User.objects.get(username=username)
        uid = urlsafe_base64_encode(force_bytes(usuario.pk))
        token = default_token_generator.make_token(usuario)

        link = request.build_absolute_uri(
            reverse('aceptar_invitacion', kwargs={
                'uidb64': uid,
                'token': token,
                'grupo_id': grupo.id
            })
        )

        html_message = f"""
        <html>
          <body style="font-family: sans-serif; background-color: #f9f9f9; padding: 20px;">
            <h2>Te invitaron al grupo <span style="color:#4f46e5;">{grupo.nombre}</span></h2>
            <p>Hacé clic en el botón para aceptar la invitación y unirte al grupo de estudio:</p>
            <a href="{link}" style="display:inline-block; background:#4f46e5; color:white; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:bold;">
              Aceptar invitación
            </a>
          </body>
        </html>
        """

        enviado = send_mail(
            subject='Invitación a grupo de estudio',
            message=f'Te invitaron al grupo {grupo.nombre}. Aceptá la invitación acá: {link}',
            html_message=html_message,
            from_email='Due Date <nadia.carrasco@est.fi.uncoma.edu.ar>',
            recipient_list=[usuario.email],
        )

        if enviado:
            return JsonResponse({'ok': True, 'mensaje': f'Correo enviado a {usuario.email}'})
        else:
            return JsonResponse({'ok': False, 'mensaje': 'No se pudo enviar el correo'})
    except User.DoesNotExist:
        return JsonResponse({'ok': False, 'mensaje': 'Usuario no encontrado'})


@login_required
def aceptar_invitacion(request, uidb64, token, grupo_id):
    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        user = User.objects.get(pk=uid)
        grupo = GrupoEstudio.objects.get(pk=grupo_id)
    except (User.DoesNotExist, GrupoEstudio.DoesNotExist):
        return render(request, 'InvitacionInvalida.html')

    if default_token_generator.check_token(user, token):
        perfil = user.perfil
        if not perfil.grupo:
            perfil.grupo = grupo
            perfil.save()
            messages.success(request, f'Te uniste al grupo {grupo.nombre}')
        return redirect('vista_grupo_estudio')
    else:
        return render(request, 'InvitacionInvalida.html')

@login_required
def sugerencias_usuarios(request):
    query = request.GET.get('q', '')
    usuarios = User.objects.filter(username__istartswith=query).exclude(id=request.user.id).order_by('username')[:10]

    data = []
    for u in usuarios:
        perfil = getattr(u, 'perfil', None)
        if perfil and perfil.foto:
            foto_url = perfil.foto.url
        else:
            foto_url = static('img/sin-foto-perfil.jpg')

        data.append({
            'username': u.username,
            'foto': foto_url
        })

    return JsonResponse(data, safe=False)

@login_required
def crear_grupo(request):
    perfil = request.user.perfil
    if perfil.grupo:
        messages.error(request, "Ya pertenecés a un grupo.")
        return redirect('vista_grupo_estudio')

    if request.method == 'POST':
        form = GrupoEstudioForm(request.POST)
        if form.is_valid():
            grupo = form.save(commit=False)
            grupo.idPlanificadorLider = request.user
            grupo.save()
            perfil.grupo = grupo
            perfil.save()
            messages.success(request, "Grupo creado correctamente.")
            return redirect('vista_grupo_estudio')
    else:
        form = GrupoEstudioForm()

    return render(request, 'CrearGrupo.html', {'form': form})