import React = require('react');
import * as styles from './IdentifierView.scss';
import { TextualViewProps } from '../../TextualViewController';
import { Identifier } from 'estree';

export default class IdentifierView extends React.Component<TextualViewProps> {

	constructor(props: TextualViewProps) {
		super(props);

		this.handlePropChange = this.handlePropChange.bind(this);
	}

	handlePropChange(event: React.SyntheticEvent<HTMLInputElement>) {
		const newValue = event.currentTarget.value;
		this.props.onPropChange('name', null, newValue);
	}

	public render(): JSX.Element {

		const node: Identifier = this.props.astNode as Identifier;

		return (
			<div className={styles.identifier}>
				<input className={styles.primitiveEntry} type="text" value={node.name} onChange={this.handlePropChange} />
			</div>
		);
	}
}
