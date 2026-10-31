from rest_framework import authentication, exceptions
from .models import AuthToken


class TokenAuthentication(authentication.BaseAuthentication):
    keyword = 'Bearer'

    def authenticate(self, request):
        auth_header = authentication.get_authorization_header(request).split()

        if not auth_header:
            return None

        # Accept Bearer or Token keyword
        header_prefix = auth_header[0].decode('utf-8').lower()
        if header_prefix not in ('bearer', 'token'):
            return None

        if len(auth_header) == 1:
            raise exceptions.AuthenticationFailed('Invalid token header. No credentials provided.')
        elif len(auth_header) > 2:
            raise exceptions.AuthenticationFailed('Invalid token header. Token string should not contain spaces.')

        try:
            token_key = auth_header[1].decode('utf-8')
        except UnicodeError:
            raise exceptions.AuthenticationFailed('Invalid token header. Token string contains invalid characters.')

        try:
            token = AuthToken.objects.select_related('user').get(key=token_key)
        except AuthToken.DoesNotExist:
            raise exceptions.AuthenticationFailed('Invalid token or session expired.')

        if not token.user.is_active:
            raise exceptions.AuthenticationFailed('User account is disabled.')

        return (token.user, token)

    def authenticate_header(self, request):
        return self.keyword
