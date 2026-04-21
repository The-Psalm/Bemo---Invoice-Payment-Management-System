from django.urls import path
from .views import OverviewView, RevenueChartView, StatusBreakdownView

urlpatterns = [
    path('overview/',          OverviewView.as_view(),        name='analytics-overview'),
    path('revenue-chart/',     RevenueChartView.as_view(),    name='revenue-chart'),
    path('status-breakdown/',  StatusBreakdownView.as_view(), name='status-breakdown'),
]