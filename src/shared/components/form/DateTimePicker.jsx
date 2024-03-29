import React, { PureComponent } from "react";
import DatePicker from "react-datepicker";
import { isMobileOnly } from "react-device-detect";
import PropTypes from "prop-types";

class DateTimePickerField extends PureComponent {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      startDate: null,
    };
  }

  handleChange = (date) => {
    const { onChange } = this.props;
    this.setState({
      startDate: date,
    });
    onChange(date);
  };

  render() {
    const { startDate } = this.state;
    const { defaultValue } = this.props;
    if (defaultValue)
      this.setState({
        startDate: defaultValue,
      });

    return (
      <div className="date-picker">
        <DatePicker
          timeFormat="HH:mm"
          className="form__form-group-datepicker"
          selected={startDate}
          onChange={this.handleChange}
          showTimeSelect
          dateFormat="MMMM d, yyyy h:mm aa"
          dropDownMode="select"
          withPortal={isMobileOnly}
        />
      </div>
    );
  }
}

var renderDateTimePickerField = (props) => {
  const { input, defaultValue } = props;
  if (defaultValue) input.defaultValue = defaultValue;
  return <DateTimePickerField {...input} />;
};

renderDateTimePickerField.propTypes = {
  input: PropTypes.shape({
    onChange: PropTypes.func,
    name: PropTypes.string,
  }).isRequired,
};

export default renderDateTimePickerField;
