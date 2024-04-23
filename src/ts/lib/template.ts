export const template = `
{{#diapasone}}
<div class="diapasone">
	{{#dates}}
	<div class="calendar-date {{classname}}">
		<div class="left-content">
			{{#events.left}}
			<div class="event-content">
				<div class="date">{{date}}</div>
				<div class="description">{{description}}</div>
				<div class="title">{{title}}</div>
			</div>
			{{/events.left}}
		</div>
		<div class="date-bullet">
			<div class="date-bullet-sign"></div>
			<div class="bullet-label">{{date}}</div>
		</div>
		<div class="right-content">
			<div class="tablet-left">
				{{#events.left}}
				<div class="event-content">
					<div class="date">{{date}}</div>
					<div class="description">{{description}}</div>
					<div class="title">{{title}}</div>
				</div>
				{{/events.left}}
			</div>
			{{#events.right}}
			<div class="event-content">
				<div class="date">{{date}}</div>
				<div class="description">{{description}}</div>
				<div class="title">{{title}}</div>
			</div>
			{{/events.right}}
		</div>
	</div>
	{{/dates}}
</div>
{{/diapasone}}
`;