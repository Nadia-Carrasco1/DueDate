from django import forms
from .models import Tarea, Evento
from django.core.exceptions import ValidationError
from django.utils.safestring import mark_safe

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
        label=mark_safe('Repetir cada año <span class="text-gray-400">(opcional)</span>'),
        widget=forms.CheckboxInput(attrs={'class': 'ml-2 accent-purple-500'})
    )

    class Meta:
        model = Evento
        fields = ['titulo', 'fecha_inicio', 'fecha_fin', 'recordatorio_fecha_hora', 'repetir_anualmente', 'descripcion']
        widgets = {
            'titulo': forms.TextInput(attrs={
                'class': 'w-full p-2 rounded-lg bg-neutral-800 text-white border border-neutral-600',
                'placeholder': 'Título del evento',
            }),
            'fecha_inicio': forms.DateTimeInput(attrs={
                'type': 'datetime-local',
                'class': 'p-2 rounded-lg bg-neutral-800 text-white border border-neutral-600 input-con-icono',
            }, format='%Y-%m-%dT%H:%M'),
            'fecha_fin': forms.DateTimeInput(attrs={
                'type': 'datetime-local',
                'class': 'p-2 rounded-lg bg-neutral-800 text-white border border-neutral-600',
            }, format='%Y-%m-%dT%H:%M'),
            'recordatorio_fecha_hora': forms.DateTimeInput(attrs={
                'type': 'datetime-local',
                'class': 'p-2 rounded-lg bg-neutral-800 text-white border border-neutral-600',
            }, format='%Y-%m-%dT%H:%M'),
            'descripcion': forms.Textarea(attrs={
                'rows': 3,
                'class': 'w-full p-2 rounded-lg bg-neutral-800 text-white border border-neutral-600',
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
        # recordatorio y descripción con "(opcional)" normal
        self.fields['recordatorio_fecha_hora'].label = mark_safe('Recordatorio <span class="text-gray-400">(opcional)</span>')
        self.fields['descripcion'].label = mark_safe('Descripción <span class="text-gray-400">(opcional)</span>')
        
        # Agregar margen inferior a todos los campos
        for field_name, field in self.fields.items():
            old_class = field.widget.attrs.get("class", "")
            field.widget.attrs["class"] = f"{old_class} mb-2"
        
        # Inicializar campos de fecha si ya tienen valor
        for field_name in ['fecha_inicio', 'fecha_fin', 'recordatorio_fecha_hora']:
            if self.instance and getattr(self.instance, field_name):
                field = self.fields[field_name]
                field.initial = getattr(self.instance, field_name).strftime('%Y-%m-%dT%H:%M')
