from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import BusinessProfile
from .serializers import BusinessProfileSerializer


class BusinessProfileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        profile = BusinessProfile.get()
        return Response(BusinessProfileSerializer(profile).data)

    def patch(self, request):
        profile = BusinessProfile.get()
        serializer = BusinessProfileSerializer(
            profile, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)