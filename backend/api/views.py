from rest_framework import viewsets
from .models import Event, Participant, Registration
from .serializers import EventSerializer, ParticipantSerializer, RegistrationSerializer
from .permissions import IsAdminOrReadOnly

from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response

from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import AllowAny

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    # Apply custom role-based permissions
    permission_classes = [IsAdminOrReadOnly]

class ParticipantViewSet(viewsets.ModelViewSet):
    queryset = Participant.objects.all()
    serializer_class = ParticipantSerializer
    permission_classes = [IsAdminOrReadOnly]

class RegistrationViewSet(viewsets.ModelViewSet):
    queryset = Registration.objects.all()
    serializer_class = RegistrationSerializer
    permission_classes = [IsAdminOrReadOnly]

class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)

        # Return token and staff status to manage frontend permissions
        return Response({
            'token': token.key,
            'is_staff': user.is_staff
        })

class RegisterUserView(APIView):
    # Allow public access for account creation
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({'error': 'Please provide both username and password'}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure unique usernames in the database
        if User.objects.filter(username=username).exists():
            return Response({'error': 'This username is already taken'}, status=status.HTTP_400_BAD_REQUEST)

        # Securely create user with hashed password (staff set to False by default)
        user = User.objects.create_user(username=username, password=password)

        return Response({'message': 'User created successfully!'}, status=status.HTTP_201_CREATED)