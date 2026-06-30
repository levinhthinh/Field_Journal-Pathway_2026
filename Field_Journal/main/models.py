from django.db import models
from datetime import timedelta

# Create your models here.
class Habit(models.Model):
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    duration = models.DurationField(default=timedelta(days=2))
    
    current_streak = models.PositiveIntegerField(default=0)
    best_streak = models.PositiveIntegerField(default=0)
    is_archived = models.BooleanField(default=False)
    #nhớ add foreign key của Habit vô Task Model

    def __str__(self):
        return self.name