import * as M from 'materialize-css';
import Lazy from 'vanilla-lazyload';
import mustache from 'mustache';
import { template } from './lib/template';
import { IDiapasone } from './lib/interfaces';
import TinyMasonry from './lib/masonry';
import IMask from 'imask';
import MouseParallax, { IParallaxOptions } from './lib/mouseparallax';
import TinyParallax from './lib/tinyparallax';
import Zoomer, { IZoomerOptions } from './lib/zoomer';

declare const ymaps:any; // Переменная для хранения Яндекс-карт

/**
 * Инициализация
 */
document.addEventListener('DOMContentLoaded', function() {

	// Zoomer
	let zoomeroptions:IZoomerOptions = {
		selector: '.gallery-image',
		src: 'src',
		isDataSet: true
	}

	new Zoomer(zoomeroptions);

	// Параллакс на календаре событий
	let calendarParallax = new TinyParallax({
		selector: '.parallax'
	});

	// Параллакс по движению мыши
	let options:IParallaxOptions = {
		wrapper: '.parallax-wrapper',
		layers: '.level',
		sensitivity: 12,
		depthAttribute: 'depth'
	}
	const parallax = new MouseParallax(options);

	// Маска для телефона
	IMask(<HTMLElement>document.querySelector('[name="phone"]'), {
        mask: '+{7} (000) 000-00-00', 
    });

	// Запуск обратного отсчёта
	startCounter();
	setInterval(startCounter, 1000);

	// Боковая панель навигации
	let sidenav = M.Sidenav.init(document.querySelectorAll('.sidenav'), {
		edge: 'right'
	});

	// «Ленивые» картинки
	new Lazy(null, document.querySelectorAll('.lazy'));

	// Подгрузка событий и генерация календаря при загрузке страницы
	fetch('/data/events.json')
		.then(res => res.json())
		.then((data:IDiapasone) => {
			let output = mustache.render(template, data);
			document.querySelector('.calendar-wrapper').innerHTML = output;
		})

	// Плиточное расположение галереи
	new TinyMasonry({
		containerSelector: '.masonry-container',
		itemSelector: '.gallery-image',
		columnCount: 4,
		breakpoints: [
			{
				maxWidth: 2000,
				columnCount: 4
			},
			{
				maxWidth: 1600,
				columnCount: 3
			},
			{
				maxWidth: 900,
				columnCount: 2
			},
			{
				maxWidth: 400,
				columnCount: 1
			},
		]
	})

	// Инициализация карты
	loadScript("https://api-maps.yandex.ru/2.1/?lang=ru_RU", () => {
		ymaps.ready(() => {
			initMap();
		});
	});

	$('body').on('click', '.scroll-link', scrollTo);
	$('body').on('mouseenter', '#faculties li a', setImage);
	$('body').on('submit', '#subscribe', subscribe);

	document.querySelectorAll('section').forEach((section:HTMLElement) => {
		let observer = new IntersectionObserver(intersect, {
			root: null, // viewport
			threshold: 0.5 // when the element is half visible
		});
		observer.observe(section);
	})
});

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

/**
 * Установка изображения в зависимости от факультета при наведении мыши
 */
function setImage(e:JQuery.MouseEnterEvent){
	let el:HTMLElement = e.currentTarget;
	let list = <HTMLElement>$(el).parents('ul')[0];
	let image = list.dataset['faculty'];

	let desktopImage = <HTMLImageElement>document.querySelector('#faculty-image');
	let tabletImage = <HTMLImageElement>document.querySelector('#faculty-tablet-image');

	desktopImage.src = `/img/${image}.jpg`;
	tabletImage.src=`/img/${image}-tablet.jpg`;
}

/**
 * Обработка пересечений
 * @param {IntersectionObserverEntry[]} entries Список пересечений
 * @param {IntersectionObserver} observer Прослушиватель пересечений
 */
function intersect(entries:IntersectionObserverEntry[], observer:IntersectionObserver) {
	let header = <HTMLElement>document.querySelector('header');
	
	entries.forEach((entry:IntersectionObserverEntry) => {
		if (entry.isIntersecting){
			let id = (<HTMLElement>entry.target).id;
			let link = header.querySelector(`[href="#${id}"]`);
			link?.classList.add('active');
		}else{
			let id = (<HTMLElement>entry.target).id;
			let link = header.querySelector(`[href="#${id}"]`);
			link?.classList.remove('active');
		}
	});
}

