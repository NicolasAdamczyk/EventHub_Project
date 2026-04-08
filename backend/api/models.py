from django.db import models

class Participant(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    # Email must be unique in the database
    email = models.EmailField(unique=True) 

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Event(models.Model):
    STATUS_CHOICES = [
        ('upcoming', 'Upcoming'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]
    title = models.CharField(max_length=200)
    description = models.TextField()
    date = models.DateTimeField()
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='upcoming'
    )

    # Many-to-Many relationship using the Registration junction table
    participants = models.ManyToManyField(Participant, through='Registration')

    def __str__(self):
        return self.title

class Registration(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    participant = models.ForeignKey(Participant, on_delete=models.CASCADE)
    registration_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Prevent duplicate registrations for the same event
        unique_together = ('event', 'participant')

    def __str__(self):
        return f"{self.participant} -> {self.event}"