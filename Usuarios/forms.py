from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm, PasswordChangeForm, AuthenticationForm
from .models import Perfil

class RegistroForm(UserCreationForm):
    email = forms.EmailField(
        required=True,
        widget=forms.EmailInput(attrs={
            'class': 'w-full px-3 py-2 border rounded text-gray-800'
        })
    )
    username = forms.CharField(
        widget=forms.TextInput(attrs={
            'class': 'w-full px-3 py-2 border rounded text-gray-800'
        })
    )
    password1 = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'class': 'w-full px-3 py-2 border rounded text-gray-800'
        })
    )
    password2 = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'class': 'w-full px-3 py-2 border rounded text-gray-800'
        })
    )

    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']

class LoginForm(AuthenticationForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            field.widget.attrs.update({
                'class': 'w-full px-3 py-2 border rounded text-gray-800 bg-white'
            })


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



