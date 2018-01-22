import React = require('react');
import { isArray } from 'lodash';
import * as styles from './TextualView.scss';
import TextualViewController, { TextualViewProps } from './TextualViewController';

export interface TextualViewState {
}

export default class TextualView<T extends TextualViewProps = TextualViewProps> extends React.Component<T, TextualViewState> {

	constructor(props: T) {
		super(props);

		this.handlePropChange = this.handlePropChange.bind(this);
	}

	shouldComponentUpdate(nextProps: T): boolean {
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
			return <span>{propName}: <TextualViewController type={prop.type} uid={prop.uid} /></span>;
		} else if(isArray(prop)) {
			const list = prop.map((element: any, c_index: number) => {
				if(typeof element === 'object' && 'type' in element && 'uid' in element) {
					return <li key={propName + "_" + c_index}>[{c_index}]: <TextualViewController type={element.type} uid={element.uid} /></li>;
				} else if(prop !== null && prop !== undefined && prop.toString) {
					return <li key={propName + "_" + c_index}>{ this.renderInput(element, propName, c_index) }</li>;
				}
			});
			return (<span>{propName}: <ul key={index}>{list}</ul></span>);
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
							.filter(element => element !== null)
							.map((element, index: number) => <li key={index}>{ element }</li>)
					}
				</ul>
			</div>
		);
	}
}
