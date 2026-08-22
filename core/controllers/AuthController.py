from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views import View

from core.controllers.common import parse_params


class AuthController(View):
    http_method_names = ['post', 'delete']

    def post(self, request):
        params = parse_params(request)
        username = params.get('username')
        password = params.get('password')

        user = authenticate(request, username=username, password=password)

        if user is not None:
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
