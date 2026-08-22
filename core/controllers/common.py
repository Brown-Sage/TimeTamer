"""Helpers shared by the API controllers."""

import json


def parse_params(request):
    """Accept both form-encoded and JSON bodies; string values only."""
    if request.content_type == 'application/json':
        try:
            data = json.loads(request.body or '{}')
            if isinstance(data, dict):
                return {k: v for k, v in data.items() if isinstance(v, str)}
        except json.JSONDecodeError:
            pass
        return {}
    return request.POST
