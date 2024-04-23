export interface ITinyOptions{
	selector:string
}

export default class TinyParallax{

	elements:NodeListOf<HTMLElement>;

	constructor(options:ITinyOptions){
		this.elements = document.querySelectorAll(options.selector);

		window.addEventListener("scroll", ()=> this.init());
	}

	private init(){

		this.elements.forEach((el:HTMLElement) => {
			let jqPos = 'center '+(($(el).offset().top+($(el).height()/2)-$(window).scrollTop())/$(window).height()*100)+'%';
			// let offsetTop = el.offsetTop;
			// let elementHeight = el.clientHeight;
			// let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
			// let windowHeight = window.innerHeight;
			// let position = ((offsetTop + (elementHeight / 2)) - scrollTop) / windowHeight * 100;

			let cssPosition
			// cssPosition = `center ${position}%`;
			cssPosition = jqPos;

			el.style.backgroundPosition = cssPosition;
		});
	}
}