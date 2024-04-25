import KeyboardEventHelper from "./modules/keyboard";
/**
 * Настройки Zoomer
 */
export interface IZoomerOptions{
	/** 
	 * @param {string} selector CSS селектор, к которому будет применён класс 
	 * */
	selector:string,
	/**
	 * @param {string} src Название атрибута для чтения параметра SRC
	 */
	src:string,
	/**
	 * @param {boolean} isDataSet Определяет использовать ли data-атрибут
	 * */
	isDataSet: boolean,
	/**
	 * @param {number} [removeTimeout=600] Задержка перед удалением модального окна из DOM
	 */
	removeTimeout?: number,
}
/**
 * Увеличение изображений по клику
 */
export default class Zoomer{
	/** @param {NodeListOf<HTMLElement>} elements Коллекция элементов для увеличения */
	public elements: NodeListOf<HTMLElement>;
	/** @param {Array<string>} sources Коллекция параметров src для изображений */
	public sources: string[] = [];
	/** @param {Array<number>} indexes Коллекция индексов изображений */
	public indexes: number[] = [];
	/** @param {HTMLElement} modal Модальное окно с увеличенным изображением */
	private modal:HTMLElement | null;
	/** @param {number} Индекс текущего слайда */
	public currentIndex: number = -1;
	/** @param {number} [removeTimeout=600] Задержка перед удалением модального окна из DOM  */
	public removeTimeout: number = 600;
	/** @param {number} slideWidth Ширина слайда */
	private slideWidth: number;
	/** @param {boolean} isAnimating Определяет, запущена ли анимация перехода */
	private isAnimating:boolean = false;
	/** @param {boolean} isDragging Определяет, осуществляелся ли перетаскивание слайда */
	private isDragging:boolean = false;
	/** @param {number} dragStartX Начальная позиция при перетаскивании */
	private dragStartX: number;
	/** @param {number} dragOffset Текущая позиция перетаскивания */
	private dragOffset: number;
	/** @param {HTMLDivElement} wrapper Оболочка слайдера */
	public wrapper:HTMLDivElement;
	/**
	 * Инициализация класса
	 * @param {IZoomerOptions} options - настройки класса
	 */
	public constructor(options:IZoomerOptions){
		new KeyboardEventHelper(this);
		this.elements = document.querySelectorAll(options.selector) as NodeListOf<HTMLElement>;
		this.removeTimeout ?? options.removeTimeout;
		for (let i:number=0; i < this.elements.length; i++){
			let el = this.elements[i];
			this.indexes.push(i);
			if(options.isDataSet){
				this.sources.push(el.dataset[options.src || 'src']);
			}else{
				this.sources.push(el.getAttribute(options.src || 'src'));
			}
			el.setAttribute('data-index', i.toString());
			
			el.addEventListener('click', this.open.bind(this));
		}
	}
	/**
	 * Получение коллекции обработчиков клавиатуры
	 */
	private static get keyboardeventhelpers():any[] {
		return (window as any).__keyboardeventhandlers || [];
	}
	/**
	 * Задание коллекции обработчиков клавиатуры
	 */
	private static set keyboardeventhelpers(value:any[]) {
		(window as any).__keyboardeventhandlers = value;
	}
	/**
	 * Регистрация обработчика клавиатуры
	 * @param {KeyboardEventHelper} value Обработчик клавиатуры
	 */
	public static registerKeyboardEventHandlers(value:KeyboardEventHelper):void{
		const handlers = Zoomer.keyboardeventhelpers;
		handlers.push(value);
	}
	/**
	 * Отмена регистрации обработчика клавиатуры
	 * @param {KeyboardEventHelper} value Обработчик клавиатуры
	 */
	public static unregisterKeyboardEventHandlers(value:KeyboardEventHelper){
		const idx = Zoomer.keyboardeventhelpers.indexOf(value);
		Zoomer.keyboardeventhelpers.splice(idx, 1);
	}
	/**
	 * Открытие модального окна с увеличенным изображением
	 */
	public open(e:MouseEvent){
		
		// Читаем индекс открываемой картинки
		let img = <HTMLImageElement>e.currentTarget;
		const indexAttr = img.dataset.index || img.getAttribute("data-index");
		this.currentIndex = parseInt(indexAttr, 10);
		// Создаём DOM модального окна и помещаем его в документ
		this.modal = this.createDOM();
		document.body.append(this.modal);
		// Устанавливаем стартовую позицию слайдера
		let currentSlide = document.querySelector('.zoomer-current-wrapper');
		this.slideWidth = currentSlide.getBoundingClientRect().width;
		
		this.wrapper.scrollLeft = this.slideWidth;
		// Открываем модальное окно
		this.modal.classList.add('open');
		window.onresize = this.updateWidth.bind(this);
	}
	/**
	 * Создание DOM модального окна
	 */
	private createDOM():HTMLDivElement{
		// если уже создано, то ничего не делаем
		if(this.modal){return;}
		let zoomerEl = document.createElement('div');
		zoomerEl.className = 'zoomer-container';
		let zoomWrap = document.createElement('div');
		zoomWrap.className = 'zoomer-wrapper';
		let closeBtn = document.createElement('span');
		closeBtn.className = 'zoomer-close';
		closeBtn.textContent = '×';
		closeBtn.addEventListener('click', this.close.bind(this));
		let nextBtn = document.createElement('span');
		nextBtn.className = 'zoomer-next';
		nextBtn.textContent = '\u276F'; // >
		nextBtn.addEventListener('click', this.next.bind(this));
		let prevBtn = document.createElement('span');
		prevBtn.className = 'zoomer-prev';
		prevBtn.textContent = '\u276E'; // <
		prevBtn.addEventListener('click', this.prev.bind(this));
		let prevWrapper = document.createElement('div');
		prevWrapper.className = 'zoomer-prev-wrapper';
		let prevImg = document.createElement('img');
		prevImg.draggable = false;
		let prevIndex = (this.currentIndex - 1) < 0 ?  this.sources.length - 1 : this.currentIndex - 1;
		prevImg.src = this.sources[prevIndex];
		prevWrapper.appendChild(prevImg);
		let currentWrapper = document.createElement('div');
		currentWrapper.className = 'zoomer-current-wrapper';
		let currentImg = document.createElement('img');
		currentImg.draggable = false;
		currentImg.src = this.sources[this.currentIndex];
		currentWrapper.appendChild(currentImg);
		currentImg.addEventListener('dblclick', this.toggleZoom.bind(this), false);
		let nextWrapper = document.createElement('div');
		nextWrapper.className = 'zoomer-next-wrapper';
		let nextImg = document.createElement('img');
		nextImg.draggable = false;
		let nextIndex = (this.currentIndex + 1) >= this.sources.length ? 0 : this.currentIndex + 1;
		nextImg.src = this.sources[nextIndex];
		nextWrapper.appendChild(nextImg);
		zoomerEl.addEventListener('click', this.closeOutside.bind(this));
		zoomWrap.addEventListener('mousedown', this.startDrag.bind(this));
		zoomWrap.addEventListener('mouseup', this.endDrag.bind(this));
		zoomWrap.addEventListener('mousemove', this.drag.bind(this));
		zoomWrap.addEventListener('touchstart', this.startTouch.bind(this));
		zoomWrap.addEventListener('touchend', this.endTouch.bind(this));
		zoomWrap.addEventListener('touchmove', this.touchMove.bind(this));
		zoomWrap.appendChild(prevWrapper);
		zoomWrap.appendChild(currentWrapper);
		zoomWrap.appendChild(nextWrapper);
		zoomerEl.appendChild(prevBtn);
		zoomerEl.appendChild(nextBtn);
		zoomerEl.appendChild(closeBtn);
		zoomerEl.append(zoomWrap);
		this.wrapper = zoomWrap;
		return zoomerEl;
	}
	/**
	 * Начало перетаскивания
	 */
	private startDrag(e:MouseEvent):void{
		if(this.isAnimating) return;
		this.dragStartX = e.pageX;
		this.isDragging = true;
	}
	/** Начало перетаскивания касанием */
	private startTouch(e:TouchEvent):void{
		if(this.isAnimating) return;
		let touchObj = e.changedTouches.item(0);
		this.dragStartX = touchObj.clientX;
		this.isDragging = true
	}
	/** Завершение перетаскивания касанием */
	private endTouch(e:TouchEvent):void{
		this.isDragging = false;
		if(this.dragOffset == 0) return;
		let from = this.wrapper.scrollLeft;
		if(Math.abs(this.dragOffset) > 30){
			if(this.dragOffset > 0) {
				this.next();
			}else{
				this.prev();
			}
		}else{
			this.animate(from, this.slideWidth, () => {
				this.isAnimating = false;
				this.dragOffset = 0;
			})
		}
	}
	private touchMove(e: TouchEvent): void {
		if (!this.isDragging) return;
		this.dragOffset = this.dragStartX - e.changedTouches[0].clientX;
		let currentX = this.dragOffset + this.slideWidth;
		this.wrapper.scrollLeft = currentX;
	}
	/** Конец перетаскивания */
	private endDrag():void{
		this.isDragging = false;
		if(this.dragOffset == 0) return;
		let from = this.wrapper.scrollLeft;
		if(Math.abs(this.dragOffset) > 30){
			if(this.dragOffset > 0) {
				this.next();
			}else{
				this.prev();
			}
		}else{
			this.animate(from, this.slideWidth, () => {
				this.isAnimating = false;
				this.dragOffset = 0;
			})
		}
	}
	
