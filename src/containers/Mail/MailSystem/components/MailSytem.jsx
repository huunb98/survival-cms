import React, { PureComponent } from "react";
import {
  Card,
  CardBody,
  Col,
  Button,
  ButtonToolbar,
  Row,
  Table,
  Container,
} from "reactstrap";
import { Field, reduxForm } from "redux-form";
import { withTranslation } from "react-i18next";
import PropTypes from "prop-types";
import TimetableIcon from "mdi-react/TimetableIcon";
import renderSelectField from "./../../../../shared/components/form/Select";
import renderDateTimePickerField from "./../../../../shared/components/form/DateTimePicker";
import renderCheckBoxField from "./../../../../shared/components/form/CheckBox";
import validate from "./../../../Form/FormValidation/components/validate";
import axios from "axios";
import Expand from "./../../../../shared/components/Expand";
import config from "./../../../../config/appConfig";
import TextareaAutosize from "react-textarea-autosize"
import { LanguageOptions, Platforms, MailType } from "../../Helper";
import setAuthHeader from "../../../../shared/components/auth/authJwt";
import { HandleError } from "../../../HandleError/HandleError";
import { CustomNotification } from "../../../UI/Notification/components/CustomNotification";

const getTimezoneOffset = new Date().getTimezoneOffset() * 60000;

const renderField = ({
  input,
  placeholder,
  type,
  meta: { touched, error },
}) => (
  <div className="form__form-group-input-wrap">
    <input {...input} placeholder={placeholder} type={type} />
    {touched && error && (
      <span className="form__form-group-error">{error}</span>
    )}
  </div>
);

renderField.propTypes = {
  input: PropTypes.shape().isRequired,
  placeholder: PropTypes.string,
  type: PropTypes.string,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    error: PropTypes.string,
  }),
};

renderField.defaultProps = {
  placeholder: "",
  meta: null,
  type: "text",
};

const StatusFormatter = (isDeleted, startDate, endDate) => {
  if (
    isDeleted === false &&
    new Date(startDate) < new Date() &&
    new Date(endDate) > new Date()
  )
    return <span className="badge badge-success">Active</span>;
  if (isDeleted === false && new Date(startDate) > new Date())
    return <span className="badge badge-warning">Coming soon</span>;
  if (
    isDeleted === true &&
    new Date(startDate) < new Date() &&
    new Date(endDate) > new Date()
  )
    return <span className="badge badge-danger">Delete</span>;
  return <span className="badge badge-danger">Expried</span>;
};

StatusFormatter.propTypes = {
  value: PropTypes.string.isRequired,
};

class MailSystem extends PureComponent {
  static propTypes = {
    t: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    reset: PropTypes.func.isRequired,
    pristine: PropTypes.bool.isRequired,
    submitting: PropTypes.bool.isRequired,
  };

  constructor() {
    super();

    this.state = {
      mailId: "",
      language: "",
      title: "",
      sender: "",
      content: "",
      gifts: "",
      startDate: new Date(new Date().getTime() + getTimezoneOffset),
      endDate: "",
      editMail: "",
      isAddMail: false,
      isEditMail: false,
      isActive: "",
      listMailSystem: [],
      platform: 2,
      countryCode: null,
      viewByLanguage: "English",
      disabledSubmit: false,
      type: null,
    };
  }

  componentDidMount() {
    setAuthHeader();
    this.getMailSystem();
  }

  getMailSystem = async () => {
    await axios
      .get(config.server_url + config.prefix_mail + config.url_mailsytem, {
        params: {
          language: this.state.viewByLanguage,
        },
      })
      .then((data) => {
        const mailList = data.data;

        mailList.forEach((index) => {
          if (index.country.length === 0) index.country = null;
          else if (index.country.length < 5)
            index.country = index.country.toString();
          else index.country = `${index.country.length} countries`;
        });
        this.setState({
          listMailSystem: mailList,
        });
        console.log(mailList);
        console.log("list mail system", this.state.listMailSystem);
      })
      .catch(function(error) {
        new HandleError(error);
        console.log(error);
      });
    
  };

  handleTitleChange(event) {
    this.setState({
      title: event.target.value,
    });
  }

  handleSenderChange(event) {
    this.setState({
      sender: event.target.value,
    });
  }

