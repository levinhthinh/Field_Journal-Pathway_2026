from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter

from .views import JournalViewSet

router = DefaultRouter()

router.register(r"journal", JournalViewSet, basename='journal')

urlpatterns = [
    path("", include(router.urls)),
]