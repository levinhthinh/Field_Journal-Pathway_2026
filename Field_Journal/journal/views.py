from django.shortcuts import render, redirect
from django.views.generic import ListView
from .models import Journal, JournalImage

class JournalHomeView(ListView):
    model = Journal
    template_name = 'journal/home.html'
    context_object_name = 'journals'
    paginate_by = 10

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Journal.objects.filter(user=self.request.user).order_by('-created')
        return Journal.objects.all().order_by('-created')


def create_journal(request):
    if request.method == 'POST':
        title = request.POST.get('title', '').strip()
        emotion = request.POST.get('emotion')
        text = request.POST.get('text')
        is_bookmark = request.POST.get('is_bookmark') == 'on'
        
        journal = Journal.objects.create(
            user=request.user if request.user.is_authenticated else None,
            title=title,
            emotion=emotion,
            text=text,
            is_bookmark=is_bookmark
        )
        
        # 2. Lấy danh sách nhiều ảnh dựa vào thuộc tính name="images" từ HTML gửi lên
        images = request.FILES.getlist('images') 
        
        for image in images:
            meta = {
                "name": image.name,
                "size": image.size,
                "content_type": image.content_type
            }
            # Lưu từng ảnh vào Database (Django-storages sẽ tự động đẩy file lên S3)
            JournalImage.objects.create(
                journal=journal,
                img=image,
                meta_data=meta
            )

        return redirect('journal:home')  # Sau khi lưu xong, điều hướng về danh sách nhật ký

    return render(request, 'journal/create_journal.html')