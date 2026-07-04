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
        fields = '__all__'
        read_only_fields = (
            "id",
            "user",
            "created",
            "updated",
            "images",
        )

    
    def create(self, validated_data):
        # Remove the non-model field
        validated_data.pop("upload_images", None) #chatgpt bảo làm vậy tránh lỗi khi create được gọi trong api
        return Journal.objects.create(**validated_data)

    def get_images(self, obj):
        return [image.img_url for image in obj.images.all()]

    