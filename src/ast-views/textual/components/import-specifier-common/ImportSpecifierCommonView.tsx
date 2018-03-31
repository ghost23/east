import React = require('react');
import * as styles from './ImportSpecifierCommonView.scss';
import { default as TextualViewController, TextualViewProps } from '../../TextualViewController';
import { ImportSpecifier, ImportNamespaceSpecifier } from 'estree';
import Dropdown from '../../../basic-ui-components/dropdown';

interface ImportSpecifierCommonViewProps extends TextualViewProps {
	availableImports: Array<{ label: string, value: ImportSpecifier | ImportNamespaceSpecifier }>;
	selectedImport: number;
	specifierIndex: number;
	sourceFile: string;
	onChangeSpecifier: (oldSpecifierIndex: number, newNode: ImportSpecifier | ImportNamespaceSpecifier) => void;
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

	handlePropChange(newValue: { label: string, value: ImportSpecifier | ImportNamespaceSpecifier }) {

		this.props.onChangeSpecifier(this.props.specifierIndex, newValue.value);
	}

	public render(): JSX.Element {

		if(!this.props.astNode) return null;

		const node: ImportSpecifier = this.props.astNode as ImportSpecifier;

		return (
			<div className={styles.specifier}>
				<Dropdown
					initialSelection={this.props.selectedImport}
					onChange={this.handlePropChange}
					labelValuePairs={this.props.availableImports}
				/> → <TextualViewController
					type={(node.local as any).type}
					uid={(node.local as any).uid}
				/>
			</div>
		);
	}
}