  handleActiveChange(event) {
    this.setState({
      isActive: event.value,
    });
  }

  handleChangeType(event) {
    this.setState({
      type: event.value,
    });
  }

  handleContentChange(event) {
    this.setState({
      content: event.target.value,
    });
  }

  handleGiftChange(event) {
    let giftList = event.target.value.split(",");
    let gift = {};
    if (giftList.length % 2 === 0) {
      for (let i = 0; i < giftList.length - 1; i += 2) {
        gift[giftList[i]] = giftList[i + 1];
      }
    }
    this.setState({
      gifts: gift,
    });
  }

  handlePlatformChange(event) {
    this.setState({
      platform: event.value,
    });
  }

  handleCountryCodeChange(event) {
    this.setState({
      countryCode: event.target.value,
    });
  }

  handleStartDateChange(event) {
    console.log(event);
    this.setState({
      startDate: event,
    });
  }

  handleEndDateChange(event) {
    this.setState({
      endDate: event,
    });
  }

  handleIdChange(event) {
    this.setState({
      mailId: event.target.value,
    });
  }

  handleLanguageChange(event) {
    this.setState({
      language: event.value,
    });
  }

  handleViewByLanguageChange(event) {
    this.setState(
      {
        viewByLanguage: event.value,
      },
      () => {
        this.getMailSystem();
      }
    );
  }

  onGetMailDetails(event) {
    if (event && event.target) {
      if (event.target.checked) {
        this.state.editMail = event.target.name;
        this.setState({
          isEditMail: true,
          isAddMail: false,
        });
        let mail = "";
        axios
          .post(config.server_url + config.prefix_mail + config.url_mailDetail, {
            mailId: event.target.name,
            mailType: MailType.System,
          })
          .then(function(response) {
            mail = response.data;
          })  
          .then(() => {
            console.log(mail);
            if (mail) {
              if (mail.mail[this.state.viewByLanguage])
                this.setState({
                  title: mail.mail[this.state.viewByLanguage].title,
                  content: mail.mail[this.state.viewByLanguage].content,
                });

              if (mail.countryCode.length) {
                this.setState({
                  countryCode: mail.countryCode.toString(),
                });
              }

              this.setState({
                platform: mail.platform,
                sender: mail.sender,
                startDate: new Date(
                  new Date(mail.startDate).getTime() + getTimezoneOffset
                ),
                endDate: new Date(
                  new Date(mail.endDate).getTime() + getTimezoneOffset
                ),
                isActive: mail.isDeleted ? "1" : "0",
              });
            }
          })
          .catch((error) => {
            new HandleError(error);
            console.log(error)
          });
      } else {
        
        this.setState({ isEditMail: false });
      }
    }
  }

  onCreateMail = (e) => {
    e.preventDefault();

    if (this.state.type === 1 && this.state.gifts !== "") {
      window.alert("Create mail system update no gifts");
      return;
    }

    this.setState({ disabledSubmit: true });

    let countryCode = [];
    if (this.state.countryCode) {
      const lsCode = this.state.countryCode.split(",");
      lsCode.forEach((index) => countryCode.push(index.toUpperCase()));
    }
    if (!countryCode.length) countryCode = null;

    axios
      .post(config.server_url + config.prefix_mail + config.url_mailsytem, {
        title: this.state.title,
        sender: this.state.sender,
        type: this.state.type,
        content: this.state.content,
        gifts: this.state.gifts,
        platform: this.state.platform,
        countryCode: countryCode,
        startDate: new Date(this.state.startDate - getTimezoneOffset),
        endDate: new Date(this.state.endDate - getTimezoneOffset),
      })
      .then(function(_) {
          new CustomNotification().show("success", "Success", "Add Mail Success");
      })
      .then(() => {
        this.setState({
          disabledSubmit: false,
        });
      })
      .catch((error) => {
        new HandleError(error);
        this.setState({
          disabledSubmit: false,
        });
      });
  };

