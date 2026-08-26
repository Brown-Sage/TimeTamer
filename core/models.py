from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid

# Role Model
class Role(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50, unique=True)  # e.g., Admin, Manager, User
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

# Custom User Model
class User(AbstractUser):
    uid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True, db_column="role_id")  # FK to Role
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(blank=True, null=True)

    groups = models.ManyToManyField(
        "auth.Group",
        related_name="custom_user_groups",
        blank=True
    )

    user_permissions = models.ManyToManyField(
        "auth.Permission",
        related_name="custom_user_permissions",
        blank=True
    )

    class Meta(AbstractUser.Meta):
        constraints = [
            # Case-insensitive uniqueness: login/duplicate checks compare
            # emails iexact, so the DB must not allow Foo@x and foo@x.
            # Empty strings are excluded (users without an email stay legal);
            # NULLs are naturally distinct.
            models.UniqueConstraint(
                models.functions.Lower('email'),
                condition=~models.Q(email=''),
                name='uniq_user_email_ci',
            ),
        ]

    def __str__(self):
        return self.username

# Settings Model
class Setting(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    key = models.CharField(max_length=255)
    value = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(blank=True, null=True)

# Tasks Model
class Task(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tasks")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(blank=True, null=True)
    client_id = models.CharField(max_length=64, blank=True, null=True)  # dedup/sync key sent by the client
    extra = models.JSONField(blank=True, null=True)  # client-side fields (priority, duration, timers, ...)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "client_id"], name="uniq_user_client_task")
        ]

    def __str__(self):
        return self.title


# Quick Note Model
class Note(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notes")
    text = models.TextField()
    client_id = models.CharField(max_length=64, blank=True, null=True)  # dedup/sync key sent by the client
    extra = models.JSONField(blank=True, null=True)  # client-side fields (display timestamp, ...)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at"]
        constraints = [
            models.UniqueConstraint(fields=["user", "client_id"], name="uniq_user_client_note")
        ]

    def __str__(self):
        return f"{self.text[:30]}"

# Focus Session Model
class FocusSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="focus_sessions")
    minutes = models.PositiveIntegerField()
    completed_at = models.DateTimeField()
    client_id = models.CharField(max_length=64, blank=True, null=True)  # dedup key sent by the client
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-completed_at"]
        constraints = [
            models.UniqueConstraint(fields=["user", "client_id"], name="uniq_user_client_session")
        ]

    def __str__(self):
        return f"{self.user.username} - {self.minutes}min @ {self.completed_at:%Y-%m-%d %H:%M}"
