from django.contrib.auth.models import BaseUserManager
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.views import View
from django.db import IntegrityError
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
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
