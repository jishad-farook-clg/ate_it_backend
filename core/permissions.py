from rest_framework.permissions import BasePermission
from .models import User

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.role == User.Role.ADMIN or request.user.is_superuser)

class IsRestaurant(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == User.Role.RESTAURANT

class IsCustomer(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == User.Role.CUSTOMER
