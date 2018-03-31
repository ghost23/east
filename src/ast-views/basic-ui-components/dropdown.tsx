/**
 * Created by mail on 11.01.2017.
 */
import * as React from 'react';
import { Component, SyntheticEvent, KeyboardEvent, MouseEvent } from 'react';
const styles = require('./dropdown.scss');
import shallowequal = require('shallowequal');
import Scrollbars from 'react-custom-scrollbars';
import nodeIsDescendant from '../../utils/nodeIsDescendant';

interface DropdownProps {
	className?: string;
	autoFocus?: boolean;
	numVisibleRows?: number;
	tooltipMode?: boolean;
	labelValuePairs: Array<{label: string, value: any}>;
	initialSelection?: number;
	onChange?: (newValue: {label: string, value: any}) => void;
}

interface DropdownState {
	open: boolean;
	selection: number;
	hover: number;
	searchTerm: string;
}

class Dropdown extends Component<DropdownProps, DropdownState> {

	static defaultProps = {
		numVisibleRows: 5,
		initialSelection: 0,
		onChange: () => {}
	};

	typingTimeout: NodeJS.Timer | number;
	bodyRef: HTMLElement;
	listRef: HTMLElement;
	scrollBarRef: Scrollbars;

	constructor(props: DropdownProps) {
		super(props);

		this.handleButtonClick = this.handleButtonClick.bind(this);
		this.handleKeyUp = this.handleKeyUp.bind(this);
		this.handleKeyDown = this.handleKeyDown.bind(this);
		this.handleFocusOut = this.handleFocusOut.bind(this);
		this.handleListMousedown = this.handleListMousedown.bind(this);
		this.handleListClick = this.handleListClick.bind(this);
		this.onScrollBarRef = this.onScrollBarRef.bind(this);
		this.onListRef = this.onListRef.bind(this);
		this.onWrapperRef = this.onWrapperRef.bind(this);

		this.state = {
			open: false,
			selection: this.props.initialSelection !== undefined && this.props.initialSelection !== null ?
				this.props.initialSelection : 0,
			hover: 0,
			searchTerm: ''
		};

		this.typingTimeout = -1;
		this.bodyRef = null;
	}

	componentDidMount() {
		this.bodyRef = document.querySelector('body');
	}

	shouldComponentUpdate(nextProps: DropdownProps, nextState: any) {
		return !shallowequal(this.props, nextProps) || !shallowequal(this.state, nextState);
	}

	handleKeyUp(event: KeyboardEvent<HTMLDivElement>) {
		if(event.charCode === 32 || event.keyCode === 32) { // Space
			this.handleButtonClick(event);
		} else if(event.charCode === 13 || event.keyCode === 13) { // Enter
			event.stopPropagation();
			this.bodyRef.removeEventListener('click', this.handleButtonClick);
			this.setState({selection: this.state.hover, open: false, hover: 0});
			this.props.onChange(this.props.labelValuePairs[this.state.hover]);
		} else if(this.state.open && (event.charCode >= 49 || event.keyCode >= 49)) { // At 49 the digits start, then come the characters
			// dropdown is open, pressed key is above the range of keys, which typically are control keys like shift, enter, tab, ctrl, etc.
			const newSearchTerm = this.state.searchTerm + event.key;
			const foundIndex = this.props.labelValuePairs.findIndex(labelValuePair => {
				return (new RegExp(newSearchTerm, 'ig')).test(labelValuePair.label);
			});
			console.log('searchTerm:', newSearchTerm, 'foundIndex:', foundIndex);
			this.setState({searchTerm: newSearchTerm, hover: foundIndex >= 0 ? foundIndex : this.state.hover});
			this.handleTypingTimeout();
		}
	}

	handleTypingTimeout() {

		if(this.typingTimeout !== -1) clearTimeout(this.typingTimeout as NodeJS.Timer);

		this.typingTimeout = setTimeout(() => {
			this.typingTimeout = -1;
			this.setState({searchTerm: ''});
		}, 700);
	}

	handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
		let handled = false;
		if(event.charCode === 32 || event.keyCode === 32) {
			handled = true;
			event.preventDefault();
		}
		if(this.state.open) {
			if (event.charCode === 40 || event.keyCode === 40) { // Arrow down
				handled = true;
				event.preventDefault();
				this.setState({hover: this.state.hover < this.props.labelValuePairs.length - 1 ? this.state.hover + 1 : 0});
			} else if (event.charCode === 38 || event.keyCode === 38) { // Arrow up
				handled = true;
				event.preventDefault();
				this.setState({hover: this.state.hover > 0 ? this.state.hover - 1 : this.props.labelValuePairs.length - 1});
			}
		}

