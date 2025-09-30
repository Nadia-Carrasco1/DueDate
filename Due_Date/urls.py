"""
URL configuration for Due_Date project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from Usuarios import views
from Interfaz import views as interfaz_views
from Eventos import views as eventos_views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', interfaz_views.home_view, name='home'),
    path('Registrarse/', views.Registrarse, name='Registrarse'),
    path('IniciarSesion/', views.IniciarSesion, name='IniciarSesion'),
    path('CerrarSesion/', views.CerrarSesion, name='CerrarSesion'),
    path('Perfil/', views.verPerfil, name='Perfil'),
    path('ListaPendientes/', eventos_views.ListaPendientes, name="ListaPendientes"),
    path('Lista/<int:pk>/', eventos_views.mostrarLista, name="mostrarLista"),
    path('MiLista/', eventos_views.acceso_lista_unica, name='acceso_lista_unica'),
    path('reenviar-confirmacion/', views.reenviar_confirmacion, name='reenviar_confirmacion'),
    path('confirmar/<uidb64>/<token>/', views.confirmar_registro, name='confirmar_registro'),
    path("__reload__/", include("django_browser_reload.urls")),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
