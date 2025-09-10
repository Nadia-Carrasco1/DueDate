from django.shortcuts import render
from django.http import HttpResponse

def home_view(request):
    return HttpResponse("Bienvenida a Due_Date")

def Registrarse(request):
    return render(request, 'Registrarse.html')
