from django.urls import include, path
from rest_framework import routers

from .views import LabelViewSet, DishViewSet, CartMixin, BookmarkMixin, ProductMixin

router_v1 = routers.DefaultRouter()
router_v1.register('labels', LabelViewSet)
router_v1.register('dishes', DishViewSet)
router_v1.register(
    r'dishes/(?P<dish_id>\d+)/cart',
    CartMixin,
    basename='cart'
)
router_v1.register(
    r'dishes/(?P<dish_id>\d+)/bookmark',
    BookmarkMixin,
    basename='bookmark'
)
router_v1.register(
    'products',
    ProductMixin,
    basename='products'
)

urlpatterns = [
    path('', include(router_v1.urls)),
]
