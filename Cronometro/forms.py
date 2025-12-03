from django import forms
from .models import SesionEstudio
from datetime import timedelta

class SesionEstudioForm(forms.ModelForm):
    REPETICIONES_OPCIONES=[(i, f"{i}") for i in range(1, 11)]

    tiempo_estudio_input = forms.IntegerField(
        label='Tiempo de Estudio (1-120 minutos)',
        widget=forms.NumberInput(attrs={
            'min': 1,
            'max': 120,
            'class': 'form-control',
            'placeholder': 'De 1m a 120m'
        }),
        initial=20
    )

    tiempo_descanso_input = forms.IntegerField(
        label='Tiempo de Descanso (1-30 minutos)',
        widget=forms.NumberInput(attrs={
            'min': 1,
            'max': 30,
            'class': 'form-control',
            'placeholder': 'De 1m a 30m'
        }),
        initial=5
    )

    repeticiones = forms.ChoiceField(
        choices=REPETICIONES_OPCIONES,
        widget=forms.Select(attrs={'class': 'form-control'}),
        label="Ciclos"
    )

    class Meta:
        model = SesionEstudio
        
        fields = [
            'tiempo_estudio_input',
            'tiempo_descanso_input',
            'repeticiones'
        ]

    def clean_repeticiones(self):
        repeticiones = int(self.cleaned_data['repeticiones'])
        if repeticiones < 1 or repeticiones > 10:
            raise forms.ValidationError('Selecciona las repeticiones entre 1 y 10')
        return repeticiones

    def clean(self):
        cleaned_data = super().clean()
        
        estudio_min = cleaned_data.get('tiempo_estudio_input')
        descanso_min = cleaned_data.get('tiempo_descanso_input')

        if estudio_min is not None and (estudio_min < 1 or estudio_min > 120):
            self.add_error('tiempo_estudio_input', 'El tiempo de estudio debe estar entre 1 y 120 minutos.')
            
        if descanso_min is not None and (descanso_min < 1 or descanso_min > 30):
            self.add_error('tiempo_descanso_input', 'El tiempo de descanso debe estar entre 1 y 30 minutos.')
            
        return cleaned_data
    
    def save(self, commit=True):
        sesion_estudio = super().save(commit=False)

        estudio_min = self.cleaned_data['tiempo_estudio_input']
        descanso_min = self.cleaned_data['tiempo_descanso_input']

        sesion_estudio.tiempo_estudio = timedelta(minutes=estudio_min)
        sesion_estudio.tiempo_descanso = timedelta(minutes=descanso_min)

        repeticiones = self.cleaned_data['repeticiones']
        if isinstance(repeticiones, str):
            repeticiones = int(repeticiones)
            
        sesion_estudio.repeticiones = repeticiones

        sesion_estudio.meta_en_minutos = estudio_min * repeticiones
        
        if commit:
            sesion_estudio.save()

        return sesion_estudio