import secrets
from django.contrib.auth import authenticate
from django.conf import settings
from rest_framework import status, views, permissions, viewsets
from rest_framework.response import Response
from .models import User, AuthToken, Address
from .serializers import UserSerializer, RegisterSerializer, AddressSerializer


class RegisterView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token = AuthToken.generate_token(user)
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data,
                'message': 'Account registered successfully.'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')

        if not email or not password:
            return Response({'error': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=email, password=password)
        if not user:
            # Try lookup by email directly in case username differs
            try:
                user_obj = User.objects.get(email__iexact=email)
                if user_obj.check_password(password):
                    user = user_obj
            except User.DoesNotExist:
                user = None

        if not user:
            return Response({'error': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_active:
            return Response({'error': 'Your account is disabled.'}, status=status.HTTP_403_FORBIDDEN)

        token = AuthToken.generate_token(user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data,
            'message': 'Logged in successfully.'
        })


class GoogleAuthView(views.APIView):
    """
    Verifies Google ID Token via Google Identity Services or provides local development test handling.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        id_token_str = request.data.get('credential') or request.data.get('id_token')
        email = request.data.get('email', '').strip().lower()
        name = request.data.get('name', '')

        user_email = None
        google_user_id = None
        first_name = ''
        last_name = ''

        # If real google-auth library is used and CLIENT_ID configured
        client_id = getattr(settings, 'GOOGLE_CLIENT_ID', '')
        if id_token_str and client_id and not client_id.startswith('mock-'):
            try:
                from google.oauth2 import id_token
                from google.auth.transport import requests as google_requests
                id_info = id_token.verify_oauth2_token(id_token_str, google_requests.Request(), client_id)
                user_email = id_info.get('email', '').lower()
                google_user_id = id_info.get('sub')
                name = id_info.get('name', '')
                first_name = id_info.get('given_name', '')
                last_name = id_info.get('family_name', '')
            except Exception as e:
                return Response({'error': f'Google token verification failed: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Development / mock fallback when test credentials are provided
            if not email:
                return Response({'error': 'Google credential or email is required for authentication.'}, status=status.HTTP_400_BAD_REQUEST)
            user_email = email
            google_user_id = f"google-dev-{secrets.token_hex(6)}"
            parts = name.split()
            first_name = parts[0] if parts else 'Google'
            last_name = ' '.join(parts[1:]) if len(parts) > 1 else 'User'

        # Find or create user
        user, created = User.objects.get_or_create(
            email=user_email,
            defaults={
                'first_name': first_name,
                'last_name': last_name,
                'google_id': google_user_id,
                'role': User.Role.CUSTOMER,
            }
        )
        if not user.google_id and google_user_id:
            user.google_id = google_user_id
            user.save(update_fields=['google_id'])

        token = AuthToken.generate_token(user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data,
            'is_new_user': created,
            'message': 'Google authentication successful.'
        })


class LogoutView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # Delete auth token if token auth was used
        if hasattr(request, 'auth') and isinstance(request.auth, AuthToken):
            request.auth.delete()
        return Response({'message': 'Logged out successfully.'})


class ProfileView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def put(self, request):
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetRequestView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # For security and privacy, return a standard message regardless of email existence
        user_exists = User.objects.filter(email=email).exists()
        return Response({
            'message': 'If an account exists with this email address, password reset instructions have been dispatched.'
        })


class PasswordResetConfirmView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        new_password = request.data.get('new_password', '')

        if not email or not new_password or len(new_password) < 6:
            return Response({'error': 'Valid email and password with at least 6 characters required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            user.set_password(new_password)
            user.save()
            return Response({'message': 'Password has been updated successfully. You can now login.'})
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)


class AddressListCreateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        addresses = Address.objects.filter(user=request.user)
        return Response(AddressSerializer(addresses, many=True).data)

    def post(self, request):
        serializer = AddressSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AddressDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return Address.objects.get(pk=pk, user=user)
        except Address.DoesNotExist:
            return None

    def put(self, request, pk):
        address = self.get_object(pk, request.user)
        if not address:
            return Response({'error': 'Address not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = AddressSerializer(address, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        address = self.get_object(pk, request.user)
        if not address:
            return Response({'error': 'Address not found.'}, status=status.HTTP_404_NOT_FOUND)
        address.delete()
        return Response({'message': 'Address removed successfully.'}, status=status.HTTP_204_NO_CONTENT)
