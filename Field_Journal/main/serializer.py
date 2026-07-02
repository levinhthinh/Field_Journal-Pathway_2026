from rest_framework import serializers
from models import TaskCheckBox, TaskAmount, Record


class RecordSerializer(serializers.ModelSerializer):
    class Meta:
        model= Record
        fields= '__all__'
        read_only_fields = ("content_type",
                            "object_id",
                            )

    def validate(self, attrs):
        start_time= attrs.get('start_time', getattr(self.instance, 'start_time', None))
        end_time= attrs.get('end_time', getattr(self.instance, 'end_time', None))
        is_finished= attrs.get('is_finished', getattr(self.instance, 'is_finished', None))
        finish_time= attrs.get('finish_time', getattr(self.instance, 'finish_time', None))
        if (start_time is not None and
            end_time is not None and
            start_time <= end_time):
            raise serializers.ValidationError('Start time bé hơn end time')

        if (is_finished is not None and
            finish_time is None):
            raise serializers.ValidationError('Finished but doesnt have finish time')

        return attrs

class TaskCheckBoxSerializer(serializers.ModelSerializer):
    record= RecordSerializer(read_only=True)
    class Meta:
        model= TaskCheckBox
        fields= (
            'id',
            'user',
            'name',
            'habit',
            'remind_every',
            'remind_at',
        )

        read_only_fields=('user')


class TaskAmountSerializer(serializers.ModelSerializer):
    record= RecordSerializer(read_only=True)
    class Meta:
        model= TaskAmount
        fields = (
            'id',
            'user',
            'name',
            'habit',
            'remind_every',
            'remind_at',
            'total_amount',
            'current_amount',
            'unit',
        )

        read_only_fields=('user')
    
    def validate(self, attrs):
        current_amount= attrs.get('current_amount', getattr(self.instance, 'current_amount', None))
        total_amount= attrs.get('total_amount', getattr(self.instance, 'total_amount', None))

        if (current_amount is not None and
            total_amount is not None and 
            current_amount >= total_amount):
            return serializers.ValidationError('current amount >= total amount')
        
        return attrs