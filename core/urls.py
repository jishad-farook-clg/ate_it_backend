from django.urls import path, include
from .views import RegisterView, LoginView, LogoutView, UserProfileView, LocationView, WalletView

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/profile/', UserProfileView.as_view(), name='profile'),
    path('auth/wallet/', WalletView.as_view(), name='wallet'),
    
    # General APIs
    path('locations/<str:type>/', LocationView.as_view(), name='locations'), 
    path('locations/<str:type>/<int:parent_id>/', LocationView.as_view(), name='locations-detail'),
]
