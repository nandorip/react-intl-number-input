import React, { Component } from "react";
import PropTypes from "prop-types"

const formatarDecimal = (valor) => {
  if (valor) {
    return new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2 }).format(valor);
  }
};


class IntlNumberInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      maskedValue: "0",
    }
  }

  componentDidMount() {
    this.setMaskedValue(this.props.value)
  }

  setMaskedValue(value = 0) {
    this.setState({
      maskedValue: this.formatNumber(value),
    })
  }

  formatNumber(value = 0) {
    return new Intl.NumberFormat(this.props.locale, {
      style: this.props.style,
      currency: this.props.currency,
      minimumFractionDigits: 2
    }).format(value);
  };

  getNumberValue(strValue) {
    const numberValue = Number(strValue.replace(/[^0-9-]/g, ""));
    console.log(strValue, numberValue);

    return numberValue / 100;
  }

  updateValues(event) {
    const value = this.getNumberValue(event.target.value);
    this.setMaskedValue(value);
    console.log(value);

    return [value, this.state.maskedValue];
  }

  handleChange(event) {
    event.preventDefault();

    const [value, maskedValue] = this.updateValues(event);

    if (this.props.onChange && maskedValue) {
      this.props.onChange(event, value, maskedValue)
    }
  }

  render() {
    return (
        <input
            value={this.state.maskedValue}
            disabled={this.props.disabled}
            onChange={(e) => this.handleChange(e)}
        />
    );
  }
}

IntlNumberInput.propTypes = {
  locale: PropTypes.string.isRequired,
  style: PropTypes.string.isRequired,
  currency: PropTypes.string.isRequired,
  value: PropTypes.number,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
}

IntlNumberInput.defaultProps = {
  locale:'en-US',
  style: 'decimal',
  currency: 'USD',
}

export default IntlNumberInput;