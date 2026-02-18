from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import login, logout
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, WalletSerializer
from .models import Wallet

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []  # Disable SessionAuthentication CSRF enforcement
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user)
            return Response(UserSerializer(user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_200_OK)

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class WalletView(generics.RetrieveAPIView):
    serializer_class = WalletSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        wallet, created = Wallet.objects.get_or_create(user=self.request.user)
        return wallet

from .models import State, District, City
from .serializers import StateSerializer, DistrictSerializer, CitySerializer

class LocationView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, type=None, parent_id=None):
        if type == 'states':
            states = State.objects.all()
            return Response(StateSerializer(states, many=True).data)
        elif type == 'districts':
            if not parent_id:
                return Response({'error': 'State ID required'}, status=400)
            districts = District.objects.filter(state_id=parent_id)
            return Response(DistrictSerializer(districts, many=True).data)
        elif type == 'cities':
            if not parent_id:
                return Response({'error': 'District ID required'}, status=400)
            cities = City.objects.filter(district_id=parent_id)
            return Response(CitySerializer(cities, many=True).data)
        return Response({'error': 'Invalid request'}, status=400)
