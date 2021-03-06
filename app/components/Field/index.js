// @flow
import * as React from 'react';
import isObject from 'utils/isObject';
import consumeContextBroadcast from 'utils/consumeContextBroadcast';
import type { FormData } from 'components/Form';

type FieldProps = {
  component: React.ElementType,
  name: string,
  handleRef: (ref: ?React.ElementRef<any>) => void,
  formData: FormData,
};

/**
 * `Field` component.
 *
 * Used to connect any form field to the form data generated by the Form component.
 *
 * The prop `component` can be a Component, a stateless function component, or
 * a string for DOM form fields (`input`, `select`). This is the component that will
 * be rendered.
 */
export class Field extends React.Component<FieldProps> {
  static defaultProps = {
    component: 'input',
    handleRef: null,
  };

  /**
   * Return a field value from a SyntheticEvent or a value
   */
  getValue = (eventOrValue: any) => {
    if (!isObject(eventOrValue)) return eventOrValue;

    const target = eventOrValue.target;
    if (target) {
      const type = target.type;
      if (type === 'checkbox') {
        return target.checked || '';
      }
      return target.value;
    }
    return eventOrValue;
  };

  getFieldData = () => {
    const { name, formData } = this.props;

    return formData.fields[name];
  };

  /**
   * Handle change from the underlying component
   */
  handleChange = (eventOrValue: SyntheticEvent<HTMLInputElement> | mixed) => {
    const field = this.getFieldData();

    if (field) {
      const value = this.getValue(eventOrValue);
      field.onChange(value);
    }
  };

  render() {
    const { component, name, handleRef, formData, ...otherProps } = this.props;
    const field = this.getFieldData();

    // form-related props
    const customProps = {
      name,
      value: typeof field.value !== 'undefined' ? field.value : '',
      onChange: this.handleChange,
      onBlur: field.onBlur,
      ref: handleRef,
    };

    // form-related props that might cause an "unknown prop" warnings
    const extraProps = {
      blurred: field.blurred,
      error: field.error,
      initialValue: field.initialValue,
    };

    if (typeof component === 'string') {
      // don't pass extra props if component is a string, because
      // it can trigger "unknown prop" warnings
      return React.createElement(component, { ...otherProps, ...customProps });
    }
    return React.createElement(component, { ...otherProps, ...customProps, ...extraProps });
  }
}

export default consumeContextBroadcast('formData')(Field);