	/** Процесс перетаскивания */
	private drag(e:MouseEvent):void{
		if (!this.isDragging) return;
		this.dragOffset = this.dragStartX - e.clientX;
		let currentX = this.dragOffset + this.slideWidth;
		this.wrapper.scrollLeft = currentX;
	}
	/**
	 * Закрытие модального окна
	 */
	public close():void{
		this.modal.classList.remove('open');
		Zoomer.keyboardeventhelpers.forEach((el:KeyboardEventHelper) => {
			el.destroy();
		})
		Zoomer.keyboardeventhelpers = [];
		setTimeout(() => {
			this.modal.remove();
			this.modal = null;
			this.isDragging = false;
			this.isAnimating = false;
		}, this.removeTimeout);
	}
	/**
	 * Закрытие модального окна при клике на пустом поле
	 */
	public closeOutside(e:MouseEvent):void{
		if(this.isAnimating) return;
		let path = e.composedPath() as Node[];
		let activeElement = path.filter((el:HTMLElement) => {
			return el.tagName === 'SPAN' || el.tagName === 'IMG';
		});
		if(!activeElement.length){
			this.close();
		}
	}
	/**
	 * Переход к следующему изображению
	 */
	public next():void{
		if(this.isAnimating) return;
		
		let from = this.wrapper.scrollLeft;
		let to = this.slideWidth * 2;
		this.isAnimating = true;
		this.animate(from, to, () => {
			this.afterMath(this.currentIndex + 1);
			this.dragOffset = 0;
		});
	}
	/**
	 * Переход к предыдущему изобажению
	 */
	public prev():void{
		if(this.isAnimating) return;
		
		let from = this.wrapper.scrollLeft;
		let to = 0;
		this.isAnimating = true;
		this.animate(from, to, () => {
			this.afterMath(this.currentIndex - 1);
			this.dragOffset = 0;
		});
	}
	/**
	* Анимация перехода
	* @param {number} from Исходный scrollLeft
	* @param {number} to Целевой scrollLeft
	* @param {()=>void} callback Колбек после анимации
	* @param {number} duration Продолжительность анимации
	*/
	private animate(from:number, to:number, callback:(newIndex:number)=>void, duration:number = 600){
	
		const EASE_IN_OUT_QUAD = (t:number) => {
			t *= 2;
			if (t < 1) return 0.5 * t * t;
			return - 0.5 * (--t * (t - 2) - 1);
		};
		// Анимация перехода к слайду
		let startX = from;
		let targetX = to;
		let elapsedTime = 0;
		const step = () => {
			if (elapsedTime < duration) {
				let progress = elapsedTime / duration;
				let value = startX + (targetX - startX) * EASE_IN_OUT_QUAD(progress);
				this.wrapper.scrollLeft = value;
				elapsedTime += 16;
				setTimeout(step, 10);
			} else {
				callback(this.currentIndex);
			}
		}
		step();
	}
	/**
	 * Обновление слайдера при изменении окна браузера
	 */
	private updateWidth(){
		let slide = <HTMLElement>document.querySelector('.zoomer-current-wrapper');
		this.slideWidth = slide.getBoundingClientRect().width;
		this.slideWidth = slide.getBoundingClientRect().width;
		this.wrapper.scrollLeft = this.slideWidth;
		
	}
	/**
	 * Установка src по окончании анимации перехода
	 */
	private afterMath(newIndex:number){
		if(newIndex >= this.indexes.length){
			newIndex = 0;
		}else{
			if(newIndex < 0){
				newIndex = this.indexes.length - 1;
			}
		}
		
		let currentImg = <HTMLImageElement>this.modal.querySelector('.zoomer-current-wrapper img');
		let prevImg = <HTMLImageElement>this.modal.querySelector('.zoomer-prev-wrapper img');
		let nextImg = <HTMLImageElement>this.modal.querySelector('.zoomer-next-wrapper img');
		let prevIndex = (newIndex - 1) < 0 ? this.indexes.length - 1 : (newIndex - 1);
		let nextIndex = (newIndex + 1) >= this.indexes.length ? 0 : (newIndex + 1);

		currentImg.src = this.sources[newIndex];

		let timeout = window.innerWidth >= 600 ? 80 : 0;

		setTimeout(() => {
			this.wrapper.scrollLeft = this.slideWidth;
			prevImg.src = this.sources[prevIndex];
			nextImg.src = this.sources[nextIndex];
			this.currentIndex = newIndex;
			this.isAnimating = false;
			this.wrapper.querySelectorAll('img').forEach((img:HTMLImageElement) => {
				img.className = '';
			})
		}, timeout);
		
		
	}
	/**
	 * Увеличение картинки по двойному клику
	 */
	private toggleZoom(){
		let image = this.wrapper.querySelector('.zoomer-current-wrapper img');
		let newClass = image.classList.contains('zoomed') ? '' : 'zoomed';
		this.wrapper.querySelectorAll('img').forEach((img:HTMLImageElement) => {
			img.className = newClass;
		})
	}
}