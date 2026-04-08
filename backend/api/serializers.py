from rest_framework import serializers
from .models import Event, Participant, Registration
from django.utils import timezone

class ParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Participant
        # Expose all fields: id, first_name, last_name, and email
        fields = '__all__'

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'
        
    def validate_date(self, value):
        # Prevent creating or updating events with a past date
        if value < timezone.now():
            raise serializers.ValidationError("The date of the event cannot be in the past.")
        return value

class RegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Registration
        # Expose relationship fields and registration timestamp
        fields = '__all__'