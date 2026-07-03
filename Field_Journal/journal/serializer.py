from rest_framework import serializers

from .models import Journal, JournalImage


class JournalSerializer(serializers.ModelSerializer):
    images = serializers.SerializerMethodField()
    upload_images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False,
    )

    class Meta:
        model = Journal
        fields = (
            "id",
            "title",
            "emotion",
            "text",
            "is_bookmark",
            "created",
            "updated",
            "images",
            "upload_images",
        )
        read_only_fields = (
            "id",
            "created",
            "updated",
            "images",
        )

    def get_images(self, obj):
        return [image.img_url for image in obj.images.all()]