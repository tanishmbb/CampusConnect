from rest_framework import status, views, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, CustomTokenObtainPairSerializer, UserSerializer
from .permissions import IsAdminUserRole

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            user_data = UserSerializer(user).data
            return Response({
                'message': 'Registration successful.',
                'user': user_data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CurrentUserView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        data = UserSerializer(user).data
        if user.role == 'STUDENT' and hasattr(user, 'student_profile'):
            from students.serializers import StudentProfileSerializer
            data['student_profile'] = StudentProfileSerializer(user.student_profile).data
        elif user.role == 'RECRUITER' and hasattr(user, 'recruiter_profile'):
            from recruiters.serializers import RecruiterProfileSerializer
            data['recruiter_profile'] = RecruiterProfileSerializer(user.recruiter_profile).data
        return Response(data)

    def patch(self, request):
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserStatusToggleView(views.APIView):
    permission_classes = [IsAdminUserRole]

    def post(self, request, pk):
        try:
            target_user = User.objects.get(pk=pk)
            target_user.is_active = not target_user.is_active
            target_user.save()
            return Response({
                'message': f"User status changed to {'active' if target_user.is_active else 'inactive'}.",
                'is_active': target_user.is_active
            })
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
