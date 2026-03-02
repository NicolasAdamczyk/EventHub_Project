from django.contrib import admin
from .models import Event, Participant, Registration

# On enregistre nos modèles pour qu'ils apparaissent dans l'interface admin
admin.site.register(Event)
admin.site.register(Participant)
admin.site.register(Registration)