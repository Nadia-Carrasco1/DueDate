from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm, PasswordChangeForm, AuthenticationForm
from .models import Perfil, GrupoEstudio
from django.core.exceptions import ValidationError
from datetime import timedelta
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

class RegistroForm(UserCreationForm):
    email = forms.EmailField(
        required=True,
        widget=forms.EmailInput(attrs={
            'class': 'w-full px-3 py-2 border border-neutral-700 rounded text-white bg-neutral-900',
            'placeholder': 'Correo electrónico'
        }),
        label='Correo electrónico:'
    )
    username = forms.CharField(
        widget=forms.TextInput(attrs={
            'class': 'w-full px-3 py-2 border border-neutral-700 rounded text-white bg-neutral-900',
            'placeholder': 'Nombre de usuario'
        }),
        label='Nombre de usuario:'
    )
    password1 = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'class': 'w-full px-3 py-2 border border-neutral-700 rounded text-white bg-neutral-900',
            'placeholder': 'Contraseña'
        }),
        label='Contraseña:'
    )
    password2 = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'class': 'w-full px-3 py-2 border border-neutral-700 rounded text-white bg-neutral-900',
            'placeholder': 'Confirmar contraseña'
        }),
        label='Confirmar contraseña:'
    )
    fecha_nacimiento = forms.DateField(
        required=True,
        widget=forms.DateInput(attrs={
            'type': 'date',
            'max': '2018-12-31',
            'class': 'w-full px-3 py-2 border border-neutral-700 rounded text-white bg-neutral-900'
        }),
        label="Fecha de nacimiento:"
    )

    class Meta:
        model = User
        fields = ['username', 'email', 'fecha_nacimiento', 'password1', 'password2']

    def clean_email(self):
        email = self.cleaned_data['email']
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError("Ya existe una cuenta con este correo.")
        return email


class LoginForm(AuthenticationForm):
    username = forms.CharField(
        label='Usuario o correo electrónico',
        widget=forms.TextInput(attrs={
            'placeholder': 'Usuario o correo',
            'class': 'w-full px-3 py-2 border border-neutral-700 rounded text-white bg-neutral-900'
        })
    )
    password = forms.CharField(
        label='Contraseña',
        widget=forms.PasswordInput(attrs={
            'placeholder': 'Contraseña',
            'class': 'w-full px-3 py-2 border border-neutral-700 rounded text-white bg-neutral-900'
        })
    )



class UsuarioForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['username']
        widgets = {
            'username': forms.TextInput(attrs={
                'class': 'w-full px-3 py-2 border border-neutral-700 rounded text-white bg-neutral-900'
            }),
        }

class PerfilForm(forms.ModelForm):
    class Meta:
        model = Perfil
        fields = ['foto']
        labels = {
            'foto': 'Foto de perfil'
        }
        widgets = {
            'foto': forms.ClearableFileInput(attrs={
                'class': 'w-full px-3 py-2 border border-neutral-700 rounded text-gray-800'
            }),
        }
        widget=forms.PasswordInput(attrs={
            'class': 'w-full px-3 py-2 border border-neutral-700 rounded text-white bg-neutral-900',
            'placeholder': 'Contraseña'
        }),

class FotoPerfilForm(forms.ModelForm):
    class Meta:
        model = Perfil
        fields = ['foto']
        labels = {
            'foto': 'Actualizar foto'
        }
        widgets = {
            'foto': forms.FileInput(attrs={
                'class': 'w-full px-3 py-2 border border-neutral-700 rounded text-white bg-neutral-900'
            }),
        }

class GrupoEstudioForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        self.modo_edicion = kwargs.pop('modo_edicion', False)
        super().__init__(*args, **kwargs)

    class Meta:
        model = GrupoEstudio
        fields = ['nombre', 'metaCantHoras', 'plazoInicioEstudio', 'plazoFinEstudio']
        labels = {
            'nombre': 'Nombre del grupo',
            'metaCantHoras': 'Meta de horas de estudio',
            'plazoInicioEstudio': 'Inicio del estudio',
            'plazoFinEstudio': 'Fin del estudio',
        }
        error_messages = {
            'nombre': {
                'required': "Este campo es obligatorio.",
            },
        }
        widgets = {
            'nombre': forms.TextInput(attrs={
                'class': 'w-full px-3 py-2 border border-neutral-700 rounded text-white bg-neutral-900',
                'placeholder': 'Nombre del grupo',
                'id': 'id_nombre',
            }),
            'metaCantHoras': forms.NumberInput(attrs={
                'class': 'w-full px-3 py-2 border border-neutral-700 rounded text-white bg-neutral-900',
                'min': 1,
                'id': 'id_metaCantHoras',
            }),
            'plazoInicioEstudio': forms.DateTimeInput(attrs={
                'type': 'datetime-local',
                'class': 'w-full px-3 py-2 border border-neutral-700 rounded text-white bg-neutral-900',
                'id': 'id_plazoInicioEstudio',
            }),
            'plazoFinEstudio': forms.DateTimeInput(attrs={
                'type': 'datetime-local',
                'class': 'w-full px-3 py-2 border border-neutral-700 rounded text-white bg-neutral-900',
                'id': 'id_plazoFinEstudio',
            }),
        }

    def clean(self):
        cleaned_data = super().clean()
        inicio = cleaned_data.get('plazoInicioEstudio')
        fin = cleaned_data.get('plazoFinEstudio')
        meta = cleaned_data.get('metaCantHoras')

        if not inicio or not fin or meta is None:
            self.add_error(None, "Debés ingresar todas las fechas y la meta de estudio.")
            return cleaned_data

        if meta < 1:
            self.add_error('metaCantHoras', "La meta debe ser al menos 1 hora.")

        fecha_minima_inicio = (
            self.instance.fechaCreacion + timedelta(minutes=5) if self.modo_edicion and self.instance.pk
            else timezone.now() + timedelta(minutes=5)
        )

        if inicio < fecha_minima_inicio:
            self.add_error('plazoInicioEstudio', "La fecha de inicio debe ser posterior o igual a la fecha mínima permitida.")

        if fin < inicio + timedelta(hours=1):
            self.add_error('plazoFinEstudio', "La fecha de fin debe ser al menos 1 hora posterior a la de inicio.")

        horas_disponibles = (fin - inicio).total_seconds() / 3600
        if meta > horas_disponibles:
            self.add_error('plazoFinEstudio', f"El plazo entre inicio y fin no alcanza para cumplir la meta de {meta} horas.")

        return cleaned_data

