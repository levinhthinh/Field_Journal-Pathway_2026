from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    path('login/', auth_views.LoginView.as_view(template_name='registration/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(template_name='registration/logged_out.html'), name='logout'),
<<<<<<< HEAD
    #path('signup/', auth_views.SignupView.as_view(template_name='registration/signup.html'), name='signup'),
=======
    path('signup/', views.SignupView , name='signup')
>>>>>>> a817627a3ceda1019710226f92f30f4d498662a5
]
