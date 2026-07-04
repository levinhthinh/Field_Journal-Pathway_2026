from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import TaskCheckBox, TaskAmount, Record
from .serializer import TaskCheckBoxSerializer, TaskAmountSerializer, RecordSerializer

#Nếu có User/ is authenticated => cho xem data
class UserOwnedModelViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    #Mỗi Viewset ở dưới sẽ dùng chung function này
    def get_queryset(self): #lấy data về cho người dùng
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer): #tạo model instance sẽ add User vào trong model
        serializer.save(user=self.request.user)

class BaseTaskViewSet(UserOwnedModelViewSet):
    def perform_create(self, serializer): #tự tạo record mỗi lần được task được create
        task = serializer.save(user=self.request.user)
        Record.objects.create(content_object=task)

    @action(detail=True, methods=["patch"]) #update data cho record 
    def record(self, request, pk=None):
        task = self.get_object()
        record_obj = task.record.first()
        if record_obj is None: return Response({"detail": "No record exists for this task."}, status=404)
        
        serializer = RecordSerializer(
            record_obj,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)
class TaskCheckBoxViewSet(BaseTaskViewSet):
    queryset = TaskCheckBox.objects.all()
    serializer_class = TaskCheckBoxSerializer

class TaskAmountViewSet(BaseTaskViewSet):
    queryset = TaskAmount.objects.all()
    serializer_class = TaskAmountSerializer

