export interface IEventData{
	classname:string,
	description: string,
	title:string
}

export interface IEvent{
	left: IEventData,
	right: IEventData
}

export interface IEventDate{
	date: string,
	classname: string,
	events:  Array<IEvent>

}

export interface IDiapasone{
	dates: Array<IEventDate>
}