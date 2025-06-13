from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
from colorfield.fields import ColorField
from django.db.models import F, Q, UniqueConstraint
from django.forms import ValidationError

from django.contrib.auth import get_user_model

User = get_user_model()


class Label(models.Model):
    """Модель меток (labels) для  блюд."""

    name = models.CharField(
        max_length=200,
        verbose_name='Название метки'
    )
    color = ColorField(
        verbose_name='Цвет метки',
        format='hex',
        max_length=7
    )
    slug = models.SlugField(
        unique=True,
        verbose_name='Идентификатор метки (slug)'
    )

    class Meta:
        verbose_name = 'Метка'
        verbose_name_plural = 'Метки'

    def __str__(self):
        return f'{self.name}'


class Product(models.Model):
    """Модель продуктов (ингредиентов) для блюда."""

    name = models.CharField(
        max_length=200,
        verbose_name='Название продукта'
    )
    measurement_unit = models.CharField(
        max_length=200,
        verbose_name='Единица измерения'
    )

    class Meta:
        verbose_name = 'Продукт'
        verbose_name_plural = 'Продукты'

    def __str__(self):
        return f'{self.name}'


class Dish(models.Model):
    """Модель блюд."""

    labels = models.ManyToManyField(
        Label,
        related_name='dishes',
        verbose_name='Метка'
    )
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='dishes',
        verbose_name='Автор'
    )
    products = models.ManyToManyField(
        Product,
        through='ProductToDish',
        related_name='dishes',
        verbose_name='Продукт'
    )
    name = models.CharField(
        max_length=200,
        verbose_name='Название блюда'
    )
    image = models.ImageField(
        verbose_name='Изображение',
        upload_to='app/',
    )
    description = models.TextField(
        verbose_name='Описание'
    )
    cooking_time = models.PositiveSmallIntegerField(
        validators=[
            MinValueValidator(1, message='Минимум одна минута'),
            MaxValueValidator(1440, message='Не больше 24 часов'),
        ],
        verbose_name='Время приготовления (минуты)'
    )

    class Meta:
        ordering = ('-id', )
        verbose_name = 'Блюдо'
        verbose_name_plural = 'Блюда'

    def __str__(self):
        return f'{self.name} — автор: {self.author.get_username()}'


class ProductToDish(models.Model):
    """Связка блюда и продукта (ингредиента)."""

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        verbose_name='Продукт'
    )
    dish = models.ForeignKey(
        Dish,
        on_delete=models.CASCADE,
        related_name='producttodish',
        verbose_name='Блюдо'
    )
    amount = models.PositiveSmallIntegerField(
        validators=[
            MinValueValidator(1, message='Введите положительное число'),
        ],
        verbose_name='Количество'
    )

    class Meta:
        verbose_name = 'Связь блюда и продукта'
        verbose_name_plural = 'Связи блюд и продуктов'

    def __str__(self):
        return f'Связь продукта {self.product.name} и блюда: {self.dish.name}'


class Follow(models.Model):
    """Модель подписки на повара."""

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='follower',
        verbose_name='Подписчик'
    )
    chef = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='following',
        verbose_name='Повар'
    )

    class Meta:
        ordering = ('-id', )
        constraints = [
            UniqueConstraint(
                fields=('user', 'chef'),
                name='unique_follow'
            ),
            models.CheckConstraint(
                check=~Q(user=F('chef')),
                name='no_self_follow'
            )
        ]
        verbose_name = 'Подписка'
        verbose_name_plural = 'Подписки'

    def __str__(self):
        return f'Подписка {self.user.get_username()} на: {self.chef.get_username()}'

    def clean(self):
        if self.user == self.chef:
            raise ValidationError(
                'Нельзя подписаться на самого себя'
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)


class Bookmark(models.Model):
    """Модель добавления блюда в закладки."""

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        verbose_name='Пользователь',
        related_name='bookmarks',
    )
    dish = models.ForeignKey(
        Dish,
        on_delete=models.CASCADE,
        verbose_name='Блюдо',
        related_name='bookmarks',
    )

    class Meta:
        constraints = [
            UniqueConstraint(
                fields=('user', 'dish'),
                name='user_bookmark_unique'
            )
        ]
        verbose_name = 'Закладка'
        verbose_name_plural = 'Закладки'

    def __str__(self):
        return f'Блюдо {self.dish.name} в закладках пользователя: {self.user.get_username()}'


class Cart(models.Model):
    """Модель списка покупок пользователя."""

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        verbose_name='Пользователь',
        related_name='cart',
    )
    dish = models.ForeignKey(
        Dish,
        on_delete=models.CASCADE,
        verbose_name='Блюдо',
        related_name='cart',
    )

    class Meta:
        constraints = [
            UniqueConstraint(
                fields=('user', 'dish'),
                name='user_cart_unique'
            )
        ]
        verbose_name = 'Список покупок'
        verbose_name_plural = 'Списки покупок'

    def __str__(self):
        return f'Блюдо {self.dish.name} в списке покупок пользователя: {self.user.get_username()}'
