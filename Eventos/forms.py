from django import forms
from .models import Tarea, Evento
from django.core.exceptions import ValidationError

class TareaForm(forms.ModelForm):
    class Meta:
        model = Tarea
        fields = ['descripcion']
        
        widgets = {
            'descripcion': forms.TextInput(attrs={
                'autocomplete': 'off',
                'name': 'task_input',
                'maxlength': '20',
                'class': 'w-full bg-neutral-800 text-white p-2 rounded-md border border-neutral-600 focus:outline-none focus:border-indigo-500',
                'placeholder': 'Agregar nueva tarea...',
            })
        }

class EventoForm(forms.ModelForm):
    repetir_anualmente = forms.BooleanField(
        required=False,
        label="Repetir cada año (opcional)",
        widget=forms.CheckboxInput(attrs={'class': 'ml-2 accent-purple-500'})
    )

    class Meta:
        model = Evento
        fields = ['titulo', 'fecha_inicio', 'fecha_fin', 'descripcion', 'recordatorio_fecha_hora', 'repetir_anualmente']
        widgets = {
            'fecha_inicio': forms.DateTimeInput(attrs={
                'type': 'datetime-local',
                'class': 'p-2 rounded bg-neutral-800 text-white border border-neutral-600',
            }, format='%Y-%m-%dT%H:%M'),
            'fecha_fin': forms.DateTimeInput(attrs={
                'type': 'datetime-local',
                'class': 'p-2 rounded bg-neutral-800 text-white border border-neutral-600',
            }, format='%Y-%m-%dT%H:%M'),
            'recordatorio_fecha_hora': forms.DateTimeInput(attrs={
                'type': 'datetime-local',
                'class': 'p-2 rounded bg-neutral-800 text-white border border-neutral-600',
            }, format='%Y-%m-%dT%H:%M'),
            'titulo': forms.TextInput(attrs={
                'class': 'w-full p-2 rounded bg-neutral-800 text-white border border-neutral-600',
                'placeholder': 'Título del evento',
            }),
            'descripcion': forms.Textarea(attrs={
                'rows': 3,
                'class': 'w-full p-2 rounded bg-neutral-800 text-white border border-neutral-600',
                'placeholder': 'Descripción',
            }),
        }

    def clean(self):
        cleaned_data = super().clean()
        fecha_inicio = cleaned_data.get("fecha_inicio")
        fecha_fin = cleaned_data.get("fecha_fin")
        if fecha_inicio and fecha_fin and fecha_fin < fecha_inicio:
            raise ValidationError("La fecha de fin no puede ser anterior a la fecha de inicio.")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['recordatorio_fecha_hora'].label = "Recordatorio fecha hora (opcional)"
        self.fields['descripcion'].label = "Descripción (opcional)"
        for field_name in ['fecha_inicio', 'fecha_fin', 'recordatorio_fecha_hora']:
            if self.instance and getattr(self.instance, field_name):
                self.fields[field_name].initial = getattr(self.instance, field_name).strftime('%Y-%m-%dT%H:%M')