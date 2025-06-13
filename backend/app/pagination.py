from rest_framework.pagination import PageNumberPagination

class CustomPagination(PageNumberPagination):
    """Класс формирования страниц для Dish API"""

    page_size = 10
    page_size_query_param = 'limit'
