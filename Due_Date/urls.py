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
from Recompensas import views as recompensas_views
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
    path('grupo-estudio/', views.vista_grupo_estudio, name='grupo_estudio'),
    path('sugerencias-usuarios/', views.sugerencias_usuarios, name='sugerencias_usuarios'),
    path('invitar-usuario/', views.invitar_usuario_ajax, name='invitar_usuario'),
    path('invitar-usuario-ajax/', views.invitar_usuario_ajax, name='invitar_usuario_ajax'),
    path('crear-grupo/', views.crear_grupo, name='crear_grupo'),
    path('grupo/', views.vista_grupo_estudio, name='vista_grupo_estudio'),
    path('grupo/salir/', views.salir_grupo, name='salir_grupo'),
    path('grupo/editar/', views.editar_grupo, name='editar_grupo'),
    path('grupo/eliminar/', views.eliminar_grupo, name='eliminar_grupo'),
    path('aceptar-invitacion/<uidb64>/<token>/<int:grupo_id>/', views.aceptar_invitacion, name='aceptar_invitacion'),
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
    path('finalizar-sesion/', cronometro_views.finalizar_sesion, name='finalizar_sesion'),
    path('aplicar_fondo/', cronometro_views.aplicar_fondo, name='aplicar_fondo'),
    # Estadísticas
    path('Estadisticas/', cronometro_views.mostrar_estadisticas, name='estadisticas'),
    path('estadisticas/datos/', cronometro_views.datos_estadisticas_estudio, name='datos_estadisticas_estudio'),
    path('estadisticas/exito/', cronometro_views.datos_estadisticas_exito, name='datos_estadisticas_exito'),
    # Calendario
    path('calendario/', eventos_views.calendario_view, name='calendario'),
    path('eventos_json/', eventos_views.eventos_json, name='eventos_json'),
    path('editar_evento/', eventos_views.editar_evento, name='editar_evento'),    
    path('obtener-formulario-edicion/<int:evento_id>/', eventos_views.obtener_formulario_edicion, name='obtener_formulario_edicion'),
    path('eliminar-evento/', eventos_views.eliminar_evento, name='eliminar_evento'),
    path('actualizar-fecha/<int:evento_id>/', eventos_views.actualizar_fecha, name='actualizar_fecha'),
    # Recompensas
    path('Logros/', recompensas_views.mostrar_logros, name='logros'),
    path('Logros/<int:pk_recompensa>/reclamar/', recompensas_views.reclamar_recompensa, name="reclamar_recompensa")
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)