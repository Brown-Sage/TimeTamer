from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid

# Custom User Model
# class User(AbstractUser):
#     uid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
#     phone = models.CharField(max_length=15, blank=True, null=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#     deleted_at = models.DateTimeField(blank=True, null=True)

# class User(AbstractUser):
#     uid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
#     phone = models.CharField(max_length=15, blank=True, null=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#     deleted_at = models.DateTimeField(blank=True, null=True)

#     groups = models.ManyToManyField(
#         "auth.Group",
#         related_name="custom_user_groups",
#         blank=True
#     )

#     user_permissions = models.ManyToManyField(
#         "auth.Permission",
#         related_name="custom_user_permissions",
#         blank=True
#     )

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
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(blank=True, null=True)
