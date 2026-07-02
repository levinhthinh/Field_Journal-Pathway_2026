from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import TaskCheckBoxViewSet

router = DefaultRouter()

router.register(r"task_checkboxes", TaskCheckBoxViewSet)

urlpatterns = [
    path("", include(router.urls)),
]