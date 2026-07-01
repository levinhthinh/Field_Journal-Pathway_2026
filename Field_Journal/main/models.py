from django.db import models
from datetime import timedelta
from django.contrib.auth.models import User #model User có sẵn của Django, tạo khi gọi UserCreationForm()
from django.core.validators import MinValueValidator, MaxValueValidator

# Create your models here.
class Habit(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='habits')
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    duration = models.DurationField(default=timedelta(days=2))
    
    current_streak = models.PositiveIntegerField(default=0)
    best_streak = models.PositiveIntegerField(default=0)
    is_archived = models.BooleanField(default=False)
    #nhớ add foreign key của Habit vô Task Model

    def __str__(self):
        return self.name
    
class Task(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    name = models.CharField(max_length=100)
    habit= models.ForeignKey(Habit, on_delete=models.CASCADE, related_name='tasks')

    def __str__(self):
        return self.name
    

class Emotion(models.Model):
    status = models.CharField(max_length=50)
    icon = models.ImageField(upload_to='emotions/', null=True, blank=True)
    ratings = models.PositiveIntegerField(default=5, validators=[MinValueValidator(1), MaxValueValidator(10)])
    created_at = models.DateTimeField(auto_now_add=True)

class JournalImage(models.Model):
    journal = models.ForeignKey(Journal, on_delete=models.CASCADE, related_name='images')  # type: ignore | Mising Journal Model
    img = models.ImageField(upload_to='journal_images/')
