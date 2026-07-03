from functools import partial
from datetime import timedelta
from django.utils import timezone

def default_time_helper(time_to_add):
    return timezone.now() + time_to_add
    
def default_time(time_to_add: timedelta= timedelta())-> callable:
    # partial(callable, arg) => expression/callable cho default field trong models
    return partial(default_time_helper, time_to_add)
