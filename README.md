# Ландинг для иностранных абитуриентов КубГАУ

## Установка

### Требования к установке
- [Node.js](https://nodejs.org/en/) (версия 14 или выше)
- [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable) (Аналог NPM)
- [Optimizt](https://github.com/funbox/optimizt) (Опционально – для сжатия картинок)

### Запуск установки
```bash
yarn install
```

## Запуск

### Запуск в режиме разработки
```bash
yarn start
```

### Сборка
```bash
yarn build
```

## Работа со счётчиком
Целевая дата счётчика находится в файле master.ts. Формат при установке новой даты необходимо соблюдать
```typescript
249 let endDate = new Date("July 30, 2024"); // Целевая дата
```

## Работа с back-end
В рамках работы сайта предусмотрена заглушка. Чтобы шёл запрос к backend нужно указать свойство __action__ для формы.

### index.html
```html
<!-- index.html -->
<form class="row flex row-center center-align" id="subscribe" action="/path/to/backend/">
	…
```

### master.ts
Результат работы backend обрабатывается внутри функции Success Ajax-запроса, которая находится в функции Subscribe (файл **master.ts**, строки **112-140**)

```typescript
/**
 * Отправка формы подписки
 */
function subscribe(e:JQuery.SubmitEvent){
	e.preventDefault();
	let form = <HTMLFormElement>e.currentTarget;
	let action = form.attributes['action'];

	// Если указан атрибут action, то делаем запрос на сервер
	if(action){
		let data = $(form).serialize();
		$.ajax({
			url: action,
			type: 'POST',
			dataType: "json",
			success: (response:any)=>{
				// Callback при успешной отправке формы
			},
			error: (error:any) => {
				// Callback при ошибке отправки формы
			}
		})
	}else{
		// Иначе возвращаем заглушку (сообщение об успешной отправке формы)
		M.toast({"html": "Спасибо за ваш интерес к нашему университету! Мы обязательно уведомим Вас о начале приёма документов!"})
	}

	form.reset();
}
```