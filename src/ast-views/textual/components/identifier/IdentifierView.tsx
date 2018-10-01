import React = require('react');
import * as styles from './IdentifierView.scss';
import { TextualViewProps } from '../../TextualViewController';
import { Identifier } from 'estree';
import ContentEditable from 'react-simple-contenteditable';

export default class IdentifierView extends React.Component<TextualViewProps> {

	constructor(props: TextualViewProps) {
		super(props);

		this.handlePropChange = this.handlePropChange.bind(this);
	}

	handlePropChange(event: React.SyntheticEvent<HTMLInputElement>, newValue: string) {
		this.props.onPropChange('name', null, newValue);
	}

	public render(): JSX.Element {

		if(!this.props.astNode) return null;

		const node: Identifier = this.props.astNode as Identifier;

		return (
			<div className={styles.identifier}>
				<ContentEditable
					html={node.name}
					className={styles.primitiveEntry}
					tagName="span"
					onChange={ this.handlePropChange }
					contentEditable="plaintext-only"
				/>
			</div>
		);
	}
}
