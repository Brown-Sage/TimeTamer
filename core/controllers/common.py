"""Helpers shared by the API controllers."""

import json

from django.http import JsonResponse
from pydantic import ValidationError as PydanticValidationError


def parse_body(request):
    """
    Full-fidelity body parsing: JSON bodies keep every type (objects, lists,
    numbers); form-encoded bodies become a plain dict of string values.
    Returns None for malformed JSON.
    """
    if request.content_type == 'application/json':
        try:
            return json.loads(request.body or '{}')
        except (json.JSONDecodeError, TypeError):
            return None
    return {key: value for key, value in request.POST.items()}


def validate_data(data, schema):
    """
    Validate an already-parsed payload against a Pydantic schema.
    Returns (model, None) on success, (None, JsonResponse) on failure with
    field-level error details under 'errors'.
    """
    try:
        return schema.model_validate(data), None
    except PydanticValidationError as exc:
        errors = {}
        for err in exc.errors():
            key = '.'.join(str(part) for part in err['loc']) or '__all__'
            errors.setdefault(key, []).append(err['msg'])
        return None, JsonResponse(
            {'message': 'Invalid data', 'errors': errors}, status=400,
        )


def parse_validated(request, schema):
    """parse_body + validate_data in one step."""
    data = parse_body(request)
    if data is None:
        return None, JsonResponse({'message': 'Invalid JSON'}, status=400)
    return validate_data(data, schema)
