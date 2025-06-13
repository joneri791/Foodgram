from django_filters import rest_framework
from rest_framework.filters import SearchFilter
import django_filters

from .models import Dish, Label, Product

class ProductFilter(SearchFilter):
    """Специальный фильтр для продуктов"""

    search_param = 'name'

    class Meta:
        model = Product
        fields = ('name',)


class MyFilterSet(rest_framework.FilterSet):
    """Фильтр для блюд"""

    author = rest_framework.NumberFilter(field_name='author__id')
    labels = django_filters.ModelMultipleChoiceFilter(
        field_name='labels__slug',
        to_field_name='slug',
        queryset=Label.objects.all()
    )
    is_bookmarked = django_filters.NumberFilter(
        method='filter_is_bookmarked')
    is_in_cart = django_filters.NumberFilter(
        method='filter_cart')

    def filter_cart(self, qs, name, value):
        if value == 1:
            return qs.filter(cart__user=self.request.user)

    def filter_is_bookmarked(self, qs, name, value):
        if value == 1:
            return qs.filter(bookmarks__user=self.request.user)

    class Meta:
        model = Dish
        fields = ['author', 'labels', 'is_bookmarked', 'is_in_cart']
