
from django.urls import path
from . import views

app_name = 'journal'

urlpatterns = [
    path('', views.JournalHomeView.as_view(), name='home'),
    path('create/', views.create_journal, name='create'),
]