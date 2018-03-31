import React = require('react');
import * as styles from './ImportDeclarationView.scss';
import TextualViewController, { TextualViewProps } from '../../TextualViewController';
import TextualView from '../../TextualView';
import { ImportDeclaration, ImportNamespaceSpecifier, ImportSpecifier } from 'estree';
import { NodeReference } from '../../../../utils/constants';

interface ImportDeclarationViewProps extends TextualViewProps {
	availableFiles: string[],
	sourceFile: string
}

export default class ImportDeclarationView extends TextualView<ImportDeclarationViewProps> {

	constructor(props: ImportDeclarationViewProps) {
		super(props);

		this.handleChangeSpecifier = this.handleChangeSpecifier.bind(this);
	}

	handleChangeSpecifier(oldSpecifierIndex: number, newNode: ImportSpecifier | ImportNamespaceSpecifier) {
		this.props.onNodePropChange('specifiers', oldSpecifierIndex, newNode);
	}

	public render(): JSX.Element {

		if(!this.props.astNode) return null;

		const node:ImportDeclaration = this.props.astNode as ImportDeclaration;

		return (
			<div className={`default ${this.props.astNode.type} ${styles.block}`}>
				Import from <span className={styles.source}>{this.props.sourceFile}</span>
				<ul>
					{
						node.specifiers
						.map((specifier: any, index: number): JSX.Element => {
							const props = {
								type: (specifier as NodeReference).type,
								uid: (specifier as NodeReference).uid,
								specifierIndex: index,
								sourceFile: this.props.sourceFile,
								onChangeSpecifier: this.handleChangeSpecifier
							};
							return <li key={index} className={styles.specifierItem}>
								<TextualViewController {...props} />
							</li>;
						})
					}
				</ul>
			</div>
		);
	}
}
