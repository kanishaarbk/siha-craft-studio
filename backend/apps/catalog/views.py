from django.db.models import Q
from rest_framework import views, status, permissions
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from .models import Category, Product, Review
from .serializers import CategorySerializer, ProductListSerializer, ProductDetailSerializer, ReviewSerializer


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 100


class CategoryListView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        categories = Category.objects.filter(is_active=True).order_by('order', 'name')
        return Response(CategorySerializer(categories, many=True).data)


class ProductListView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        queryset = Product.objects.filter(is_active=True).select_related('category').prefetch_related('variants', 'images')

        # Category filter (by slug or id)
        cat_param = request.query_params.get('category')
        if cat_param:
            queryset = queryset.filter(Q(category__slug=cat_param) | Q(category__id__iexact=cat_param))

        # Search query
        search_query = request.query_params.get('search')
        if search_query:
            q = search_query.strip()
            queryset = queryset.filter(
                Q(name__icontains=q) |
                Q(description__icontains=q) |
                Q(short_description__icontains=q) |
                Q(material__icontains=q) |
                Q(category__name__icontains=q) |
                Q(sku__icontains=q)
            )

        # Price range filter
        min_price = request.query_params.get('min_price')
        if min_price:
            try:
                queryset = queryset.filter(price__gte=float(min_price))
            except ValueError:
                pass

        max_price = request.query_params.get('max_price')
        if max_price:
            try:
                queryset = queryset.filter(price__lte=float(max_price))
            except ValueError:
                pass

        # In stock filter
        in_stock = request.query_params.get('in_stock')
        if in_stock and in_stock.lower() in ('true', '1'):
            queryset = queryset.filter(inventory__quantity__gt=0)

        # Featured filter
        featured = request.query_params.get('featured')
        if featured and featured.lower() in ('true', '1'):
            queryset = queryset.filter(is_featured=True)

        # Sorting
        sort_by = request.query_params.get('ordering', request.query_params.get('sort', 'newest'))
        if sort_by == 'price_low':
            queryset = queryset.order_by('price')
        elif sort_by == 'price_high':
            queryset = queryset.order_by('-price')
        elif sort_by == 'name':
            queryset = queryset.order_by('name')
        elif sort_by == 'popularity':
            queryset = queryset.order_by('-is_featured', '-created_at')
        else:
            queryset = queryset.order_by('-created_at')

        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = ProductListSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class ProductDetailView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug_or_id):
        try:
            if slug_or_id.isdigit():
                product = Product.objects.get(id=int(slug_or_id), is_active=True)
            else:
                product = Product.objects.get(slug=slug_or_id, is_active=True)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProductDetailSerializer(product)
        return Response(serializer.data)


class ProductReviewsView(views.APIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get(self, request, product_id):
        reviews = Review.objects.filter(product_id=product_id, is_approved=True).order_by('-created_at')
        return Response(ReviewSerializer(reviews, many=True).data)

    def post(self, request, product_id):
        try:
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        rating = request.data.get('rating')
        headline = request.data.get('headline', '').strip()
        comment = request.data.get('comment', '').strip()

        if not rating or not headline or not comment:
            return Response({'error': 'Rating, headline, and comment are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if user has purchased this product
        has_purchased = request.user.orders.filter(
            items__product=product,
            payment_status='PAID'
        ).exists()

        review = Review.objects.create(
            product=product,
            user=request.user,
            rating=int(rating),
            headline=headline,
            comment=comment,
            is_verified_purchase=has_purchased,
            # Auto-approve for demo/verified customers or queue for admin moderation
            is_approved=True
        )

        return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED)
