from django.db import models
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth.models import User #model User có sẵn của Django, tạo khi gọi UserCreationForm()
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
# Create your models here.
class Record(models.Model): #dùng cho calendar
    #cái này chatgpt tao không biết. 
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()    
    #content_type: Model | object_id => Kết nối được với mọi model instances
    content_object = GenericForeignKey("content_type", "object_id") #Foreign key cho Task | Habit
    
    start_time= models.DateTimeField(auto_now=False, auto_now_add=False, 
                        default=(timezone.now()+ timedelta(hours=2))
                        )
    end_time= models.DateTimeField(auto_now=False, auto_now_add=False, 
                        default=(timezone.now().date()+ timedelta(days=1))
                        )
    finish_time= models.DateTimeField(auto_now=False, auto_now_add=False, null= True, blank= True) #finish.date() => ngày
    is_finished= models.BooleanField(default=False)

    def __str__(self):
        return f'Start: {self.start_time} - {self.end_time} | {"finished" if self.is_finished else "unfinished"}'

class Reminder(models.Model):
    remind_every= models.DurationField(default=timedelta(hours=1), null= True, blank= True)
    remind_at= models.DateField(auto_now=False, auto_now_add=False, null= True, blank= True)
class Task(Reminder): #Task có phần reminder
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    name = models.CharField(max_length=100)
    habit= models.ForeignKey(Habit, on_delete=models.CASCADE, related_name='tasks', null= True, blank= True)
    record= GenericRelation(Record) #reverse query

    def __str__(self):
        return self.name
    
#Sử dụng cái này nha
class TaskCheckBox(Task):
    pass
class TaskAmount(Task): #tao mong cái inherite hoạt động, không thôi ăn cớt
    total_amout= models.PositiveIntegerField(default= 1)
    current_amount= models.PositiveIntegerField(default= 0)
    unit= models.CharField(max_length=25)

class Habit(models.Model, Reminder): #Habit có phần reminder
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='habits')
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    duration = models.DurationField(default=timedelta(days=2))
    
    current_streak = models.PositiveIntegerField(default=0)
    best_streak = models.PositiveIntegerField(default=0)
    is_archived = models.BooleanField(default=False)


    record= GenericRelation(Record) #reverse query

    def __str__(self):
        return self.name
    
class Emotion(models.Model):
    status = models.CharField(max_length=50)
    icon = models.ImageField(upload_to='emotions/', null=True, blank=True)
    ratings = models.PositiveIntegerField(default=0, min_value=1, max_value=10)
    