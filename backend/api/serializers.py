from rest_framework import serializers
from .models import Event, Participant, Registration

class ParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Participant
        fields = '__all__'  # On veut exposer tous les champs (id, prénom, nom, email)

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'  # Expose id, title, description, date, status

class RegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Registration
        fields = '__all__'  # Expose id, event, participant, registration_date