from django.shortcuts import render

# Create your views here.
def index(request):
    return render(request, "index.html")  # Load React's index.html