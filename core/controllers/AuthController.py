from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views import View
from core.models import User
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
@method_decorator(csrf_exempt, name='dispatch')
class AuthController(View):
    http_method_names = ['post', 'delete']
    def post(self, request):
        username = request.POST.get('username')
        password = request.POST.get('password')

        # Authenticate the user using the custom User model
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            # User authenticated, log them in
            login(request, user)
            return JsonResponse({
                'message': 'Login successful',
                'user': {
                    'uid': user.uid,
                    'username': user.username,
                    'phone': user.phone,
                    'role': user.role.name if user.role else None
                }
            })
        else:
            return JsonResponse({'message': 'Invalid credentials!'}, status=400)
        
    @method_decorator(csrf_exempt)
    def delete(self, request):
        # print(request)
        
        logout(request)
        
        return JsonResponse({'message': 'Logout successful'})
