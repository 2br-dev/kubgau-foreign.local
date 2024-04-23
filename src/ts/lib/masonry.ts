interface IBreakpoint{
	maxWidth: number,
	columnCount: number
}

interface IMasonryParams{
	containerSelector: string,
	itemSelector: string,
	columnCount: number,
	breakpoints?: IBreakpoint[],
}

class TinyMasonry{

	container: HTMLElement;
	items: HTMLElement[];
	columnCount: number;
	defaultColumnCount: number;
	breakPoints: IBreakpoint[];
	updateEvent: () => void;

	constructor(params:IMasonryParams){

		this.items = [];
		this.breakPoints = params.breakpoints;
		this.columnCount = this.defaultColumnCount = params.columnCount;
		this.container = <HTMLElement>document.querySelector(params.containerSelector);
		this.container.style.display = 'flex';
		if(this.container == null) return;
		
		this.container.querySelectorAll(params.itemSelector).forEach((el:HTMLElement) => {
			this.items.push(el);
		});
		this.updateBreakpoints();

		this.updateEvent = this.updateBreakpoints.bind(this);

		window.addEventListener('resize', this.updateEvent, true);
	}
	
	render(){
		this.container.innerHTML = "";

		for(let i=0; i<this.columnCount; i++){
			let columnElement = document.createElement("div");
			columnElement.className = "m-column";
			columnElement.style.width = `calc(${100 / this.columnCount}%)`;
			let appendFunc = (index:number ) => {
				if(this.items[index]){
					let el = this.items[index];
					columnElement.appendChild(el);
					appendFunc(index + this.columnCount);
				}
			}
			appendFunc(i);
			this.container.appendChild(columnElement);
		}
	}

	updateBreakpoints(){
		this.columnCount = this.defaultColumnCount;
		if(this.breakPoints){
			this.breakPoints.forEach((point:IBreakpoint) => {
				if(window.innerWidth < point.maxWidth){
					this.columnCount = point.columnCount;
				}
			});
		}

		this.render();
	}

	destroy(){
		window.removeEventListener('resize', this.updateEvent, true);
		this.container.innerHTML = "";
		this.container.style.display = "block";
		this.items.forEach((item:HTMLElement) => {
			this.container.appendChild(item);
		});
	}
}

export default TinyMasonry;