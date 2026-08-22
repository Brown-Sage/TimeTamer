"""
URL configuration for pomodoro project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
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
from django.urls import path,re_path
from django.views.generic import TemplateView
from core.controllers.AuthController import AuthController
from core.controllers.UserController import UserController
from core.controllers.SyncController import (
    NoteController,
    SessionController,
    SettingController,
    TaskController,
)
from django.conf import settings
from django.conf.urls.static import static
from core.views import api_not_found, csrf, index

from core.controllers.SpotifyController import (
    SpotifyCallbackView,
    SpotifyDisconnectView,
    SpotifyLoginView,
    SpotifyStatusView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/csrf/', csrf, name='csrf'),
    path('api/register/', UserController.as_view(), name='register'),
    path('api/login/', AuthController.as_view(), name='login'),
    path('api/logout/', AuthController.as_view(), name='delete'),
    path('manifest.json', TemplateView.as_view(template_name='manifest.json', content_type='application/json')),
    path('service-worker.js', TemplateView.as_view(template_name='service-worker.js', content_type='application/javascript')),

    #get user data;
    path('api/user/', UserController.as_view(), name='user_data'),

    # focus session + settings sync
    path('api/sessions/', SessionController.as_view(), name='sessions'),
    path('api/settings/', SettingController.as_view(), name='settings'),

    # tasks + notes sync (whole-collection upsert)
    path('api/tasks/', TaskController.as_view(), name='tasks'),
    path('api/notes/', NoteController.as_view(), name='notes'),

    # spotify oauth scaffold
    path('api/spotify/login/', SpotifyLoginView.as_view(), name='spotify_login'),
    path('api/spotify/callback/', SpotifyCallbackView.as_view(), name='spotify_callback'),
    path('api/spotify/status/', SpotifyStatusView.as_view(), name='spotify_status'),
    path('api/spotify/disconnect/', SpotifyDisconnectView.as_view(), name='spotify_disconnect'),

    # unknown API paths get a JSON 404, everything else is the SPA
    re_path(r'^api/', api_not_found),
    re_path(r'^.*$', index),
]
# Serve static files
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])
# if settings.DEBUG:
#     urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])