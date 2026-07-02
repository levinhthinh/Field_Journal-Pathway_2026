from django.shortcuts import render

# Create your views here.
from django.shortcuts import render, redirect
from .models import Journal, JournalImage

def create_journal(request):
    if request.method == 'POST':
        emotion = request.POST.get('emotion')
        text = request.POST.get('text')
        is_bookmark = request.POST.get('is_bookmark') == 'on'
        
        # 1. Tạo và lưu Journal trước
        journal = Journal.objects.create(
            user=request.user,  # Đảm bảo user đã đăng nhập
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
            
        return redirect('journal:create') # Sau khi lưu xong, tải lại chính trang này

    return render(request, 'journal/create_journal.html')