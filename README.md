### Опиание проекта.
Сайт Foodgram, «Продуктовый помощник». Это онлайн-сервис и API для него. На этом сервисе пользователи могут публиковать рецепты, подписываться на публикации других пользователей, добавлять понравившиеся рецепты в список «Избранное», а перед походом в магазин скачивать сводный список продуктов, необходимых для приготовления одного или нескольких выбранных блюд.

## Проект доступен по ссылке:

```
- http://84.201.167.114
```

Foodgram - проект позволяет:

- Просматривать рецепты
- Добавлять рецепты в избранное
- Добавлять рецепты в список покупок
- Создавать, удалять и редактировать собственные рецепты
- Скачивать список покупок

## Инструкции по установке
***- Клонируйте репозиторий:***
```
git clone https://github.com/RussianPostman/foodgram-project-react.git
```

***- Установите и активируйте виртуальное окружение:***
- для MacOS
```
python3 -m venv venv
source venv/bin/activate
```
- для Windows
```
python -m venv venv
source venv/Scripts/activate
```

***- Установите зависимости из файла requirements.txt:***
```
pip install -r requirements.txt
```

***- Примените миграции:***
```
python manage.py migrate
```

***- В папке с файлом manage.py выполните команду для запуска локально:***
```
python manage.py runserver
```
***- Локально Документация доступна по адресу:***
```
http://127.0.0.1/api/docs/
```

### Собираем контейнерыы:

Из папки infra/ разверните контейнеры при помощи docker-compose:
```
docker-compose up -d --build
```
Выполните миграции:
```
docker-compose exec backend python manage.py migrate
```
Создайте суперпользователя:
```
winpty docker-compose exec backend python manage.py createsuperuser
```
Соберите статику:
```
docker-compose exec backend python manage.py collectstatic --no-input
```
Наполните базу данных ингредиентами и тегами. Выполняйте команду из дериктории где находится файл manage.py:
```
docker-compose exec backend python manage.py load_data

```
Остановка проекта:
```
docker-compose down
```

### Подготовка к запуску проекта на удаленном сервере

Cоздать и заполнить .env файл в директории infra
```
DB_ENGINE=django.db.backends.postgresql
DB_NAME=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
DB_HOST=db
DB_PORT=5432
TOKEN=252132607137
ALLOWED_HOSTS=*
```

### Примеры запросов:

**`POST` | Создание рецепта: `http://127.0.0.1:8000/api/Dishs/`**

Request:
```
{
  "Products": [
    {
      "id": 1123,
      "amount": 10
    }
  ],
  "Labels": [
    1,
    2
  ],
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAgMAAABieywaAAAACVBMVEUAAAD///9fX1/S0ecCAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAACklEQVQImWNoAAAAggCByxOyYQAAAABJRU5ErkJggg==",
  "name": "string",
  "text": "string",
  "cooking_time": 1
}
```
Response:
```
{
  "id": 0,
  "Labels": [
    {
      "id": 0,
      "name": "Завтрак",
      "color": "#E26C2D",
      "slug": "breakfast"
    }
  ],
  "author": {
    "email": "user@example.com",
    "id": 0,
    "username": "string",
    "first_name": "Вася",
    "last_name": "Пупкин",
    "is_subscribed": false
  },
  "Products": [
    {
      "id": 0,
      "name": "Картофель отварной",
      "measurement_unit": "г",
      "amount": 1
    }
  ],
  "is_Bookmarkd": true,
  "is_in_cart": true,
  "name": "string",
  "image": "http://foodgram.example.org/media/Dishs/images/image.jpeg",
  "text": "string",
  "cooking_time": 1
}
```

**`POST` | Подписаться на пользователя: `http://127.0.0.1:8000/api/users/{id}/subscribe/`**

Response:
```
{
  "email": "user@example.com",
  "id": 0,
  "username": "string",
  "first_name": "Вася",
  "last_name": "Пупкин",
  "is_subscribed": true,
  "Dishs": [
    {
      "id": 0,
      "name": "string",
      "image": "http://foodgram.example.org/media/Dishs/images/image.jpeg",
      "cooking_time": 1
    }
  ],
  "Dishs_count": 0
}
```


