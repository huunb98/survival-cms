import React, { PureComponent } from "react";
import {
  Container,
  Card,
  CardBody,
  Col,
  Button,
  ButtonToolbar,
  Row,
  Table,
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
import TextareaAutosize from "react-textarea-autosize";

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
  switch (true) {
    case isDeleted === false &&
      new Date(startDate) < new Date() &&
      new Date(endDate) > new Date():
      return <span className="badge badge-success">Active</span>;
    case isDeleted === false && new Date(startDate) > new Date():
      return <span className="badge badge-warning">Coming soon</span>;
    case isDeleted === true &&
      new Date(startDate) < new Date() &&
      new Date(endDate) > new Date():
      return <span className="badge badge-danger">Delete</span>;
    default:
      return <span className="badge badge-danger">Expried</span>;
  }
};

StatusFormatter.propTypes = {
  value: PropTypes.string.isRequired,
};

const StatusBigUpdate = (isBigUpdate) => {
  if (isBigUpdate) {
    return <span className="badge badge-warning">Yes</span>;
  } else {
    return <span className="badge badge-light">No</span>;
  }
};

StatusBigUpdate.propTypes = {
  value: PropTypes.string.isRequired,
};

class MailNotifyVersion extends PureComponent {
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
      languageTemplate: "",
      title: "",
      sender: "",
      //   bannerUrl: "",
      link: "",
      content: "",
      gifts: "",
      startDate: new Date(Date.now() + getTimezoneOffset),
      endDate: "",
      appVersion: 0,
      minVersion: 0,
      relativeVersion: 0,
      mailIdActive: {},
      isAddMail: false,
      isAddLanguage: false,
      addBigUpdate: false,
      updateTemplate: false,
      isEditMail: false,
      lsAppVersion: [],
      isActive: "",
      listMailNotifySystem: [],
      viewByLanguage: "English",
      editMail: "",
      platform: 2,
      disabledSubmit: false,
    };
  }

  componentDidMount() {
    this.getMailSystem();
  }

  getMailSystem = async () => {
    await axios
      .post(config.mail_url_test + config.url_getMailSystem, {
        adminMail: sessionStorage.getItem("userID"),
        passWord: sessionStorage.getItem("passWord"),
        language: this.state.viewByLanguage,
        isMailNotifyVerison: true,
      })
      .then((resposne) => {
        let listMailNotify = resposne.data.Body.data;

        if (listMailNotify.length) {
          let lsActive = {};
          let listAppVersion = []
          for (let mail of listMailNotify) {
            if (
              !mail.isDeleted &&
              new Date(mail.startDate) < new Date() &&
              new Date(mail.endDate) > new Date()
            ) {
              lsActive[mail.platform.toString()] = {
                id: mail.id,
                platform: mail.platform,
                appVersion: mail.Version
              };
              listAppVersion.push(mail.Version)
            }
          } 
          this.setState({
            lsAppVersion: listAppVersion,
            mailIdActive: lsActive,
            listMailNotifySystem: listMailNotify,
          });
  
          console.log(this.state.mailIdActive);
          for (let mail of listMailNotify) {
            if (mail.isBigUpdate && new Date(mail.startDate) < new Date()) {
              this.setState({ relativeVersion: mail.Version });
              break;
            }
          }
        }
      })
      .catch(function(error) {
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

  handleBannerUrlChange(event) {
    this.setState({
      bannerUrl: event.target.value,
    });
  }

  handleLinkChange(event) {
    this.setState({
      link: event.target.value,
    });
  }

  handlePlatformChange(event) {
    this.setState({
      platform: event.value,
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

  handleStartDateChange(event) {
    this.setState({
      startDate: event,
    });
  }

  handleEndDateChange(event) {
    this.setState({
      endDate: event,
    });
  }

  handleAppVersionChange(event) {
    this.setState({
      appVersion: event.target.value,
    });
    if (this.state.addBigUpdate) {
      this.setState({
        relativeVersion: event.target.value,
      });
    }
  }

  handleMinVersionChange(event) {
    this.setState({
      minVersion: event.target.value,
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

  handleLanguageTemplateChange(event) {
    this.setState({
      languageTemplate: event.value,
    });
    let template = "";
    axios
      .post(config.mail_url_test + config.url_templateByLanguage, {
        adminMail: sessionStorage.getItem("userID"),
        passWord: sessionStorage.getItem("passWord"),
        language: event.value,
      })
      .then(function(response) {
        if (response.data.Status === 1) {
          template = response.data.Body;
        }
      })
      .then(() => {
        if (template) {
          this.setState({ title: template.title, content: template.content });
        }
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

  handleActiveChange(event) {
    this.setState({
      isActive: event.value,
    });
  }

  onGetMailDetails(event) {
    if (event && event.target) {
      if (event.target.checked) {
        this.state.editMail = event.target.name;
        this.setState({
          isEditMail: true,
          isAddLanguage: false,
          isAddMail: false,
          updateTemplate: false,
          addBigUpdate: false,
        });
        let mail = "";
        axios
          .post(config.mail_url_test + config.url_findMail, {
            adminMail: sessionStorage.getItem("userID"),
            passWord: sessionStorage.getItem("passWord"),
            mailId: event.target.name,
            isSystemMail: true,
          })
          .then(function(response) {
            if (response.data.Status === 1) {
              mail = response.data.Body;
            }
          })
          .then(() => {
            if (mail) {
              if (mail.mail[this.state.viewByLanguage]) {
                this.setState({
                  title: mail.mail[this.state.viewByLanguage].title,
                  content: mail.mail[this.state.viewByLanguage].content,
                });
              }

              this.setState({
                link: mail.link,
                platform: mail.platform,
                //    bannerUrl: mail.bannerUrl,
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
          });
      } else {
        this.setState({ isEditMail: false });
      }
    }
  }

  onCreateMailClick = (e) => {
    var msg = "";
    let isSuccess = false;
    e.preventDefault();

    const notValid = this.validateInput(this.state.appVersion, this.state.minVersion, this.state.relativeVersion, this.state.lsAppVersion);
    if(notValid) {
    window.alert('Invalid paramater');
    return;
    }

    this.setState({ disabledSubmit: true });
    axios
      .post(config.mail_url_test + config.url_addMail, {
        adminMail: sessionStorage.getItem("userID"),
        passWord: sessionStorage.getItem("passWord"),
        title: this.state.title,
        sender: this.state.sender,
        bannerUrl: this.state.bannerUrl,
        link: this.state.link,
        content: this.state.content,
        gifts: this.state.gifts,
        startDate: new Date(this.state.startDate - getTimezoneOffset),
        endDate: new Date(this.state.endDate - getTimezoneOffset),
        appVersion: this.state.appVersion,
        minVersion: this.state.minVersion,
        relativeVersion: this.state.relativeVersion,
        platform: this.state.platform,
        isSystemMail: true,
      })
      .then(function(response) {
        if (response.data.Status === 1) {
          msg = "Add Mail Success";
          isSuccess = true;
        } else msg = `Add Mail Err: ${response.data.Body.Err}`;
      })
      .then(() => {
        window.alert(msg);
        if (isSuccess) this.disabledMail();
        this.setState({
          disabledSubmit: false,
        });
      })
      .catch((err) => console.log(err));
  };

  validateInput(appVersion, minVersion, relativeVersion, lsAppVersion) {
    if(!appVersion || !minVersion || !relativeVersion) return true;
    if(lsAppVersion.includes(appVersion)) return true;
     return false
  }

  disabledMail() {
    console.log("disable mail");
    let lsMailId = [];
    let lsMail = [ this.state.mailIdActive["2"],  this.state.mailIdActive["0"],  this.state.mailIdActive["1"]]
    if (this.state.platform === 2) { 
      lsMail.forEach(index => {
        if(index) lsMailId.push(index.id)
      })
    }
    else {
      if(lsMail[0]) lsMailId.push(lsMail[0].id);
      if(this.state.mailIdActive[this.state.platform.toString])  lsMailId.push(this.state.mailIdActive[this.state.platform.toString].id);
    }
    console.log("-----------ls mail active", lsMailId);
    lsMailId.forEach((id) => {
      if (id) {
        axios
          .post(config.mail_url_test + config.url_disableMail, {
            mailID: id,
            isSystemMail: true,
          })
          .catch((error) => console.log(error));
      }
    });

    // axios.post(config.mail_url_test + config.url_disableMail, {
    //   mailID: this.state.isA
    // })
  }

  onAddLanguageClick = (e) => {
    var msg = "";
    e.preventDefault();
    axios
      .post(config.mail_url_test + config.url_addLanguageMail, {
        adminMail: sessionStorage.getItem("userID"),
        passWord: sessionStorage.getItem("passWord"),
        mailId: this.state.mailId,
        language: this.state.language,
        title: this.state.title,
        sender: this.state.sender,
        bannerUrl: this.state.bannerUrl,
        link: this.state.link,
        content: this.state.content,
        gifts: this.state.gifts,
        isSystemMail: true,
      })
      .then(function(response) {
        if (response.data.Status === 1) {
          msg = "Update Mail Success";
        } else {
          msg = `Update Mail Err: ${response.data.Body.Err}`;
        }
      })
      .then(() => {
        window.alert(msg);
      });
  };

  onUpdateTemplateClick = (e) => {
    var msg = "";
    e.preventDefault();
    axios
      .post(config.mail_url_test + config.url_updateTemplateReward, {
        adminMail: sessionStorage.getItem("userID"),
        passWord: sessionStorage.getItem("passWord"),
        language: this.state.languageTemplate,
        title: this.state.title,
        content: this.state.content,
      })
      .then(function(response) {
        if (response.data.Status === 1) {
          msg = "Update template reward success";
        } else {
          msg = `Update template reward err: ${response.data.Body.Err}`;
        }
      })
      .then(() => {
        window.alert(msg);
      });
  };

  onUpdateMailClick = (e) => {
    var msg = "";
    e.preventDefault();
    axios
      .post(config.mail_url_test + config.url_updateMail, {
        adminMail: sessionStorage.getItem("userID"),
        passWord: sessionStorage.getItem("passWord"),
        mailId: this.state.editMail,
        sender: this.state.sender,
        language: this.state.viewByLanguage,
        title: this.state.title,
        content: this.state.content,
        bannerUrl: this.state.bannerUrl,
        link: this.state.link,
        platform: this.state.platform,
        startDate: new Date(this.state.startDate - getTimezoneOffset),
        endDate: new Date(this.state.endDate - getTimezoneOffset),
        isActive: this.state.isActive,
        isSystemMail: true,
      })
      .then(function(response) {
        if (response.data.Status === 1) {
          msg = "Update Mail Success";
        } else {
          msg = `Update Mail Err: ${response.data.Body}`;
        }
      })
      .then(() => {
        window.alert(msg);
      });
  };

  render() {
    const { pristine, reset, submitting } = this.props;
    const { listMailNotifySystem } = this.state;

    const LanguageOptions = [
      { value: "English", label: "English" },
      { value: "Vietnamese", label: "Vietnamese" },
      { value: "Russian", label: "Russian" },
      { value: "Spanish", label: "Spanish" },
      { value: "French", label: "French" },
      { value: "Japanese", label: "Japanese" },
      { value: "Korean", label: "Korean" },
      { value: "Thai", label: "Thai" },
      { value: "Arabic", label: "Arabic" },
      { value: `Chinese (Traditional)`, label: "Chinese" },
      { value: "Portuguese", label: "Portuguese" },
      { value: "German", label: "German" },
      { value: "Italian", label: "Italian" },
      { value: "Indonesian", label: "Indonesian" },
      { value: "Turkish", label: "Turkish" },
    ];

    const Platforms = [
      { value: 2, label: "All" },
      { value: 0, label: "Android" },
      { value: 1, label: "IOS" },
    ];

    return (
      <Col md={12} lg={12} xl={12}>
        <Row>
          <div style={{ float: "left" }}>
            <Expand
              title="Update Template"
              color="primary"
              handleClick={() => {
                this.setState({
                  updateTemplate: true,
                  isAddMail: false,
                  isAddLanguage: false,
                  isBigUpdate: false,
                  isEditMail: false,
                });
              }}
            />
          </div>
        </Row>
        <Row>
          <Card>
            <CardBody className="products-list">
              <div className="card__title">
                <h5 className="bold-text">List Mail Notify Update Version</h5>
                <h6 className="subhead">
                  Total Language Supports: {LanguageOptions.length}
                </h6>
                <div style={{ float: "right" }}>
                  <Field
                    name="viewbylanguage"
                    component={renderSelectField}
                    options={LanguageOptions}
                    value={this.state.viewByLanguage}
                    onChange={this.handleViewByLanguageChange.bind(this)}
                  />
                  <Expand
                    title="New"
                    color="secondary"
                    handleClick={() => {
                      this.setState({
                        isAddMail: true,
                        isAddLanguage: false,
                        updateTemplate: false,
                        isEditMail: false,
                      });
                    }}
                  />
                  <Expand
                    title="Add language"
                    color="primary"
                    handleClick={() => {
                      this.setState({
                        isAddMail: false,
                        isAddLanguage: true,
                        updateTemplate: false,
                        isEditMail: false,
                      });
                    }}
                  />
                </div>
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
                      <th>Version</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Min Version</th>
                      <th>Big Update</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listMailNotifySystem.map((mail, index) => (
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
                        <td dir="ltr">{mail.Version}</td>
                        <td>{mail.startDate.slice(0, 16)}</td>
                        <td>{mail.endDate.slice(0, 16)}</td>
                        <td>{mail.MinVersion}</td>
                        <td> {StatusBigUpdate(mail.isBigUpdate)}</td>
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
                  <h5 className="bold-text">Mail Notify Update</h5>
                  <h3 className="page-subhead subhead">
                    New Mail Use Default English Language
                  </h3>
                </div>
                <div style={{ float: "non" }}>
                  <Expand
                    title="Big Update"
                    color="secondary"
                    handleClick={() => {
                      this.setState({
                        addBigUpdate: true,
                      });
                    }}
                  />
                  <Expand
                    title="Normal"
                    color="primary"
                    handleClick={() => {
                      this.setState({
                        addBigUpdate: false,
                      });
                    }}
                  />
                </div>
                <form
                  className="form form--horizontal"
                  onSubmit={this.onCreateMailClick}
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
                  {/* <div className="form__form-group">
                    <span className="form__form-group-label">Banner Url</span>
                    <div className="form__form-group-field">
                      <Field
                        name="bannerurl"
                        component={renderField}
                        type="text"
                        value={this.state.bannerUrl}
                        onChange={this.handleBannerUrlChange.bind(this)}
                        placeholder="Optional"
                      />
                    </div>
                  </div> */}
                  <div className="form__form-group">
                    <span className="form__form-group-label">Link</span>
                    <div className="form__form-group-field">
                      <Field
                        name="link"
                        component={renderField}
                        type="text"
                        defaultValue="https://www.facebook.com/jackalsquad"
                        value={this.state.link}
                        onChange={this.handleLinkChange.bind(this)}
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
                  {this.state.addBigUpdate ? (
                    <div className="form__form-group">
                      <span className="form__form-group-label">Gifts</span>
                      <div className="form__form-group-field">
                        <Field
                          name="gifts"
                          component="input"
                          type="text"
                          placeholder="Nhập các phần quà dạng string,number (cách nhau bởi dấu phẩy theo thứ tự là key,amount)"
                          value={this.state.gifts}
                          onChange={this.handleGiftChange.bind(this)}
                        />
                      </div>
                    </div>
                  ) : null}
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
                            App Version
                          </span>
                          <div className="form__form-group-field">
                            <Field
                              name="appversion"
                              component={renderField}
                              type="text"
                              value={this.state.appVersion}
                              onChange={this.handleAppVersionChange.bind(this)}
                            />
                          </div>
                        </div>
                      </Col>
                      <Col md={6} xl={4}>
                        <div className="form__form-group">
                          <span className="form__form-group-label">
                            Min Version
                          </span>
                          <div className="form__form-group-field">
                            <Field
                              name="minversion"
                              component={renderField}
                              type="text"
                              value={this.state.minVersion}
                              onChange={this.handleMinVersionChange.bind(this)}
                            />
                          </div>
                        </div>
                      </Col>
                    </Row>
                    <Row>
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
        {this.state.isAddLanguage ? (
          <Row>
            <Card>
              <CardBody>
                <div className="card__title">
                  <h5 className="bold-text">Mail Notify</h5>
                  <h3 className="page-subhead subhead">
                    Add Language for Mail Notify
                  </h3>
                </div>
                <form
                  className="form form--horizontal"
                  onSubmit={this.onAddLanguageClick}
                >
                  <div className="form__form-group">
                    <span className="form__form-group-label">Mail Id</span>
                    <div className="form__form-group-field">
                      <Field
                        name="mailId"
                        component={renderField}
                        type="text"
                        value={this.state.title}
                        onChange={this.handleIdChange.bind(this)}
                      />
                    </div>
                  </div>
                  <div className="form__form-group">
                    <span className="form__form-group-label">Language</span>
                    <div className="form__form-group-field">
                      <Field
                        name="language"
                        component={renderSelectField}
                        options={LanguageOptions}
                        value={this.state.language}
                        onChange={this.handleLanguageChange.bind(this)}
                      />
                    </div>
                  </div>
                  <div className="form__form-group">
                    <span className="form__form-group-label">Title</span>
                    <div className="form__form-group-field">
                      <Field
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

                  <ButtonToolbar className="form__button-toolbar">
                    <Button color="primary" type="submit">
                      Update
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        reset();
                        this.setState({ isAddLanguage: false });
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
        {this.state.updateTemplate ? (
          <Row>
            <Card>
              <CardBody>
                <div className="card__title">
                  <h5 className="bold-text">Template Reward</h5>
                  <h3 className="page-subhead subhead">
                    Update Language for mail reward update new app version
                  </h3>
                </div>
                <form
                  className="form form--horizontal"
                  onSubmit={this.onUpdateTemplateClick}
                >
                  <div className="form__form-group">
                    <span className="form__form-group-label">Language</span>
                    <div className="form__form-group-field">
                      <Field
                        name="language"
                        component={renderSelectField}
                        options={LanguageOptions}
                        value={this.state.languageTemplate}
                        onChange={this.handleLanguageTemplateChange.bind(this)}
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

                  <ButtonToolbar className="form__button-toolbar">
                    <Button color="primary" type="submit">
                      Update
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        reset();
                        this.setState({ updateTemplate: false });
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
                    <span className="form__form-group-label">Banner Url</span>
                    <div className="form__form-group-field">
                      <input
                        name="bannerurl"
                        component={renderField}
                        type="text"
                        value={this.state.bannerUrl}
                        onChange={this.handleBannerUrlChange.bind(this)}
                        placeholder="Optional"
                      />
                    </div>
                  </div> */}
                  <div className="form__form-group">
                    <span className="form__form-group-label">Link</span>
                    <div className="form__form-group-field">
                      <input
                        name="link"
                        component={renderField}
                        type="text"
                        value={this.state.link}
                        onChange={this.handleLinkChange.bind(this)}
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
})(withTranslation("common")(MailNotifyVersion));