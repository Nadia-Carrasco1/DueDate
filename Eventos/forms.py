from django import forms
from .models import Tarea

class TareaForm(forms.ModelForm):
    class Meta:
        model = Tarea
        fields = ['descripcion']
        
        widgets = {
            'descripcion': forms.TextInput(attrs={
                'autocomplete': 'off',
                'name': 'task_input',
                'class': 'w-full bg-neutral-800 text-white p-2 rounded-md border border-neutral-600 focus:outline-none focus:border-indigo-500',
                'placeholder': 'Agregar nueva tarea...',
            })
        }