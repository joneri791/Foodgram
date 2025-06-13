from rest_framework import serializers
from drf_extra_fields.fields import Base64ImageField
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from .models import (
    Label, Dish, Product, Follow,
    ProductToDish, Cart, Bookmark
)
from users.serializers import CustomUserSerializer

User = get_user_model()


class ProductSerializer(serializers.ModelSerializer):
    """Сериализатор продуктов"""

    class Meta:
        model = Product
        fields = ('id', 'name', 'measurement_unit')


class LabelSerializer(serializers.ModelSerializer):
    """Сериализатор меток"""

    class Meta:
        model = Label
        fields = ('id', 'name', 'color', 'slug')


class ShortDishSerializer(serializers.ModelSerializer):
    """Краткий сериализатор для блюда"""

    class Meta:
        model = Dish
        fields = ('id', 'name', 'image', 'cooking_time')
        read_only_fields = ('id', 'name', 'image', 'cooking_time')


class CartSerializer(ShortDishSerializer):
    """Сериализатор добавления блюда в список покупок"""

    def validate(self, data):
        request = self.context.get('request', None)
        current_dish_id = self.context.get('request').parser_context.get(
            'kwargs').get('dish_id')
        dish = get_object_or_404(Dish, pk=current_dish_id)

        if Cart.objects.filter(
                user=request.user,
                dish=dish
        ).exists():
            raise serializers.ValidationError(
                'Блюдо уже в списке покупок')
        return data

    def create(self, validated_data):
        request = self.context.get('request', None)
        current_user = request.user
        current_dish_id = self.context.get('request').parser_context.get(
            'kwargs').get('dish_id')
        dish = get_object_or_404(Dish, pk=current_dish_id)
        Cart.objects.create(user=current_user, dish=dish)
        return dish


class BookmarkSerializer(ShortDishSerializer):
    """Сериализатор закладок"""

    def validate(self, data):
        request = self.context.get('request', None)
        current_dish_id = self.context.get('request').parser_context.get(
            'kwargs').get('dish_id')
        dish = get_object_or_404(Dish, pk=current_dish_id)

        if Bookmark.objects.filter(
                user=request.user,
                dish=dish
        ).exists():
            raise serializers.ValidationError(
                'Блюдо уже добавлено в закладки')
        return data

    def create(self, validated_data):
        request = self.context.get('request', None)
        current_user = request.user
        current_dish_id = self.context.get('request').parser_context.get(
            'kwargs').get('dish_id')
        dish = get_object_or_404(Dish, pk=current_dish_id)
        Bookmark.objects.create(user=current_user, dish=dish)
        return dish


class ProductToDishSerializer(serializers.ModelSerializer):
    """Сериализатор связи продукта и блюда"""

    id = serializers.IntegerField(
        source='product.id'
    )
    name = serializers.ReadOnlyField(
        source='product.name'
    )
    measurement_unit = serializers.ReadOnlyField(
        source='product.measurement_unit'
    )

    class Meta:
        model = ProductToDish
        fields = (
            'id',
            'amount',
            'name',
            'measurement_unit',
        )


class DishReadSerializer(serializers.ModelSerializer):
    """Сериализатор чтения блюда"""

    labels = serializers.SerializerMethodField()
    products = ProductToDishSerializer(
        many=True,
        source='producttodish'
    )
    author = CustomUserSerializer(read_only=True)
    image = Base64ImageField()
    is_bookmarked = serializers.SerializerMethodField()
    is_in_cart = serializers.SerializerMethodField()

    class Meta:
        model = Dish
        fields = (
            'id',
            'labels',
            'author',
            'products',
            'is_bookmarked',
            'is_in_cart',
            'name',
            'image',
            'description',
            'cooking_time',
        )
    read_only_fields = ('id', 'author', 'is_bookmarked', 'is_in_cart')

    def get_labels(self, obj):
        return LabelSerializer(
            Label.objects.filter(dishes=obj),
            many=True,
        ).data

    def get_is_in_cart(self, obj):
        request = self.context.get('request', None)
        current_user = request.user if request else None
        return Cart.objects.filter(
            user=current_user.id,
            dish=obj.id,
        ).exists()

    def get_is_bookmarked(self, obj):
        request = self.context.get('request', None)
        current_user = request.user if request else None
        return Bookmark.objects.filter(
            user=current_user.id,
            dish=obj.id
        ).exists()