		return !handled;
	}

	handleFocusOut(event: SyntheticEvent<HTMLDivElement>) {
		if(this.state.open) this.handleButtonClick(event);
	}

	handleButtonClick(event: SyntheticEvent<HTMLDivElement> | Event) {
		if(!this.state.open) {
			event.stopPropagation();
			this.bodyRef.addEventListener('click', this.handleButtonClick);
			this.setState({open: true});
		}else {
			if(nodeIsDescendant(event.target as Node, this.listRef)) {
				return;
			}
			event.stopPropagation();
			this.bodyRef.removeEventListener('click', this.handleButtonClick);
			this.setState({open: false, hover: 0});
		}
	}

	handleListMousedown(event: MouseEvent<HTMLUListElement>) {
		event.preventDefault();
	}

	handleListClick(event: MouseEvent<HTMLUListElement>) {

		let selectedIndex = parseInt((event.target as HTMLElement).getAttribute("data-index"));
		this.bodyRef.removeEventListener('click', this.handleButtonClick);
		this.setState({selection: selectedIndex, open: false, hover: 0});
		this.props.onChange(this.props.labelValuePairs[selectedIndex]);
	}

	onScrollBarRef(ref: Scrollbars) {
		this.scrollBarRef = ref;
	}

	onListRef(ref: HTMLDivElement) {
		this.listRef = ref;
	}

	onWrapperRef(ref: HTMLDivElement) {
		this.props.autoFocus && ref && ref.focus();
	}

	renderListRows() {

		return this.props.labelValuePairs.map((labelValuePair, i) => (
				<li
					className={this.state.hover === i ? styles.elementHover : null}
					data-index={i}
					key={labelValuePair.label}
				>
					{labelValuePair.label}
				</li>
			)
		);
	}

	componentWillUnmount() {
		this.bodyRef.removeEventListener('click', this.handleButtonClick);
	}

	componentWillReceiveProps(nextProps: DropdownProps) {
		if(nextProps.initialSelection !== this.props.initialSelection || nextProps.initialSelection === -1) {
			this.setState({
				selection: nextProps.initialSelection !== undefined && nextProps.initialSelection !== null ?
					nextProps.initialSelection :
					-1
			});
		}
	}

	componentDidUpdate() {
		const scrollable = this.props.labelValuePairs.length > this.props.numVisibleRows;
		if(this.state.open && this.scrollBarRef && scrollable) {
			const currentScrollHeight = this.scrollBarRef.getScrollHeight();
			const currentScrollTop = this.scrollBarRef.getScrollTop();
			const elementHeight = currentScrollHeight / this.props.labelValuePairs.length;
			const visibleTopElement = Math.floor(currentScrollTop / elementHeight);
			const visibleBottomElement = Math.floor((currentScrollTop + elementHeight * this.props.numVisibleRows) / elementHeight) - 1;
			const hoverElementTop = elementHeight * this.state.hover;
			if(this.state.hover < visibleTopElement) {
				this.scrollBarRef.scrollTop(hoverElementTop);
			} else if(this.state.hover > visibleBottomElement) {
				this.scrollBarRef.scrollTop(hoverElementTop - (elementHeight * (this.props.numVisibleRows - 1)));
			}
		}
	}

	render() {

		return (
			<span>
				<div ref={this.onWrapperRef}
					 className={styles.focusElement}
					 tabIndex={0}
					 onKeyUp={this.handleKeyUp}
					 onBlur={this.handleFocusOut}
					 onKeyDown={this.handleKeyDown}
				>
					<div className={styles.field} onClick={this.handleButtonClick}>
						{this.props.labelValuePairs[this.state.selection].label}
					</div>
				</div>
				{
					this.state.open ?
						<div className={styles.datalayerWrapper} ref={this.onListRef}>
							<Scrollbars
								universal
								style={{ width: "100%", height: this.props.numVisibleRows * 16 }}
								ref={this.onScrollBarRef}
							>
								<ul
									className={styles.datalayer}
									onClick={this.handleListClick}
									onMouseDown={this.handleListMousedown}
								>
									{this.renderListRows()}
								</ul>
							</Scrollbars>
						</div>:
						null
				}
			</span>
		);
	}
}

export default Dropdown;
