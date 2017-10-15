import React = require('react');
import { isArray } from 'lodash';
import * as styles from './TextualView.scss';
import TextualViewController, { TextualViewProps } from './TextualViewController';

export interface TextualViewState {
}

export default class TextualView extends React.Component<TextualViewProps, TextualViewState> {

	constructor(props: TextualViewProps) {
		super(props);

		this.handlePropChange = this.handlePropChange.bind(this);
	}

	shouldComponentUpdate(nextProps: TextualViewProps): boolean {
		return this.props.type !== nextProps.type || this.props.uid !== nextProps.uid;
	}

	renderInput(prop: any, propName: string, index?: number): JSX.Element {

		let inputType: string;
		switch(typeof prop) {
			case "string": inputType = "text"; break;
			case "number": inputType = "number"; break;
			case "boolean": inputType = "checkbox"; break;
			default: inputType = "text";
		}

		const gotIndex = (index !== null && index !== undefined);

		return (
			<li key={propName + "_" + (gotIndex || "")}>
				<label>
					{(index !== null && index !== undefined) ? `[${index}]` : `${propName}`}:
					<input
						data-propname={propName}
						data-propindex={gotIndex ? index : null}
						type={inputType}
						className={styles.primitiveEntry}
						value={prop}
						checked={inputType === 'checkbox' ? prop : null}
						onChange={this.handlePropChange}
					/>
				</label>
			</li>
		);
	}

	handlePropChange(event: React.SyntheticEvent<HTMLInputElement>) {
		const propName = event.currentTarget.getAttribute("data-propname");
		const newValue = event.currentTarget.type === "checkbox" ? event.currentTarget.checked : event.currentTarget.value;
		let propIndexString = event.currentTarget.getAttribute("data-propindex");
		let propIndex = null;
		if(propIndexString !== null) propIndex = parseInt(propIndex, 10);
		this.props.onPropChange(propName, propIndex, newValue);
	}

	renderProp(prop: any, propName: string, index: number): JSX.Element {
		if(prop !== null && prop !== undefined && typeof prop === 'object' && 'type' in prop && 'uid' in prop) {
			return <li key={index}>{propName}: <TextualViewController type={prop.type} uid={prop.uid} /></li>;
		} else if(isArray(prop)) {
			const list = prop.map((element: any, c_index: number) => {
				if(typeof element === 'object' && 'type' in element && 'uid' in element) {
					return <li key={propName + "_" + c_index}>[{c_index}]: <TextualViewController type={element.type} uid={element.uid} /></li>;
				} else if(prop !== null && prop !== undefined && prop.toString) {
					return this.renderInput(element, propName, c_index);
				}
			});
			return (<li key={index}>
				{propName}: <ul key={index}>{list}</ul>
			</li>);
		} else if(prop !== null && prop !== undefined && propName !== "type" && prop.toString) {
			return this.renderInput(prop, propName);
		} else {
			return null;
		}
	}

	public render(): JSX.Element {

		if(!this.props.astNode) return null;

		return (
			<div className={`default ${this.props.astNode.type} ${styles.block}`}>{this.props.astNode.type}
				<ul>
					{
						Object
							.keys(this.props.astNode)
							.filter(key => !key.startsWith('__east_'))
							.map((current: string, index: number): JSX.Element => {
								return this.renderProp((this.props.astNode as any)[current], current, index);
							})
					}
				</ul>
			</div>
		);
	}
}