class DishCreateSerializer(serializers.ModelSerializer):
    """Сериализатор создания блюда"""

    labels = serializers.PrimaryKeyRelatedField(
        queryset=Label.objects.all(),
        many=True
    )
    products = ProductToDishSerializer(
        many=True,
        source='producttodish'
    )
    image = Base64ImageField()

    class Meta:
        model = Dish
        fields = (
            'labels',
            'products',
            'name',
            'image',
            'description',
            'cooking_time',
        )

    def validate(self, data):
        request = self.context.get('request', None)
        label_ids = []
        product_ids = []
        request_methods = ['POST', 'PATCH']

        if request.method in request_methods:
            if 'labels' in data:
                labels = data['labels']

                for label in labels:
                    if label.id in label_ids:
                        raise serializers.ValidationError(
                            f'Метка {label} повторяется')
                    label_ids.append(label.id)

                if len(label_ids) == 0:
                    raise serializers.ValidationError(
                        'Список меток не должен быть пустым')

                all_labels = Label.objects.all().values_list('id', flat=True)
                if not set(label_ids).issubset(all_labels):
                    raise serializers.ValidationError(
                        f'Метки {label} не существует')

            if 'producttodish' in data:
                products = data['producttodish']
                for product in products:
                    product_id = product['product'].get('id')

                    if product_id in product_ids:
                        raise serializers.ValidationError(
                            f'Продукт {product_id} повторяется')
                    product_ids.append(product_id)

                all_products = Product.objects.all().values_list('id', flat=True)

                if not set(product_ids).issubset(all_products):
                    raise serializers.ValidationError(
                        'Указанного продукта не существует')

                if len(product_ids) == 0:
                    raise serializers.ValidationError(
                        'Список продуктов не должен быть пустым')
        return data

    @staticmethod
    def create_products(dish, products):
        product_list = []
        for product_data in products:
            product_obj = Product.objects.get(
                id=product_data.get('product')['id'])
            product_list.append(
                ProductToDish(
                    product=product_obj,
                    amount=product_data.get('amount'),
                    dish=dish,
                )
            )
        ProductToDish.objects.bulk_create(product_list)

    def create(self, validated_data):
        request = self.context.get('request', None)
        labels = validated_data.pop('labels')
        products = validated_data.pop('producttodish')
        dish = Dish.objects.create(author=request.user, **validated_data)
        dish.labels.set(labels)
        self.create_products(dish, products)
        return dish

    def update(self, instance, validated_data):
        instance.labels.clear()
        ProductToDish.objects.filter(dish=instance).delete()
        instance.labels.set(validated_data.pop('labels'))
        products = validated_data.pop('producttodish')
        self.create_products(instance, products)
        return super().update(instance, validated_data)

    def to_representation(self, instance):
        return DishReadSerializer(instance, context={
            'request': self.context.get('request')
        }).data


class FollowSerializer(CustomUserSerializer):
    """Сериализатор подписок"""

    dishes = serializers.SerializerMethodField(read_only=True)
    dishes_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = (
            'email',
            'id',
            'username',
            'first_name',
            'last_name',
            'is_subscribed',
            'dishes',
            'dishes_count'
        )
        read_only_fields = (
            'email',
            'username',
            'first_name',
            'last_name',
            'is_subscribed',
            'dishes',
            'dishes_count'
        )

    def get_dishes(self, obj):
        limit = self.context.get('request').query_params.get('dishes_limit')
        if limit:
            queryset = Dish.objects.filter(
                author=obj).order_by('-id')[:int(limit)]
        else:
            queryset = Dish.objects.filter(author=obj)

        return ShortDishSerializer(queryset, many=True).data

    def get_dishes_count(self, obj):
        return Dish.objects.filter(author=obj).count()

    def create(self, validated_data):
        request = self.context.get('request', None)
        chef_id = self.context.get('request').parser_context.get(
            'kwargs').get('user_id')

        current_user = request.user
        chef = get_object_or_404(User, pk=chef_id)
        Follow.objects.create(user=current_user, chef=chef)
        return chef
