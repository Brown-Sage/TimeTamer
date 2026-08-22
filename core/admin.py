from django.contrib import admin

from .models import FocusSession, Note, Setting, Task, User

admin.site.site_header = 'TimeTamer administration'

admin.site.register(User)
admin.site.register(Setting)
admin.site.register(Task)
admin.site.register(Note)
admin.site.register(FocusSession)
