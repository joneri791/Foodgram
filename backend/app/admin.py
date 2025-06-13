from django.contrib import admin

from .models import (
    Follow, Label, Product, Dish, ProductToDish,
    Bookmark, Cart
)

class ProductInline(admin.TabularInline):
    model = ProductToDish
    extra = 3

class DishAdmin(admin.ModelAdmin):
    list_display = ('author', 'name', 'cooking_time')
    search_fields = ('name', 'author', 'labels')
    list_filter = ('author', 'name', 'labels')
    inlines = (ProductInline,)

class FollowAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'chef',
    )
    empty_value_display = '-пусто-'

class LabelAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'color',
        'slug',
    )
    empty_value_display = '-пусто-'

class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'measurement_unit',
    )
    search_fields = ('name',)
    empty_value_display = '-пусто-'

class ProductToDishAdmin(admin.ModelAdmin):
    list_display = (
        'product',
        'dish',
        'amount',
    )
    empty_value_display = '-пусто-'

class BookmarkAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'dish',
    )
    empty_value_display = '-пусто-'

class CartAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'dish',
    )
    empty_value_display = '-пусто-'

admin.site.register(Follow, FollowAdmin)
admin.site.register(Label, LabelAdmin)
admin.site.register(Product, ProductAdmin)
admin.site.register(Dish, DishAdmin)
admin.site.register(ProductToDish, ProductToDishAdmin)
admin.site.register(Bookmark, BookmarkAdmin)
admin.site.register(Cart, CartAdmin)
