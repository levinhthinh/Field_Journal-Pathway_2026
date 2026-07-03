from django.contrib import admin
from .models import Journal, JournalImage

@admin.register(Journal)
class JournalAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'emotion', 'is_bookmark', 'created')
    list_filter = ('emotion', 'is_bookmark', 'created')
    search_fields = ('title', 'text', 'user__username')

@admin.register(JournalImage)
class JournalImageAdmin(admin.ModelAdmin):
    list_display = ('journal', 'img')
    search_fields = ('journal__title',)
