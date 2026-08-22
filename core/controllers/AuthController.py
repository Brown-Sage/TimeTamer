from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views import View


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


class AuthController(View):
    http_method_names = ['post', 'delete']

    def post(self, request):
        params = _params(request)
        username = params.get('username')
        password = params.get('password')

        # Authenticate the user using the custom User model
        user = authenticate(request, username=username, password=password)

        if user is not None:
            # User authenticated, log them in
            login(request, user)
            return JsonResponse({
                'message': 'Login successful',
                'user': {
                    'uid': str(user.uid),
                    'username': user.username,
                    'phone': user.phone,
                    'role': user.role.name if user.role else None
                }
            })
        return JsonResponse({'message': 'Invalid credentials!'}, status=400)

    def delete(self, request):
        logout(request)
        return JsonResponse({'message': 'Logout successful'})
