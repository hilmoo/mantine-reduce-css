export interface Component {
	name: string;
	module: string;
}

export interface ComponentData extends Component {
	css_name: string;
	dependency: string[];
}
