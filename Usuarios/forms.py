from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm, PasswordChangeForm, AuthenticationForm
from .models import Perfil

class RegistroForm(UserCreationForm):
    email = forms.EmailField(
        required=True,
        widget=forms.EmailInput(attrs={
            'class': 'w-full px-3 py-2 border rounded text-gray-800',
            'placeholder': 'Correo electrónico'
        })
    )
    username = forms.CharField(
        widget=forms.TextInput(attrs={
            'class': 'w-full px-3 py-2 border rounded text-gray-800',
            'placeholder': 'Nombre de usuario'
        })
    )
    password1 = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'class': 'w-full px-3 py-2 border rounded text-gray-800',
            'placeholder': 'Contraseña'
        })
    )
    password2 = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'class': 'w-full px-3 py-2 border rounded text-gray-800',
            'placeholder': 'Confirmar contraseña'
        })
    )
    fecha_nacimiento = forms.DateField(
        required=True,
        widget=forms.DateInput(attrs={
            'type': 'date',
            'max': '2018-12-31',
            'class': 'w-full px-3 py-2 border rounded text-gray-800'
        }),
        label="Fecha de nacimiento"
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
            'class': 'w-full px-3 py-2 border rounded text-gray-800 bg-white'
        })
    )
    password = forms.CharField(
        label='Contraseña',
        widget=forms.PasswordInput(attrs={
            'placeholder': 'Contraseña',
            'class': 'w-full px-3 py-2 border rounded text-gray-800 bg-white'
        })
    )



class UsuarioForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['username']
        widgets = {
            'username': forms.TextInput(attrs={
                'class': 'w-full px-3 py-2 border rounded text-gray-800'
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
                'class': 'w-full px-3 py-2 border rounded text-gray-800'
            }),
        }

class FotoPerfilForm(forms.ModelForm):
    class Meta:
        model = Perfil
        fields = ['foto']
        labels = {
            'foto': 'Actualizar foto'
        }
        widgets = {
            'foto': forms.FileInput(attrs={
                'class': 'w-full px-3 py-2 border rounded text-gray-800'
            }),
        }



