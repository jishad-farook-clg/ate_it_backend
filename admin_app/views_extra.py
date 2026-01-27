from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from core.models import User
from core.serializers import UserSerializer
from customer_app.models import Issue
from customer_app.serializers import IssueSerializer
from core.permissions import IsAdmin

class AdminCustomerViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAdmin]
    queryset = User.objects.filter(role=User.Role.CUSTOMER)
    serializer_class = UserSerializer

class AdminIssueViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdmin]
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        issue = self.get_object()
        resolution = request.data.get('resolution_notes')
        if not resolution:
             return Response({'error': 'Resolution notes required'}, status=status.HTTP_400_BAD_REQUEST)
        
        issue.status = Issue.Status.RESOLVED
        issue.resolution_notes = resolution
        issue.save()
        return Response(IssueSerializer(issue).data)
