import uuid
import json
from django.http import JsonResponse

def generate_uuid():
    """Generate a random UUID string."""
    return str(uuid.uuid4())

def json_response(message, data=None, status=200):
    """Return a standardized JSON response."""
    response = {'message': message}
    if data:
        response['data'] = data
    return JsonResponse(response, status=status)

def parse_request_body(request):
    """Parse JSON request body safely."""
    try:
        return json.loads(request.body.decode('utf-8'))
    except (json.JSONDecodeError, AttributeError):
        return None
