from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views import View

from core.controllers.common import parse_validated
from core.schemas import LoginSchema


class AuthController(View):
    http_method_names = ['post', 'delete']

    def post(self, request):
        params, error = parse_validated(request, LoginSchema)
        if error:
            return error

        user = authenticate(
            request, username=params.username, password=params.password
        )

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
