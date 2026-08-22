from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.views import View
from django.db import IntegrityError

User = get_user_model()  # This ensures you use the custom User model


def _params(request):
    """Accept both form-encoded and JSON bodies."""
    import json

    if request.content_type == 'application/json':
        try:
            data = json.loads(request.body or '{}')
            if isinstance(data, dict):
                return {k: v for k, v in data.items() if isinstance(v, str)}
        except json.JSONDecodeError:
            pass
        return {}
    return request.POST


class UserController(View):
    def post(self, request):
        # Get inputs from the request (form-encoded or JSON)
        params = _params(request)
        email = params.get('email')
        username = params.get('username')
        password = params.get('password')

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
                    'uid': str(user.uid),
                    'username': user.username,
                    'email': user.email,
                }
            }, status=201)

        except IntegrityError:
            # Return error message if username or email already exists
            return JsonResponse({'message': 'Username or email already exists'}, status=400)

    def get(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({'message': 'Authentication required'}, status=401)

        user = request.user

        return JsonResponse({
            'uid': str(user.uid),
            'username': user.username,
            'email': user.email,
            'phone': user.phone if hasattr(user, 'phone') else None,
            'role': user.role.name if hasattr(user, 'role') and user.role else None,
        })
