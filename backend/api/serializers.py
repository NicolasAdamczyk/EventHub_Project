from rest_framework import serializers
from .models import Event, Participant, Registration
from django.utils import timezone

class ParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Participant
        fields = '__all__'  # On veut exposer tous les champs (id, prénom, nom, email)

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'  # Expose id, title, description, date, status
        
    def validate_date(self, value):
        # Si la date envoyée est plus petite que la date actuelle
        if value < timezone.now():
            raise serializers.ValidationError("The date of the event cannot be in the past.")
        return value

class RegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Registration
        fields = '__all__'  # Expose id, event, participant, registration_date