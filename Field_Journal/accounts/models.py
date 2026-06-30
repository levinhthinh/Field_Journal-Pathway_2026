from django.db import models
from datetime import timedelta

# Create your models here.
class HabitModel(models.Model):
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    duration = models.DurationField(default=timedelta(days=2))
    
    current_streak = models.IntegerField(default=0)
    best_streak = models.IntegerField(default=0)
    is_archived = models.BooleanField(default=False)
    #nhớ add foreign key của Habit vô Task Model

    def __str__(self):
        return self.name