  onUpdateMailClick = (e) => {
    var msg = "";

    e.preventDefault();

    let countryCode = [];
    if (this.state.countryCode) {
      const lsCode = this.state.countryCode.split(",");
      lsCode.forEach((index) => countryCode.push(index.toUpperCase()));
    }

    axios
      .put(config.server_url + config.prefix_mail + config.url_mailsytem, {
        mailId: this.state.editMail,
        language: this.state.viewByLanguage,
        sender: this.state.sender,
        title: this.state.title,
        content: this.state.content,
        countryCode: countryCode,
        platform: this.state.platform,
        startDate: new Date(this.state.startDate - getTimezoneOffset),
        endDate: new Date(this.state.endDate - getTimezoneOffset),
        isActive: this.state.isActive,
      })
      .then(function(response) {
        console.log(response);
        new CustomNotification().show("success", "Success", "Update Mail Success");
      })
      .catch((error) => {
        new HandleError(error);
      });
  };

  onReloadMailClick = (e) => {
    if(e) e.preventDefault();
    axios
      .post(config.server_url + config.prefix_mail + config.url_reloadMail)
      .then(function(response) {
          new CustomNotification().show("success", "Success", "Reload Mail Config Success");
      })
      .catch(error => {
        new HandleError(error);
      });
  };

