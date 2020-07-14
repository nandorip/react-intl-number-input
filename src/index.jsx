import React, { Component } from 'react';

import PropTypes from 'prop-types';

class IntlNumberInput extends Component {
	constructor(props) {
		super(props);

		this.state = {
			maskedValue: '0',
			value: 0
		};
	}

	componentDidMount() {
		this.setMaskedValue(this.props.value);
	}

	componentDidUpdate(prevProps) {
		if (prevProps.value !== this.props.value) {
			this.setMaskedValue(this.props.value);
		}
	}

	setMaskedValue(value = 0) {
		this.setState({
			maskedValue: this.formatNumber(value)
		});
	}

	getMaskedValue() {
		return this.state.maskedValue;
	}

	getValue() {
		return this.state.value;
	}

	getPrecisionValue(precision) {
		return Math.pow(10, precision);
	}

	getNumberValue(strValue) {
		const numberValue = Number(strValue.replace(/[^0-9]/g, ''));

		return numberValue / this.getPrecisionValue(this.props.precision);
	}

	formatNumber(value = 0) {
		let numberValue = value;
		if (typeof numberValue === 'string') {
			numberValue = this.getNumberValue(numberValue);
		}

		const formattedNumber = new Intl.NumberFormat(this.props.locale, {
			style: 'decimal',
			minimumFractionDigits: this.props.precision,
			maximumFractionDigits: this.props.precision
		}).format(numberValue);

		return `${this.props.prefix}${formattedNumber}${this.props.suffix}`;
	}

	updateValues(event) {
		const value = this.getNumberValue(event.target.value);
		const maskedValue = this.formatNumber(value);

		return [value, maskedValue];
	}

	handleChange(event) {
		event.preventDefault();

		const [value, maskedValue] = this.updateValues(event);

		event.persist();

		if (this.props.onChange && maskedValue) {
			this.setState({ value, maskedValue }, () => {
				this.props.onChange(event, value, maskedValue);
			});
		}
	}

	handleKeyDown = event => {
		if (event.key === 'Backspace') {
			const calcValue = this.state.value / 10;
			const [value, maskedValue] = this.updateValues({ target: { value: this.formatNumber(calcValue) } });
			if (this.props.onChange && maskedValue) {
				this.setState({ value, maskedValue }, () => {
					this.props.onChange(event, calcValue, maskedValue);
				});
			}
		}
	};

	customProps() {
		const customProps = { ...this.props };

		delete customProps.locale;
		delete customProps.prefix;
		delete customProps.suffix;
		delete customProps.precision;
		delete customProps.autoFocus;
		delete customProps.value;
		delete customProps.onChange;

		return customProps;
	}

	render() {
		return (
			<input
				value={this.state.maskedValue}
				disabled={this.props.disabled}
				onChange={e => this.handleChange(e)}
				onKeyDown={this.handleKeyDown}
				{...this.customProps()}
			/>
		);
	}
}
IntlNumberInput.displayName = 'IntlNumberInput';
IntlNumberInput.propTypes = {
	locale: PropTypes.string.isRequired,
	prefix: PropTypes.string.isRequired,
	suffix: PropTypes.string.isRequired,
	precision: PropTypes.number.isRequired,
	value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	disabled: PropTypes.bool,
	onChange: PropTypes.func
};

IntlNumberInput.defaultProps = {
	locale: 'en-US',
	prefix: '',
	suffix: '',
	precision: 2
};

export default IntlNumberInput;