/**
 * Прокрутка до анкора, указанного в ссылке
 */
function scrollTo(e:JQuery.ClickEvent){
	e.preventDefault();
	let el = <HTMLLinkElement>e.currentTarget;
	let link = new URL(el.href);
	let hash = link.hash;

	let target:string;

	if(hash == "#hero"){
		target = '0';
	}else{
		target = $(hash).offset().top - $('header').height() + 'px'
	}

	if (hash) $('html, body').animate({
		scrollTop: target
	}, 400);

	let sidenavEl = document.querySelector('.sidenav');
	let sidenav = M.Sidenav.getInstance(sidenavEl);
	sidenav.close();
}

/**
 * Запуск счётчика
 */
function startCounter(){
	let currentDate = new Date(); // Текущая дата
	let endDate = new Date("July 30, 2024"); // Целевая дата
	// Расчитываем разницу между текущей и целевой датой
	var timeDiff = Math.abs(endDate.getTime() - currentDate.getTime());
	// Вычисляем количество дней, часов, минут и секунд до достижения цели
	var days = Math.floor(timeDiff / (1000 * 3600 * 24));
	var hours = Math.floor((timeDiff % (1000 * 3600 * 24)) / (1000 * 3600));
	var minutes = Math.floor((timeDiff % (1000 * 3600)) / 60000);
	var seconds = Math.floor((timeDiff % 60000) / 1000);

	let daysEl = <HTMLElement>document.querySelector('#d');
	let hoursEl = <HTMLElement>document.querySelector('#h');
	let minutesEl = <HTMLElement>document.querySelector('#m');
	let secondsEl = <HTMLElement>document.querySelector('#s');

	daysEl.textContent = addZero(days);
	hoursEl.textContent = addZero(hours);
	minutesEl.textContent = addZero(minutes);
	secondsEl.textContent = addZero(seconds);
}

/**
 * Добавление «лидирующего» нуля
 * @param {number} n - Число, к которому нужмо применить лидирующий нуль
 * @returns {string} Строка с лидирующим нулем или без него
 */
function addZero(n: number): string {
	return n > 9 ? "" + n : "0" + n;
}

/**
 * Подгрузка скрипта
 * @param {string} url Адрес скрипта
 * @param {void} callback Обработчик, запускаемый по окончании загрузки
 */
function loadScript(url:string, callback:()=>any){
	let script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = url;
	script.onload = callback;
	document.body.appendChild(script);

	if((script as any).readyState){ //IE
		(script as any).onreadystatechange = function(){
			if((script as any).readyState === "loaded" || (script as any).readyState === "complete"){
				(script as any).onreadystatechange = null;
				callback();
			}
		}
	}else{
		script.onload = callback;
	}

	script.src = url;
	document.getElementsByTagName("head")[0].appendChild(script);
}

/**
 * Инициализация карты
 */
function initMap(){

	let mapEl = <HTMLElement>document.querySelector('#map');
	let coordsStr = mapEl.dataset['lonlat']?.split(", ");
	if(!coordsStr) return;

	let address = mapEl.dataset['address'];
	let link = mapEl.dataset['link'];

	// Получаем координаты центра карты из атрибутов элемента #map
	let center = [parseFloat(coordsStr[0]), parseFloat(coordsStr[1])];
	let zoom = Number(mapEl.dataset['zoom']) ?? 15;

	// Инициализация карты
	let map = new ymaps.Map('map', {
		center: center,
		zoom: zoom,
		controls: ['smallMapDefaultSet']
	});

	// Отключаем Zoom на колёсике мыши
	map.behaviors.disable('scrollZoom');

	//  Добавляем маркер с расположением университета
	let placeMark = new ymaps.Placemark(center, {}, {iconColor: 'red'});
	map.geoObjects.add(placeMark);

	// По клику переходим на Яндекс-карты
	placeMark.events.add('click', function (e) {
		window.open(link, '_blank');
	});

	let balloonText = `<a class="link-map" href="${link}" target="blank" class="balloon-link">${address}</a>`;

	// Открываем балун с адресом
	map.balloon.open(center, balloonText, {
		offset: [0, -50]
	});

}