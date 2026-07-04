from django.contrib.auth import get_user_model
from .utils import default_time #chatgpt bảo là không gọi timezone trong model bởi vì timezone chỉ được gọi 1 lần lúc runserver thôi, không cập nhật
from django.db import models
from datetime import timedelta
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation

User = get_user_model()


# Create your models here.
class Record(models.Model):  # dùng cho calendar
    # cái này c hatgpt tao không biết.
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    # content_type: Model | object_id => Kết nối được với mọi model instances
    content_object = GenericForeignKey(
        "content_type", "object_id"
    )  # Foreign key cho Task | Habit

    start_time = models.DateTimeField(
        auto_now=False,
        auto_now_add=False,
        default= default_time(time_to_add= timedelta(hours= 2)) # default nhận static value HOẶC expression, expression được gọi mỗi lần model được create
    )
    end_time = models.DateTimeField(
        auto_now=False,
        auto_now_add=False,
        default= default_time(time_to_add= timedelta(days= 1))
    )
    finish_time = models.DateTimeField(
        auto_now=False, auto_now_add=False, null=True, blank=True
    )  # finish_time.date() => ngày
    is_finished = models.BooleanField(default=False)


    def __str__(self):
        return f'Start: {self.start_time} - {self.end_time} | {"finished" if self.is_finished else "unfinished"}'

class Habit(models.Model):  #Habit có phần reminder | Habit(models.Model, Reminder) => type error
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="habits")
    name = models.CharField(max_length=100) #unique=True lát nữa rồi thêm
    created_at = models.DateTimeField(auto_now_add=True)
    duration = models.DurationField(default=timedelta(days=2))

    current_streak = models.PositiveIntegerField(default=0)
    best_streak = models.PositiveIntegerField(default=0)
    is_archived = models.BooleanField(default=False)

    remind_every = models.DurationField(
        default=timedelta(hours= 4), null=True, blank=True
    )
    remind_at = models.DateField(
        default=default_time(timedelta(hours= 2)),
        auto_now=False, auto_now_add=False, null=True, blank=True
    )

    record = GenericRelation(Record, related_query_name='habits')  # reverse query

    def __str__(self):
        return self.name


class Task(models.Model):  # Task có phần reminder
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tasks")
    name = models.CharField(max_length=100) #unique=True lát nữa rồi thêm
    habit = models.ForeignKey(
        Habit, on_delete=models.CASCADE, related_name="tasks", null=True, blank=True
    )
    
    remind_every = models.DurationField(
        default=timedelta(hours= 4), null=True, blank=True
    )
    remind_at = models.DateField(
        default=default_time(timedelta(hours= 2)),
        auto_now=False, auto_now_add=False, null=True, blank=True
    )

    record = GenericRelation(Record, related_query_name='tasks')  # reverse query

    def __str__(self):
        return self.name


# Sử dụng cái này nha
class TaskCheckBox(Task):
    pass


class TaskAmount(Task): 
    total_amout = models.PositiveIntegerField(default=1)
    current_amount = models.PositiveIntegerField(default=0)
    unit = models.CharField(max_length=25)

