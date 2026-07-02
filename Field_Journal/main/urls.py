from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import TaskCheckBoxViewSet, TaskAmountViewSet

router = DefaultRouter()

router.register(r"task-checkboxes", TaskCheckBoxViewSet, basename='taskcheckbox')
router.register(r"task-amount", TaskAmountViewSet, basename='taskamount')

urlpatterns = [
    path("", include(router.urls)),
]