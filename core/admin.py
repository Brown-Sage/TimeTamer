from django.contrib import admin
from .models import User, Setting, Task

# Register your models here.
admin.site.register(User)
admin.site.register(Setting)
admin.site.register(Task)