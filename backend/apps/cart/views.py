import secrets
import traceback
from rest_framework import views, status, permissions
from rest_framework.response import Response
from .models import Cart, CartItem, Wishlist, WishlistItem
from .serializers import CartSerializer, WishlistItemSerializer
from catalog.models import Product, ProductVariant


def get_cart_for_request(request):
    session_key = None
    # 1. Safely extract session_key from query_params (standard for GET/DELETE)
    if hasattr(request, 'query_params'):
        session_key = request.query_params.get('session_key')
    # 2. If not in query_params and not GET/HEAD, safely check request.data (for POST/PUT)
    if not session_key and request.method not in ('GET', 'HEAD'):
        try:
            if hasattr(request, 'data') and isinstance(request.data, dict):
                session_key = request.data.get('session_key')
        except Exception:
            pass

    if request.user and request.user.is_authenticated:
        # Use filter().order_by().first() to strictly avoid MultipleObjectsReturned
        cart = Cart.objects.filter(user=request.user).order_by('-updated_at').first()
        if not cart:
            cart = Cart.objects.create(user=request.user)
        # If guest session provided, merge items
        if session_key:
            guest_carts = Cart.objects.filter(session_key=session_key).exclude(id=cart.id)
            for guest_cart in guest_carts:
                for gitem in guest_cart.items.all():
                    citem = cart.items.filter(product=gitem.product, variant=gitem.variant).first()
                    if citem:
                        citem.quantity += gitem.quantity
                        citem.save()
                    else:
                        gitem.cart = cart
                        gitem.save()
                guest_cart.delete()
        return cart
    else:
        if not session_key or not isinstance(session_key, str) or len(session_key.strip()) == 0:
            session_key = 'guest_' + secrets.token_hex(12)
        else:
            session_key = session_key.strip()
        # Use filter().order_by().first() to strictly avoid MultipleObjectsReturned
        cart = Cart.objects.filter(session_key=session_key).order_by('-updated_at').first()
        if not cart:
            cart = Cart.objects.create(session_key=session_key)
        return cart


class CartDetailView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            cart = get_cart_for_request(request)
            serializer = CartSerializer(cart)
            data = serializer.data
            data['session_key'] = cart.session_key
            return Response(data)
        except Exception as e:
            return Response({
                'error': f'Failed to retrieve cart: {str(e)}',
                'traceback': traceback.format_exc()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CartAddItemView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            cart = get_cart_for_request(request)
            product_id = request.data.get('product_id')
            variant_id = request.data.get('variant_id')
            try:
                quantity = int(request.data.get('quantity', 1))
            except (ValueError, TypeError):
                quantity = 1

            if not product_id or quantity <= 0:
                return Response({'error': 'Valid product_id and positive quantity are required.'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                product = Product.objects.get(id=product_id, is_active=True)
            except Product.DoesNotExist:
                return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

            variant = None
            if variant_id:
                try:
                    variant = ProductVariant.objects.get(id=variant_id, product=product, is_active=True)
                except ProductVariant.DoesNotExist:
                    return Response({'error': 'Selected variant not found.'}, status=status.HTTP_404_NOT_FOUND)

            # Stock check
            available = variant.stock if variant else product.total_stock
            existing_item = cart.items.filter(product=product, variant=variant).first()
            target_qty = (existing_item.quantity if existing_item else 0) + quantity

            if available is not None and available > 0 and target_qty > available:
                return Response({
                    'error': f'Only {available} items available in stock. Cannot add {target_qty}.'
                }, status=status.HTTP_400_BAD_REQUEST)

            if existing_item:
                existing_item.quantity = target_qty
                existing_item.save()
            else:
                CartItem.objects.create(
                    cart=cart,
                    product=product,
                    variant=variant,
                    quantity=quantity
                )

            serializer = CartSerializer(cart)
            data = serializer.data
            data['session_key'] = cart.session_key
            return Response({
                'message': f'"{product.name}" added to cart.',
                'cart': data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': f'Failed to add item to cart: {str(e)}',
                'traceback': traceback.format_exc()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CartUpdateItemView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def put(self, request, item_id):
        try:
            cart = get_cart_for_request(request)
            try:
                item = cart.items.get(id=item_id)
            except CartItem.DoesNotExist:
                return Response({'error': 'Item not found in cart.'}, status=status.HTTP_404_NOT_FOUND)

            try:
                quantity = int(request.data.get('quantity', 1))
            except (ValueError, TypeError):
                quantity = 1

            if quantity <= 0:
                item.delete()
                return Response({
                    'message': 'Item removed from cart.',
                    'cart': CartSerializer(cart).data
                })

            available = item.variant.stock if item.variant else item.product.total_stock
            if available is not None and available > 0 and quantity > available:
                return Response({
                    'error': f'Only {available} items available in stock.'
                }, status=status.HTTP_400_BAD_REQUEST)

            item.quantity = quantity
            item.save()
            return Response({
                'message': 'Quantity updated.',
                'cart': CartSerializer(cart).data
            })
        except Exception as e:
            return Response({
                'error': f'Failed to update item: {str(e)}',
                'traceback': traceback.format_exc()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CartRemoveItemView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def delete(self, request, item_id):
        try:
            cart = get_cart_for_request(request)
            try:
                item = cart.items.get(id=item_id)
                item.delete()
                return Response({
                    'message': 'Item removed from cart.',
                    'cart': CartSerializer(cart).data
                })
            except CartItem.DoesNotExist:
                return Response({'error': 'Item not found in cart.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': f'Failed to remove item: {str(e)}',
                'traceback': traceback.format_exc()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CartMergeView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        session_key = request.data.get('session_key')
        cart = get_cart_for_request(request)
        return Response({
            'message': 'Cart synchronized successfully.',
            'cart': CartSerializer(cart).data
        })


class WishlistView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        items = wishlist.items.select_related('product__category').all()
        return Response(WishlistItemSerializer(items, many=True).data)

    def post(self, request):
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({'error': 'product_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        existing = wishlist.items.filter(product=product).first()
        if existing:
            existing.delete()
            return Response({'action': 'removed', 'message': f'"{product.name}" removed from wishlist.'})
        else:
            WishlistItem.objects.create(wishlist=wishlist, product=product)
            return Response({'action': 'added', 'message': f'"{product.name}" added to wishlist.'})
