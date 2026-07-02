from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Task, TaskCheckBox, Record
from .serializers import TaskSerializer, TaskCheckBoxSerializer, RecordSerializer

#Nếu có User/ is authenticated => cho xem data
class UserOwnedModelViewSet(viewsets.ModelViewSet):
    # permission_classes = [IsAuthenticated]

    #Mỗi Viewset ở dưới sẽ dùng chung function này
    def get_queryset(self): #lấy data về cho người dùng
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer): #tạo model instance sẽ add User vào trong model
        serializer.save(user=self.request.user)

class TaskCheckBoxViewSet(UserOwnedModelViewSet):
    queryset = TaskCheckBox.objects.all()
    serializer_class = TaskCheckBoxSerializer

    def perform_create(self, serializer): #tự tạo record mỗi lần được task được create
        task = serializer.save(user=self.request.user)
        Record.objects.create(content_object=task)

    @action(detail=True, methods=["patch"]) #update data cho record 
    def record(self, request, pk=None):
        task = self.get_object()

        serializer = RecordSerializer(
            task.record,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)
