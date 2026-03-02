from django.db import models

class Participant(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True) # L'email doit être unique

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Event(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    date = models.DateTimeField()
    status = models.CharField(max_length=50)
    
    # C'est ici qu'on crée le lien "plusieurs-à-plusieurs" via la table Registration
    participants = models.ManyToManyField(Participant, through='Registration')

    def __str__(self):
        return self.title

class Registration(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    participant = models.ForeignKey(Participant, on_delete=models.CASCADE)
    registration_date = models.DateTimeField(auto_now_add=True) # Date automatique

    class Meta:
        # Cette ligne est cruciale : elle empêche un participant de s'inscrire 2 fois au même événement
        unique_together = ('event', 'participant')

    def __str__(self):
        return f"{self.participant} -> {self.event}"