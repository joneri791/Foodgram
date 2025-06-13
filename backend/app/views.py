from django.db.models import Sum
from django.http.response import HttpResponse
from rest_framework import mixins, viewsets
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework import permissions

from .models import Label, Dish, Cart, Bookmark, Product, ProductToDish
from .serializers import (
    DishCreateSerializer, CartSerializer,
    BookmarkSerializer, ProductSerializer, LabelSerializer,
    DishReadSerializer
)
from .permissions import AuthorIsRequestUserPermission
from .filters import MyFilterSet, ProductFilter
from .pagination import CustomPagination

User = get_user_model()


class ProductMixin(viewsets.ReadOnlyModelViewSet):
    """Отображение одного продукта или списка"""

    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = (DjangoFilterBackend, filters.SearchFilter)
    filter_backends = (ProductFilter, )
    search_fields = ('^name', )


class CartMixin(
    mixins.DestroyModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet
):
    """Создание и удаление объекта списка покупок"""

    queryset = Dish.objects.all()
    serializer_class = CartSerializer
    permission_classes = (permissions.IsAuthenticated, )

    def delete(self, request, *args, **kwargs):
        dish_id = self.kwargs.get('dish_id')
        dish = get_object_or_404(Dish, pk=dish_id)

        instance = Cart.objects.filter(
            user=request.user, dish=dish)

        if not instance:
            raise serializers.ValidationError(
                'В корзине нет данного блюда'
            )
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


class BookmarkMixin(
    mixins.DestroyModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet
):
    """Создание и удаление объекта закладок"""

    queryset = Dish.objects.all()
    serializer_class = BookmarkSerializer
    permission_classes = (permissions.IsAuthenticated, )

    def delete(self, request, *args, **kwargs):
        dish_id = self.kwargs.get('dish_id')
        dish = get_object_or_404(Dish, pk=dish_id)

        instance = Bookmark.objects.filter(
            user=request.user, dish=dish)

        if not instance:
            raise serializers.ValidationError(
                'В закладках нет данного блюда'
            )
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


class LabelViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet
):
    """Отображение одной метки или списка"""

    queryset = Label.objects.all()
    serializer_class = LabelSerializer


class DishViewSet(viewsets.ModelViewSet):
    """Отображение и создание блюд"""

    permission_classes = (AuthorIsRequestUserPermission, )
    queryset = Dish.objects.all()
    serializer_class = DishCreateSerializer
    filter_class = MyFilterSet
    pagination_class = CustomPagination

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return DishReadSerializer
        return DishCreateSerializer

    @staticmethod
    def send_message(products):
        """
        Посылает сообщение дублирующее скачиваемый список
        """
        shopping_list = 'Купить в магазине:'
        for product in products:
            shopping_list += (
                f"\n{product['product__name']} "
                f"({product['product__measurement_unit']}) - "
                f"{product['amount']}")
        file = 'shopping_list.txt'
        response = HttpResponse(shopping_list, content_type='text/plain')
        response['Content-Disposition'] = f'attachment; filename="{file}.txt"'
        return response

    @action(detail=False, methods=['GET'])
    def download_cart(self, request):
        """
        Скачивает список покупок
        """
        products = ProductToDish.objects.filter(
            dish__cart__user=request.user
        ).order_by('product__name').values(
            'product__name', 'product__measurement_unit'
        ).annotate(amount=Sum('amount'))
        return self.send_message(products)
