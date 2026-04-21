from django.urls import path
from .views import ReportView, ExportCSVView

urlpatterns = [
    path('',        ReportView.as_view(),    name='reports'),
    path('export/', ExportCSVView.as_view(), name='export-csv'),
]