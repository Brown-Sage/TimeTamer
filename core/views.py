from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie


def index(request):
    return render(request, "index.html")  # Load React's index.html


def api_not_found(request, path=None):
    """Unknown /api/* paths must not fall through to the SPA catch-all."""
    return JsonResponse({'message': 'API endpoint not found'}, status=404)


@ensure_csrf_cookie
def csrf(request):
    """Ensure the CSRF cookie is set for SPA/API clients."""
    return JsonResponse({'detail': 'CSRF cookie set'})


def csrf_failure(request, reason=""):
    return JsonResponse({'message': 'CSRF verification failed'}, status=403)
