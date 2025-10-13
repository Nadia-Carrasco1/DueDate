from django import forms
from .models import SesionEstudio
from datetime import timedelta

class SesionEstudioForm(forms.ModelForm):
    ESTUDIO_OPCIONES=[
        ("1-0", "1m estudio - 0m descanso"),
        ("10-5", "10m estudio - 5m descanso"),
        ("20-5", "20m estudio - 5m descanso"),
        ("40-8", "40m estudio - 8m descanso"),
        ("60-10", "60m estudio - 10m descanso"),
    ]

    REPETICIONES_OPCIONES=[(i, f"{i}") for i in range(1, 11)]

    opciones_radio = forms.ChoiceField(
        choices=ESTUDIO_OPCIONES,
        widget=forms.RadioSelect,
        label='Definir tiempos'
    )

    repeticiones = forms.ChoiceField(
        choices=REPETICIONES_OPCIONES,
        widget=forms.Select(attrs={'class': 'form-control'}),
        label="Repeticiones"
    )

    class Meta:
        model = SesionEstudio

        fields = [
            'opciones_radio',
            'repeticiones'
        ]

    def clean_repeticiones(self):
        repeticiones = int(self.cleaned_data['repeticiones']) # convierte de str a int
        if repeticiones < 1 or repeticiones > 10:
            raise forms.ValidationError('Selecciona las repeticiones entre 1 y 10')
        return repeticiones
    
    def save(self, commit=True):
        # instancia de SesionEstudio (obj)
        sesion_estudio = super().save(commit=False)

        # Valores de las opciones
        preset_valor = self.cleaned_data['opciones_radio']
        estudio_min, descanso_min = map(int, preset_valor.split('-'))

        sesion_estudio.tiempo_estudio = timedelta(minutes=estudio_min)
        sesion_estudio.tiempo_descanso = timedelta(minutes=descanso_min)

        repeticiones = int(self.cleaned_data['repeticiones'])
        sesion_estudio.repeticiones = repeticiones

        sesion_estudio.meta_en_minutos = estudio_min * repeticiones
        
        if commit:
            sesion_estudio.save()

        return sesion_estudio