from datetime import timedelta
from django.utils import timezone

def get_default_time(time_to_add: timedelta= None):
    if time_to_add:
        return timezone.now() + time_to_add
    else:
        return timezone.now()