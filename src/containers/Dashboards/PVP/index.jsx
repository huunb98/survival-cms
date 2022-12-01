import React, { PureComponent } from 'react';
import { Col, Container, Row } from 'reactstrap';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import PVPView from './components/PVPView';

//import PlaceOrder from './components/PlaceOrder';
import { deleteCryptoTableData } from '../../../redux/actions/cryptoTableActions';
import { CryptoTableProps } from '../../../shared/prop-types/TablesProps';
import { ThemeProps, RTLProps } from '../../../shared/prop-types/ReducerProps';
import config from '../../../config/appConfig';
import axios from 'axios';
var winRateIndex = 0;
class CryptoDashboard extends PureComponent {
  static propTypes = {
    t: PropTypes.func.isRequired,
    cryptoTable: CryptoTableProps.isRequired,
    dispatch: PropTypes.func.isRequired,
    rtl: RTLProps.isRequired,
    theme: ThemeProps.isRequired,
  };

  constructor() {
    super();
    this.state = {
      listPVP: [],
    };
  }
  componentDidMount() {
    var lsPVP = [];

    axios
      .post(config.base_url + config.url_getUserLeaderboard, {
        userID: sessionStorage.getItem('userID'),
        LeaderboardName: 'PVP'
      })
      .then(function(response) {
        console.log(response);
        if (response.status === 200) {
          let data = response.data;
          if (data.status === 'ok') {
            lsPVP = data.data;
          }
        }
      })
      .catch(function(error) {
        console.log(error);
      })
      .then(() => {
        this.setState({
            listPVP: lsPVP.map((item) => {
            let user = {};
            user.UserId = item.UserId;
            user.DisplayName = item.PlayerData.DisplayName;
            user.Score = item.Score;
            return user;
          }),
          //lsPackageIAP: lsPackage,
        });
      });
  }

  onDeleteCryptoTableData = (index, e) => {
    const { dispatch, cryptoTable } = this.props;
    e.preventDefault();
    const arrayCopy = [...cryptoTable];
    arrayCopy.splice(index, 1);
    dispatch(deleteCryptoTableData(arrayCopy));
  };

  render() {
    const { t, cryptoTable, rtl, theme } = this.props;

    // var chartStage;
    // if (this.state.lsWinrate.length > 1)
    //   chartStage = <BtcEth data={this.state.lsWinrate} theme={theme.className} callback={this.onStageCallback} />;

    return (
      <Container className='dashboard'>
        <Row>
          <Col md={12}>
            <h3 className='page-title'>Jackal Leaderboard</h3>
          </Col>
        </Row>

        <Row>
          <PVPView title='PVP' lsCountryIAP={this.state.listPVP} />
          {/* <LeaderboardView title='BossScore' lsCountryIAP={this.state.lsPackageIAP} /> */}
          {/* {chartStage} */}

          {/* <TopTen cryptoTable={cryptoTable} onDeleteCryptoTableData={this.onDeleteCryptoTableData} /> */}
        </Row>
      </Container>
    );
  }
}

export default connect((state) => ({
  cryptoTable: state.cryptoTable.items,
  rtl: state.rtl,
  theme: state.theme,
}))(withTranslation('common')(CryptoDashboard));