  render() {
    const { pristine, reset, submitting } = this.props;
    const { listMailSystem } = this.state;

    return (
      <Col md={12} lg={12}>
        <Row>
          <Card>
            <CardBody>
              <form className="form">
                <Container>
                  <Row>
                    <Col md={6} xl={3}>
                      <Field
                        name="language"
                        component={renderSelectField}
                        options={LanguageOptions}
                        value={this.state.viewByLanguage}
                        placeholder="English"
                        onChange={this.handleViewByLanguageChange.bind(this)}
                      />
                    </Col>
                    <Col md={6} xl={6}></Col>
                    <Col md={6} xl={3}>
                      <div style={{ float: "left" }}>
                        <Expand
                          title="New"
                          color="primary"
                          handleClick={() => {
                            this.setState({
                              isAddMail: true,
                              isEditMail: false,
                            });
                          }}
                        />
                        <Expand
                          title="Reload Mail"
                          color="danger"
                          handleClick={this.onReloadMailClick.bind(this)}
                        />
                      </div>
                    </Col>
                  </Row>
                </Container>
              </form>
            </CardBody>
          </Card>
        </Row>
        <Row>
          <Card>
            <CardBody className="products-list">
              <div className="card__title">
                <h5 className="bold-text">List Mail System</h5>
                <h6 className="subhead">
                  Total Language Supports: {LanguageOptions.length}
                </h6>
              </div>
              <div className="table">
                <Table
                  responsive
                  className="table--bordered dashboard__table-crypto"
                >
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>_id</th>
                      <th>Title</th>
                      <th>Platform</th>
                      <th>Country</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listMailSystem.map((mail, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>

                        <td dir="ltr">{mail.id}</td>
                        <td dir="ltr">{mail.title}</td>
                        <td dir="ltr">
                          {
                            Platforms.filter(
                              (option) => option.value == mail.platform
                            )[0].label
                          }
                        </td>
                        <td>{mail.country}</td>
                        <td>{mail.startDate.slice(0, 16)}</td>
                        <td>{mail.endDate.slice(0, 16)}</td>
                        <td>
                          {StatusFormatter(
                            mail.isDeleted,
                            mail.startDate,
                            mail.endDate
                          )}
                        </td>
                        <td>
                          <Field
                            name={mail.id}
                            id={index}
                            component={renderCheckBoxField}
                            className="colored-click"
                            onChange={this.onGetMailDetails.bind(this)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </CardBody>
          </Card>
        </Row>

        {this.state.isAddMail ? (
          <Row>
            <Card>
              <CardBody>
                <div className="card__title">
                  <h5 className="bold-text">Mail System</h5>
                  <h3 className="page-subhead subhead">
                    New Mail Use Default English Language
                  </h3>
                </div>
                <form
                  className="form form--horizontal"
                  onSubmit={this.onCreateMail}
                >
                  <div className="form__form-group">
                    <span className="form__form-group-label">Title</span>
                    <div className="form__form-group-field">
                      <Field
                        name="title"
                        component={renderField}
                        type="text"
                        value={this.state.title}
                        onChange={this.handleTitleChange.bind(this)}
                        placeholder="Note: Không sử dụng các ký tự đặc biệt:  @ * / +"
                      />
                    </div>
                  </div>
                  <div className="form__form-group">
                    <span className="form__form-group-label">Sender</span>
                    <div className="form__form-group-field">
                      <Field
                        name="sender"
                        component={renderField}
                        type="text"
                        value={this.state.sender}
                        onChange={this.handleSenderChange.bind(this)}
                      />
                    </div>
                  </div>
                  <div className="form__form-group">
                    <span className="form__form-group-label">Content</span>
                    <div className="form__form-group-field">
                      <TextareaAutosize
                        name="content"
                        component={renderField}
                        type="text"
                        value={this.state.content}
                        onChange={this.handleContentChange.bind(this)}
                        placeholder="Note: Không sử dụng các ký tự đặc biệt:  @ * / +"
                      />
                    </div>
                  </div>
                  <div className="form__form-group">
                    <span className="form__form-group-label">Gifts</span>
                    <div className="form__form-group-field">
                      <Field
                        name="gifts"
                        component={renderField}
                        type="text"
                        placeholder="Optional: nhập các phần quà dạng string,number (cách nhau bởi dấu phẩy theo thứ tự là key,amount)"
                        value={this.state.gifts}
                        onChange={this.handleGiftChange.bind(this)}
                      />
                    </div>
                  </div>
                  <div className="form__form-group">
                    <span className="form__form-group-label">Country</span>
                    <div className="form__form-group-field">
                      <Field
                        name="country"
                        component={renderField}
                        value={this.state.countryCode}
                        placeholder="Optional: Nhập mã code các nước cách nhau bởi dấu ,"
                        onChange={this.handleCountryCodeChange.bind(this)}
                      />
                    </div>
                  </div>
                  <Container style={{ margin: "0 0 0 -14px" }}>
                    <Row>
                      <Col md={6} xl={4}>
                        <div className="form__form-group">
                          <span className="form__form-group-label">
                            Platform
                          </span>
                          <div className="form__form-group-field">
                            <Field
                              name="platform"
                              component={renderSelectField}
                              options={Platforms}
                              value={this.state.platform}
                              placeholder={Platforms[0].label}
                              onChange={this.handlePlatformChange.bind(this)}
                            />
                          </div>
                        </div>
                      </Col>
                      <Col md={6} xl={4}>
                        <div className="form__form-group">
                          <span className="form__form-group-label">
                            Start Date
                          </span>
                          <div className="form__form-group-field">
                            <Field
                              name="startdate"
                              component={renderDateTimePickerField}
                              defaultValue={this.state.startDate}
                              value={this.state.startDate}
                              onChange={this.handleStartDateChange.bind(this)}
                            />
                            <div className="form__form-group-icon">
                              <TimetableIcon />
                            </div>
                          </div>
                        </div>
                      </Col>
                      <Col md={6} xl={4}>
                        <div className="form__form-group">
                          <span className="form__form-group-label">
                            End Date
                          </span>
                          <div className="form__form-group-field">
                            <Field
                              name="enddate"
                              component={renderDateTimePickerField}
                              value={this.state.endDate}
                              onChange={this.handleEndDateChange.bind(this)}
                            />
                            <div className="form__form-group-icon">
                              <TimetableIcon />
                            </div>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Container>

                  <ButtonToolbar className="form__button-toolbar">
                    <Button
                      disabled={this.state.disabledSubmit}
                      color="primary"
                      type="submit"
                    >
                      Submit
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        reset();
                        this.setState({ isAddMail: false });
                      }}
                      disabled={pristine || submitting}
                    >
                      Cancel
                    </Button>
                  </ButtonToolbar>
                </form>
              </CardBody>
            </Card>
          </Row>
        ) : null}
        {this.state.isEditMail ? (
          <Row>
            <Card>
              <CardBody>
                <div className="card__title">
                  <h5 className="bold-text">Edit mail</h5>
                  <h6 className="subhead">{this.state.editMail}</h6>
                </div>
                <form
                  className="form form--horizontal"
                  onSubmit={this.onUpdateMailClick}
                >
                  <div className="form__form-group">
                    <span className="form__form-group-label">Sender</span>
                    <div className="form__form-group-field">
                      <input
                        name="sender"
                        component={renderField}
                        type="text"
                        value={this.state.sender}
                        onChange={this.handleSenderChange.bind(this)}
                      />
                    </div>
                  </div>
                  <div className="form__form-group">
                    <span className="form__form-group-label">Title</span>
                    <div className="form__form-group-field">
                      <input
                        name="title"
                        component={renderField}
                        type="text"
                        value={this.state.title}
                        onChange={this.handleTitleChange.bind(this)}
                      />
                    </div>
                  </div>

                  <div className="form__form-group">
                    <span className="form__form-group-label">Content</span>
                    <div className="form__form-group-field">
                      <TextareaAutosize
                        name="content"
                        component={renderField}
                        type="text"
                        value={this.state.content}
                        onChange={this.handleContentChange.bind(this)}
                      />
                    </div>
                  </div>
                  {/* <div className="form__form-group">
                    <span className="form__form-group-label">Gifts</span>
                    <div className="form__form-group-field">
                      <input
                        name="gifts"
                        component={renderField}
                        type="text"
                        placeholder="Optional: nhập các phần quà dạng string,number (cách nhau bởi dấu phẩy theo thứ tự là key,amount)"
                        value={this.state.gifts}
                        onChange={this.handleGiftChange.bind(this)}
                      />
                    </div>
                  </div> */}
                  <div className="form__form-group">
                    <div className="form__form-group">
                      <span className="form__form-group-label">Country</span>
                      <div className="form__form-group-field">
                        <input
                          name="country"
                          component={renderField}
                          value={this.state.countryCode}
                          placeholder="Optional: Nhập mã code các nước cách nhau bởi dấu ,"
                          onChange={this.handleCountryCodeChange.bind(this)}
                        />
                      </div>
                    </div>
                  </div>
                  <Container style={{ margin: "0 0 0 -14px" }}>
                    <Row>
                      <Col md={6} xl={4}>
                        <div className="form__form-group">
                          <span className="form__form-group-label">
                            Platform
                          </span>
                          <div className="form__form-group-field">
                            <Field
                              name="platform"
                              component={renderSelectField}
                              options={Platforms}
                              value={this.state.platform}
                              placeholder={Platforms.map((index) => {
                                if (index.value === this.state.platform)
                                  return index.label;
                              })}
                              onChange={this.handlePlatformChange.bind(this)}
                            />
                          </div>
                        </div>
                      </Col>
                      <Col md={6} xl={4}>
                        <div className="form__form-group">
                          <span className="form__form-group-label">
                            Start Date
                          </span>
                          <div className="form__form-group-field">
                            <Field
                              name="startdate"
                              component={renderDateTimePickerField}
                              value={this.state.startDate}
                              defaultValue={this.state.startDate}
                              onChange={this.handleStartDateChange.bind(this)}
                            />
                            <div className="form__form-group-icon">
                              <TimetableIcon />
                            </div>
                          </div>
                        </div>
                      </Col>
                      <Col md={6} xl={4}>
                        <div className="form__form-group">
                          <span className="form__form-group-label">
                            End Date
                          </span>
                          <div className="form__form-group-field">
                            <Field
                              name="enddate"
                              component={renderDateTimePickerField}
                              value={this.state.endDate}
                              defaultValue={this.state.endDate}
                              onChange={this.handleEndDateChange.bind(this)}
                            />
                            <div className="form__form-group-icon">
                              <TimetableIcon />
                            </div>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Container>

                  <div className="form__form-group">
                    <span className="form__form-group-label">Active</span>
                    <div className="form__form-group-field">
                      <Field
                        name="select"
                        component={renderSelectField}
                        type="text"
                        value={this.state.isActive}
                        options={[
                          { value: "0", label: "True" },
                          { value: "1", label: "False" },
                        ]}
                        placeholder={
                          this.state.isActive == "0" ? "True" : "False"
                        }
                        onChange={this.handleActiveChange.bind(this)}
                      />
                    </div>
                  </div>
                  <ButtonToolbar className="form__button-toolbar">
                    <Button color="primary" type="submit">
                      Update
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        reset();
                        this.setState({ isEditMail: false });
                      }}
                      disabled={pristine || submitting}
                    >
                      Cancel
                    </Button>
                  </ButtonToolbar>
                </form>
              </CardBody>
            </Card>
          </Row>
        ) : null}
      </Col>
    );
  }
}

export default reduxForm({
  form: "horizontal_form_validation", // a unique identifier for this form
  validate,
})(withTranslation("common")(MailSystem));
