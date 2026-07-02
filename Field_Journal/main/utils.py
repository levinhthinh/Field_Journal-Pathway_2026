from datetime import timedelta
from django.utils import timezone

def default_time(time_to_add: timedelta= timedelta())-> callable:
    # partial(callable, arg) => expression/callable cho default field trong models
    return lambda time_to_add: timezone.now() + time_to_add
