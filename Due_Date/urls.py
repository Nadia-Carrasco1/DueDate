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
from Cronometro import views as cronometro_views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', interfaz_views.home_view, name='home'),
    # Usuario
    path('Registrarse/', views.Registrarse, name='Registrarse'),
    path('IniciarSesion/', views.IniciarSesion, name='IniciarSesion'),
    path('CerrarSesion/', views.CerrarSesion, name='CerrarSesion'),
    path('Perfil/', views.verPerfil, name='Perfil'),
    path('reenviar-confirmacion/', views.reenviar_confirmacion, name='reenviar_confirmacion'),
    path('confirmar/<uidb64>/<token>/', views.confirmar_registro, name='confirmar_registro'),
    path("__reload__/", include("django_browser_reload.urls")),
    # Lista de pendientes
    path('ListaPendientes/', eventos_views.ListaPendientes, name="ListaPendientes"),
    path('Lista/<int:pk>/', eventos_views.mostrarLista, name="mostrarLista"),
    path('Lista/<int:pk_lista>/eliminar/<int:pk_tarea>', eventos_views.eliminar_tarea, name='eliminar_tarea'),
    path('Tarea/<int:pk_tarea>/estado/', eventos_views.cambiar_estado_tarea, name='cambiar_estado'),
    path('MiLista/', eventos_views.acceso_lista_unica, name='acceso_lista_unica'),
    # Cronómetro
    path('Cronometro/', cronometro_views.mostrar_cronometro, name='cronometro'),
    path('CrearSesionEstudio/', cronometro_views.crear_sesion_estudio, name='crear_sesion_estudio'),
    path('finalizar-sesion/', cronometro_views.finalizar_sesion, name='finalizar_sesion')
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)