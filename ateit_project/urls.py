from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
   openapi.Info(
      title="ATEit API",
      default_version='v1',
      description="API for ATEit Food Rescue App",
      terms_of_service="https://www.google.com/policies/terms/",
      contact=openapi.Contact(email="contact@ateit.local"),
      license=openapi.License(name="BSD License"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/user/', include('core.urls')), # Kept as user/auth
    path('api/v1/auth/', include('core.urls')), # Alias for clarity if needed or just use one
    path('api/v1/admin/', include('admin_app.urls')),
    path('api/v1/restaurant/', include('restaurant_app.urls')),
    path('api/v1/customer/', include('customer_app.urls')),
    
    # Session Login for Browsable API & Swagger
    path('accounts/', include('rest_framework.urls')),
    
    # Documentation
    path('swagger<format>/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
