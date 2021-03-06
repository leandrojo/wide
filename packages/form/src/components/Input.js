import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { omit } from 'underscore';
import Masker from 'vanilla-masker';
import { View, theme } from '@react-scale/core';

import { FormContext } from './Form';
import registerField from './registerField';

const { css, withStyles } = theme;

class Input extends Component {
  state = {
    showErrors: false,
    isInputFocus: false,
  };

  form = {};

  componentWillMount() {
    const { value } = this.props;

    this.setState(state => {
      switch (typeof value) {
        case 'number':
          return Object.assign(state, { value: value.toFixed(2) });
        case 'string':
        default:
          return Object.assign(state, { value: this.format(value) });
      }
    });
  }

  onBlur = () => {
    this.setState({
      isInputFocus: true,
      showErrors: true,
    });
  };

  onChange = ev => {
    const { name } = this.props;

    const value = this.format(ev.target.value);

    this.props.onChange(value, name);
  };

  onFocus = () => {
    this.setState({
      isInputFocus: true,
    });
  };

  format(value: string) {
    const moneyFormatter = {
      precision: 2,
      separator: ',',
      delimiter: '.',
      unit: 'R$',
    };

    if (this.props.isMoney) {
      return Masker.toMoney(Masker.toNumber(value), moneyFormatter);
    }

    if (typeof value === 'string' && this.props.format !== '') {
      return Masker.toPattern(value, this.props.format);
    }

    return value;
  }

  renderError() {
    const { errors, styles } = this.props;
    const showErrors = this.state.showErrors || this.props.showErrors;

    if (errors.length === 0 || showErrors === false) return null;

    return (
      <div {...css(styles.warn)}>
        <span {...css(styles.warnText)}>{errors[0]}</span>
      </div>
    );
  }

  renderLabel() {
    const {
      id, label, styles,
    } = this.props;
    const { isInputFocus } = this.state;

    const style = [styles.label];

    if (isInputFocus) style.push(styles.label__focus);

    return (
      <label {...css(style)} htmlFor={id}>
        {label}
      </label>
    );
  }

  render() {
    const {
      errors, id, isDisable, isReadOnly, name, styles, value,
    } = this.props;
    const showErrors = this.state.showErrors || this.props.showErrors;

    const style = [styles.input];

    if (errors.length !== 0 && showErrors !== false) style.push(styles.input__danger);

    return (
      <FormContext.Consumer>
        {() => (
          <View {...css(styles.content)}>
            <View {...css(styles.inner)}>
              {this.renderLabel()}
              <input
                {...css(style)}
                disabled={isDisable}
                name={name}
                onBlur={this.onBlur}
                onChange={this.onChange}
                onFocus={this.onFocus}
                readOnly={isReadOnly}
                type="text"
                id={id}
                value={value}
                ref={ref => {
                  this.input = ref;
                }}
                {...omit(
                  this.props,
                  'inputRef',
                  'label',
                  'onBlur',
                  'onChange',
                  'onFocus',
                  'onInputFocus',
                  'placeholder',
                  'rules',
                  'value',
                )}
              />
            </View>
            {this.renderError()}
          </View>
        )}
      </FormContext.Consumer>
    );
  }
}

Input.defaultProps = {
  format: '',
  id: '',
  isMoney: false,
  label: '',
  onError: () => {},
  onSuccess: () => {},
  placeholder: '',
  required: false,
  rules: [],
};

Input.propTypes = {
  format: PropTypes.string,
  id: PropTypes.string,
  isMoney: PropTypes.bool,
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  onError: PropTypes.func,
  onSuccess: PropTypes.func,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  rules: PropTypes.arrayOf(),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

const style = ({ colors, components, ...common }) => ({
  content: {
    padding: '0 0 10px',
  },
  inner: {
    flex: 1,
    padding: '20px 0 0',
    position: 'relative',
  },
  input: (() => {
    const {
      borderColor, borderRadius, borderSize, padding, width,
    } = components.input;

    return {
      appearance: 'none',
      border: `${borderSize}px solid ${borderColor}`,
      borderRadius,
      boxShadow: 'none',
      padding,
      width,

      ':focus': {
        outline: 'none',
        borderColor: colors.secondary,
      },
    };
  })(),
  input__danger: {
    borderColor: colors.danger,
    boxShadow: '0 0 0 4px #ffe8e6',
  },
  label: (() => {
    const {
      color, fontFamily, fontSize, paddingVertical,
    } = components.label;

    return {
      color,
      display: 'block',
      fontFamily,
      fontSize,
      padding: `${paddingVertical}px 0px`,
      pointerEvents: 'none',
      position: 'absolute',
      top: 'calc(50% + 8px)',
      left: 10,
      transform: 'translateY(-50%)',
      transition: 'font-size 100ms, top 100ms, color 100ms',
    };
  })(),
  label__focus: {
    fontSize: '70%',
    left: 0,
    top: 8,
    transition: 'font-size 250ms, top 250ms, color 250ms',
  },
  warn: {
    paddingTop: 5,
  },
  warnText: {
    color: colors.danger,
    fontSize: common.typography.fontSize * 0.8,
    fontFamily: common.fontFamily,
  },
});

export default withStyles(style)(registerField(Input));
