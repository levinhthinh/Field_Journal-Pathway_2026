from django.contrib.auth import get_user_model
from journal.models import Journal
from django.utils import timezone
from datetime import timedelta

User = get_user_model()
user = User.objects.get(username='kk')

ratings = [3, 5, 4, 7, 6, 8, 9]  # oldest -> newest, one per day | W Claude

for i, rating in enumerate(ratings):
    days_ago = len(ratings) - 1 - i
    j = Journal.objects.create(
        user=user,
        title=f"Test entry ({days_ago}d ago)",
        emotion=Journal.EmotionChoices.NEUTRAL,
        emotion_rating=rating,
        text="Backdated for testing the chart.",
    )
    Journal.objects.filter(pk=j.pk).update(
        created=timezone.now() - timedelta(days=days_ago)
    )

print("Done — created", len(ratings), "test entries.")