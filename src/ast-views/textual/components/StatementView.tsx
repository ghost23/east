import React = require('react');
import * as styles from './StatementView.scss';
import { TextualViewProps } from '../TextualViewController';
import TextualView from '../TextualView';
import { Statement } from 'estree';

export default class StatementView extends TextualView {

	constructor(props: TextualViewProps) {
		super(props);
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
							return <li key={index}>{ this.renderProp((this.props.astNode as any)[current], current, index) }</li>;
						})
					}
				</ul>
			</div>
		);
	}
}
