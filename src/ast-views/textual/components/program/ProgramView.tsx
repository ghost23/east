import React = require('react');
import * as styles from './ProgramView.scss';
import { default as TextualViewController, TextualViewProps } from '../../TextualViewController';
import TextualView from '../../TextualView';
import { ModuleDeclaration, Program, Statement } from 'estree';

export default class ProgramView extends TextualView {

	constructor(props: TextualViewProps) {
		super(props);
	}

	renderBody(prop: any, propName: string) {
		const list = prop.map((element: any, c_index: number) => (
			<li key={propName + "_" + c_index}><TextualViewController type={element.type} uid={element.uid} /></li>
		));
		return (<ul>{list}</ul>);
	}

	public render(): JSX.Element {

		if(!this.props.astNode) return null;

		const node: Program = this.props.astNode as Program;

		return (
			<div className={`default ${this.props.astNode.type} ${styles.block}`}>
				<div className={styles.programHeader}>{node.sourceType}: {node.__east_uid}</div>
				{ this.renderBody(node.body, 'body') }
			</div>
		);
	}
}
