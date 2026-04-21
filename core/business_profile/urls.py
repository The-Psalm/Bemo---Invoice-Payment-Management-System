from django.urls import path
from .views import BusinessProfileView

urlpatterns = [
    path('', BusinessProfileView.as_view(), name='business-profile'),
]