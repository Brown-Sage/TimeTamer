from django.contrib.auth.models import BaseUserManager
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.views import View
from django.db import IntegrityError
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required

User = get_user_model()  # This ensures you use the custom User model

@method_decorator(csrf_exempt, name='dispatch')
class UserController(View):
    def post(self, request):
        # Get inputs from the request
        email = request.POST.get('email')
        username = request.POST.get('username')
        password = request.POST.get('password')
        # print(email, username, password)

        if not email or not username or not password:
            return JsonResponse({'message': 'All fields are required'}, status=400)

        try:
            # Create a new user instance
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password
            )
            return JsonResponse({
                'message': 'User created successfully',
                'user': {
                    'uid': user.uid,
                    'username': user.username,
                    'email': user.email,
                }
            })
        
        except IntegrityError as e:
            # Return error message if username or email already exists
            return JsonResponse({'message': 'Username or email already exists'}, status=400)
        
        except Exception as e:
            # Handle other exceptions
            return JsonResponse({'message': str(e)}, status=400)

    @method_decorator(login_required)  # Ensures only logged-in users can access
    def get(self, request):
        user = request.user  # Get the logged-in user
        
        return JsonResponse({
            'uid': user.uid,
            'username': user.username,
            'email': user.email,
            'phone': user.phone if hasattr(user, 'phone') else None,
            'role': user.role.name if hasattr(user, 'role') and user.role else None,
        })
        
    # def get(self, request, username=None):
    #     """Fetch user data by username."""
    #     if username:
    #         try:
    #             user = User.objects.get(username=username)
    #             return JsonResponse({
    #                 'uid': user.uid,
    #                 'username': user.username,
    #                 'email': user.email,
    #                 'phone': user.phone if hasattr(user, 'phone') else None,
    #                 'role': user.role.name if hasattr(user, 'role') and user.role else None
    #             })
    #         except User.DoesNotExist:
    #             return JsonResponse({'message': 'User not found'}, status=404)
        
    #     return JsonResponse({'message': 'Username parameter is required'}, status=400)
        