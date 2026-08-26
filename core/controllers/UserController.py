from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.http import JsonResponse
from django.views import View
from django.db import IntegrityError

from core.controllers.common import parse_validated
from core.schemas import RegisterSchema

User = get_user_model()


class UserController(View):
    def post(self, request):
        params, error = parse_validated(request, RegisterSchema)
        if error:
            return error

        email = params.email
        username = params.username
        password = params.password

        # The model does not enforce unique emails; the login key is the
        # username, but silently sharing an email across accounts invites
        # confusion (and password-reset ambiguity later).
        if User.objects.filter(email__iexact=email).exclude(username=username).exists():
            return JsonResponse({'message': 'Email is already registered'}, status=400)

        try:
            # Pass an unsaved user so similarity validators can compare
            # against the chosen username/email.
            validate_password(password, user=User(
                username=username, email=email,
            ))
        except ValidationError as exc:
            return JsonResponse({
                'message': 'Password does not meet requirements',
                'errors': list(exc.messages),
            }, status=400)

        try:
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
            return JsonResponse({'message': 'Username already exists'}, status=400)

    def get(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({'message': 'Authentication required'}, status=401)

        user = request.user

        return JsonResponse({
            'uid': str(user.uid),
            'username': user.username,
            'email': user.email,
            'phone': user.phone,
            'role': user.role.name if user.role else None,
        })
