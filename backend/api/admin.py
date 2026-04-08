from django.contrib import admin
from .models import Event, Participant, Registration

# Saving our models so that they appear in the admin interface
admin.site.register(Event)
admin.site.register(Participant)
admin.site.register(Registration)