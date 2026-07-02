from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import ListView
from .models import Journal, JournalImage

class JournalHomeView(LoginRequiredMixin, ListView):
    model = Journal
    template_name = 'journal/home.html'
    context_object_name = 'journals'
    paginate_by = 10

    def get_queryset(self):
        return Journal.objects.filter(user=self.request.user).order_by('-created')

@login_required
def create_journal(request):
    if request.method == 'POST':
        title = request.POST.get('title', '').strip()
        emotion = request.POST.get('emotion')
        text = request.POST.get('text')
        is_bookmark = request.POST.get('is_bookmark') == 'on'
        
        journal = Journal.objects.create(
            user=request.user,  # Đảm bảo user đã đăng nhập
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