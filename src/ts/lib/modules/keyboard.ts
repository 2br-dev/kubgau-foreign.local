import Zoomer from "../zoomer";
/**
 * Расширение Zoomer позволяющее ему задействовать клавиатуру
 */
export default class KeyboardEventHelper{
	private zoomer:Zoomer;
	/**
	 * Расширение Zoomer позволяющее ему задействовать клавиатуру
	 * @param zoomer -  экземпляр класса Zoomer
	 */
	constructor(zoomer:Zoomer){
		this.zoomer = zoomer;
		window.addEventListener("keydown", this.onKeyDown.bind(this));
	}
	/**
	 * Обработчик нажатия клавиш
	 * @param {KeyboardEvent} e Эвент клавиатуры
	 */
	public onKeyDown(e:KeyboardEvent){
		switch(e.key){
			case 'Escape':
				this.zoomer.close();
				break;
			case 'ArrowLeft':
				this.zoomer.prev();
				break;
			case 'ArrowRight':
				this.zoomer.next();
				break;
		}
	}
	/**
	 * Уничтожение эвента
	 */
	public destroy(){
		window.removeEventListener("keydown", this.onKeyDown);
	}
}