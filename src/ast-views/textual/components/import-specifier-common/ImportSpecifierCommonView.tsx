import React = require('react');
import * as styles from './ImportSpecifierCommonView.scss';
import { default as TextualViewController, TextualViewProps } from '../../TextualViewController';
import { ImportSpecifier, ImportDefaultSpecifier, ImportNamespaceSpecifier } from 'estree';
import Dropdown from '../../../basic-ui-components/dropdown';

interface ImportSpecifierCommonViewProps extends TextualViewProps {
	availableImports: Array<{ label: string, value: ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier }>;
	selectedImport: number;
}

/**
 * This view currently is able to display:
 * ImportSpecifier, ImportDefaultSpecifier and ImportNamespaceSpecifier
 */
export default class ImportSpecifierCommonView extends React.Component<ImportSpecifierCommonViewProps> {

	constructor(props: ImportSpecifierCommonViewProps) {
		super(props);

		this.handlePropChange = this.handlePropChange.bind(this);
	}

	handlePropChange(event: React.SyntheticEvent<HTMLInputElement>) {
		const newValue = event.currentTarget.value;
		if(this.props.astNode.type === "ImportSpecifier") {
			this.props.onPropChange('imported', null, newValue);
		}
	}

	getImportProp() {
		switch(this.props.astNode.type) {
			case "ImportSpecifier": {
				return (this.props.astNode as ImportSpecifier).imported;
			}
			case "ImportDefaultSpecifier": {
				return "default";
			}
			case "ImportNamespaceSpecifier": {
				return "*";
			}
		}
	}

	public render(): JSX.Element {

		if(!this.props.astNode) return null;

		const node: ImportSpecifier = this.props.astNode as ImportSpecifier;

		return (
			<div className={styles.specifier}>
				<Dropdown initialSelection={this.props.selectedImport} labelValuePairs={this.props.availableImports} />
				→ <TextualViewController type={(node.local as any).type} uid={(node.local as any).uid} />
			</div>
		);
	}
}

/*
<ContentEditable
	html={this.getImportProp() as any}
	className={styles.primitiveEntry}
	tagName="span"
	onChange={ this.handlePropChange }
	contentEditable="plaintext-only"
	/>
 */