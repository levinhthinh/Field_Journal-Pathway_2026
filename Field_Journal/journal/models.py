from django.db import models

# Create your models here.
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
User = get_user_model()

class Journal(models.Model):
    class EmotionChoices(models.TextChoices):
        HAPPY= 'HAPPY', 'Happy',
        SAD= 'SAD', 'Sad',
        ANGRY= 'ANGRY', 'Angry',
        CALM= 'CALM', 'Calm',
        NEUTRAL= 'NEUTRAL', 'neutral'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='journals', null=True, blank=True)
    title = models.CharField(max_length=200, default='', verbose_name='Tiêu đề')
    emotion = models.CharField(max_length=20, choices=EmotionChoices.choices, default= EmotionChoices.NEUTRAL)
    emotion_rating= models.PositiveIntegerField(default= 5,validators=[MinValueValidator(1), MaxValueValidator(10)])
    text = models.TextField()
    is_bookmark = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        username = self.user.username if self.user else 'Guest'
        return f"{self.title or 'Journal'} by {username} on {self.created.strftime('%Y-%m-%d')}"


class JournalImage(models.Model):
    journal = models.ForeignKey(Journal, on_delete=models.CASCADE, related_name='images')
    # Khi dùng S3, FileField/ImageField sẽ tự động sinh ra URL dẫn tới S3 bucket
    img = models.ImageField(upload_to='journal_images/') 
    
    # Nâng cao: metadata nếu cần lưu trữ thông tin ảnh (dạng JSON cho linh hoạt)
    meta_data = models.JSONField(blank=True, null=True)

    @property
    def img_url(self):
        """Trả về URL tuyệt đối của ảnh trên S3"""
        if self.img:
            return self.img.url
        return ""

    def __str__(self):
        return f"Image for {self.journal.id}"