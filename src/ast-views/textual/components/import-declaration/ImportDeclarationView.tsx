import React = require('react');
import * as styles from './ImportDeclarationView.scss';
import { TextualViewProps } from '../../TextualViewController';
import TextualView from '../../TextualView';
import { ImportDeclaration } from 'estree';

interface ImportDeclarationViewProps extends TextualViewProps {
	availableFiles: string[]
}

export default class ImportDeclarationView extends TextualView<ImportDeclarationViewProps> {

	constructor(props: ImportDeclarationViewProps) {
		super(props);
	}

	public render(): JSX.Element {

		if(!this.props.astNode) return null;

		const node:ImportDeclaration = this.props.astNode as ImportDeclaration;

		return (
			<div className={`default ${this.props.astNode.type} ${styles.block}`}>
				Import of <span className={styles.source}>{node.source.value}</span>
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
