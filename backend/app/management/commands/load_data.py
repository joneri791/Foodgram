import json
from django.core.management.base import BaseCommand

from app.models import Product, Label

class Command(BaseCommand):
    help = 'Загрузить данные в модель продуктов и меток'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('Старт команды загрузки данных'))
        with open('data/products.json', encoding='utf-8') as data_file_products:
            product_data = json.loads(data_file_products.read())
            for product in product_data:
                Product.objects.get_or_create(**product)

        with open('data/labels.json', encoding='utf-8') as data_file_labels:
            label_data = json.loads(data_file_labels.read())
            for label in label_data:
                Label.objects.get_or_create(**label)

        self.stdout.write(self.style.SUCCESS('Данные успешно загружены'))
