"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ComponentCsrHeaderComponent;
var _react = _interopRequireWildcard(require("react"));
var _classnames = _interopRequireDefault(require("classnames"));
var _antd = require("antd");
var _icons = require("@ant-design/icons");
require("./styles.css");
var _componentLinkButton = _interopRequireDefault(require("@ivoyant/component-link-button"));
var _componentCache = require("@ivoyant/component-cache");
var _reactRouterDom = require("react-router-dom");
var _jsPlugin = _interopRequireDefault(require("js-plugin"));
var _moment = _interopRequireDefault(require("moment"));
var _componentFeatureFlagging = require("@ivoyant/component-feature-flagging");
var _componentMessageBus = require("@ivoyant/component-message-bus");
var _StatCard = _interopRequireDefault(require("./StatCard"));
var _BridgePay = _interopRequireDefault(require("./assets/BridgePay.png"));
var _AutoPay = _interopRequireDefault(require("./assets/AutoPay.png"));
var _Amazon = _interopRequireDefault(require("./assets/Amazon.png"));
var _iconEBB = _interopRequireDefault(require("./assets/iconEBB.svg"));
var _iconACP = _interopRequireDefault(require("./assets/iconACP.svg"));
var _EBBOrange = _interopRequireDefault(require("./assets/EBB-Orange.svg"));
var _ACPOrange = _interopRequireDefault(require("./assets/ACP-Orange.svg"));
var _EbbPopOver = _interopRequireDefault(require("./EbbPopOver"));
var _shortid = _interopRequireDefault(require("shortid"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const {
  Text
} = _antd.Typography;
const AmountDueTooltip = _ref => {
  let {
    billCycleDate,
    billDueDate
  } = _ref;
  let dueDate, dueDateDay, dueDateMonth, dueDateYear, monthString;
  if (billDueDate != false) {
    dueDateDay = parseInt(billDueDate.substr(8, 2));
    dueDateMonth = parseInt(billDueDate.substr(5, 2));
    dueDateYear = billDueDate.substr(0, 4);
    // Javascript month is zero-based, we need to subtract by 1
    dueDate = new Date(dueDateYear, dueDateMonth - 1, dueDateDay);
    monthString = dueDate.toLocaleString('default', {
      month: 'long'
    });
  } else {
    dueDateDay = parseInt(billCycleDate.substr(8, 2));
    dueDateMonth = parseInt(billCycleDate.substr(5, 2));
    dueDateYear = billCycleDate.substr(0, 4);
    // Javascript month is zero-based, we need to subtract by 1
    dueDate = new Date(dueDateYear, dueDateMonth - 1, dueDateDay);
    dueDate.setDate(dueDate.getDate() - 1);
    monthString = dueDate.toLocaleString('default', {
      month: 'long'
    });
  }
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "amount-due-tooltip flex-column font-14"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "title"
  }, "Due Date:", ' ', /*#__PURE__*/_react.default.createElement("span", {
    className: "amount-due-tooltip-amount"
  }, `${dueDateDay} ${monthString} ${dueDateYear}`)));
};
const BridgePayPopover = _ref2 => {
  let {
    bridgepayInfo,
    paymentLink
  } = _ref2;
  let {
    status
  } = bridgepayInfo;
  const {
    eligibleFor,
    startDate,
    endDate,
    amountToEnroll
  } = bridgepayInfo;
  /** To hide or disply the make payment button */
  const hideMakePayment = eligibleFor === 'None';
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "bridgepay-popover flex-column"
  }, /*#__PURE__*/_react.default.createElement("div", null, "Status :", /*#__PURE__*/_react.default.createElement("span", {
    className: (0, _classnames.default)('status', status === 'Inactive' ? 'inactive' : 'active')
  }, ' ', status)), /*#__PURE__*/_react.default.createElement("div", null, "Eligible for ", eligibleFor), startDate && endDate && /*#__PURE__*/_react.default.createElement("div", null, "Start : ", startDate, " \xA0End : ", endDate), amountToEnroll && !hideMakePayment && /*#__PURE__*/_react.default.createElement("div", null, "Amount to Enroll : $", amountToEnroll), !hideMakePayment && /*#__PURE__*/_react.default.createElement(_componentLinkButton.default, {
    className: (0, _classnames.default)('submit-button', status === 'Inactive' ? 'inactive' : 'active'),
    size: "small",
    href: paymentLink,
    routeData: {
      bridgepayInfo
    }
  }, /*#__PURE__*/_react.default.createElement("span", null, eligibleFor === 'Bridge Pay' ? 'SETUP BRIDGEPAY' : 'EXTEND BRIDGEPAY')));
};
const handleDeleteAutopayResponse = (successStates, errorStates, setProcessing, setDisabled) => (subscriptionId, topic, eventData, closure) => {
  const isSuccess = successStates.includes(eventData.value);
  const isError = errorStates.includes(eventData.value);
  if (isSuccess || isError) {
    if (isSuccess) {
      setDisabled(true);
    }
    setProcessing(false);
    _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
  }
};
const CancelAutoPay = _ref3 => {
  let {
    datasources,
    deleteAutopay,
    ban
  } = _ref3;
  const {
    datasource,
    workflow,
    responseMapping,
    successStates,
    errorStates,
    submitEvent = 'SUBMIT'
  } = deleteAutopay;
  const [processing, setProcessing] = (0, _react.useState)(false);
  const [disabled, setDisabled] = (0, _react.useState)(false);
  const initiateDeleteAutopay = () => {
    _componentMessageBus.MessageBus.subscribe(workflow, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), handleDeleteAutopayResponse(successStates, errorStates, setProcessing, setDisabled), {});
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
      header: {
        registrationId: workflow,
        workflow,
        eventType: 'INIT'
      }
    });
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.').concat(submitEvent), {
      header: {
        registrationId: workflow,
        workflow,
        eventType: submitEvent
      },
      body: {
        datasource: datasources[datasource],
        responseMapping,
        request: {
          params: {
            billingAccountNumber: ban
          }
        }
      }
    });
    setProcessing(true);
  };
  return /*#__PURE__*/_react.default.createElement(_antd.Button, {
    size: "small",
    className: "submit-button",
    danger: true,
    loading: processing,
    disabled: disabled,
    onClick: initiateDeleteAutopay
  }, "Cancel Autopay");
};
const AutoPayPopover = _ref4 => {
  let {
    autoPayStatus,
    autoPayLink,
    autoPayEnabled,
    paymentType,
    autoPayInfo,
    deleteAutopay,
    datasources,
    ban
  } = _ref4;
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "bridgepay-popover flex-column"
  }, /*#__PURE__*/_react.default.createElement("div", null, "Status :", ' ', /*#__PURE__*/_react.default.createElement("span", {
    className: (0, _classnames.default)('status', autoPayStatus === 'A' ? 'active' : 'inactive')
  }, autoPayStatus === 'A' ? 'Active' : 'Inactive')), autoPayStatus === 'A' && autoPayInfo?.paymentCard && /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, autoPayInfo.paymentCard?.paymentMethod && autoPayInfo.paymentCard?.cardNumber && /*#__PURE__*/_react.default.createElement("div", null, autoPayInfo.paymentCard?.paymentMethod, " :", ' ', autoPayInfo.paymentCard?.cardNumber), autoPayInfo?.paymentCard?.expirationMonth && /*#__PURE__*/_react.default.createElement("div", null, "Expiration :", ' ', autoPayInfo?.paymentCard?.expirationMonth?.toString()?.padStart(2, '0'), "/", autoPayInfo?.paymentCard?.expirationYear)), autoPayEnabled && /*#__PURE__*/_react.default.createElement(_antd.Row, {
    justify: "start",
    gutter: [16, 16]
  }, /*#__PURE__*/_react.default.createElement(_antd.Col, null, /*#__PURE__*/_react.default.createElement(_componentLinkButton.default, {
    className: "submit-button",
    size: "small",
    href: autoPayLink,
    routeData: {
      autoPayStatus
    }
  }, /*#__PURE__*/_react.default.createElement("span", null, autoPayStatus !== 'A' ? 'ENROLL IN AUTOPAY' : 'UPDATE ENROLLMENT'))), autoPayStatus === 'A' && /*#__PURE__*/_react.default.createElement(_antd.Col, null, /*#__PURE__*/_react.default.createElement(CancelAutoPay, {
    datasources: datasources,
    deleteAutopay: deleteAutopay,
    ban: ban
  }))));
};
const DueImmediatelyPopover = _ref5 => {
  let {
    autoPayStatus,
    banStatus,
    accountBalance = 0,
    dueImmediately = 0,
    onetimePaymentLink
  } = _ref5;
  return accountBalance > 0 || autoPayStatus !== 'A' && dueImmediately > 0 ? /*#__PURE__*/_react.default.createElement("div", {
    className: "bridgepay-popover flex-column"
  }, /*#__PURE__*/_react.default.createElement("div", null, 'Due Immediately  : $ ', banStatus === 'O' ? accountBalance : dueImmediately), /*#__PURE__*/_react.default.createElement(_componentLinkButton.default, {
    className: "submit-button",
    size: "small",
    href: onetimePaymentLink,
    routeData: {
      dueImmediately: banStatus === 'O' ? accountBalance : dueImmediately
    }
  }, /*#__PURE__*/_react.default.createElement("span", null, "ONE TIME PAYMENT"))) : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null);
};
const RecentCallerPopover = _ref6 => {
  let {
    recentInteractionCount,
    lastInteractionTime
  } = _ref6;
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "flex-column"
  }, /*#__PURE__*/_react.default.createElement(Text, {
    style: {
      color: 'white'
    }
  }, recentInteractionCount, " call", recentInteractionCount > 1 && `s`, " in the last 7 days"), /*#__PURE__*/_react.default.createElement(Text, {
    style: {
      color: 'white'
    }
  }, "Last call:", ' ', (0, _moment.default)(new Date(lastInteractionTime)).format('Do MMM YYYY')));
};

/**
 * Find the value by feature name
 * @param {Array} values
 * @param {String} property
 * @returns {object} value with feature and enable
 */
function getValueByFeature(values, property) {
  const foundValue = values && values.find(_ref7 => {
    let {
      feature
    } = _ref7;
    return feature === property;
  });
  return foundValue;
}
function ComponentCsrHeaderComponent(props) {
  const {
    data,
    component,
    datasources,
    properties,
    error
  } = props;
  const [viewStatusChange, setViewStatusChange] = (0, _react.useState)(true);
  const {
    accountTypes,
    accountSubTypes,
    accountStatuses,
    noOfDaysToShowBanStatusNew = 30,
    paymentLink,
    autoPayLink,
    onetimePaymentLink,
    quickLinks,
    featureFlagDisableKeys,
    workflows,
    disabledEbbStatuses,
    updateDatasources,
    ebbInactiveStatuses
  } = properties;
  const {
    deleteAutopay,
    resetEbbCounter
  } = workflows;
  const {
    accountBalances,
    ebbDetails,
    bridgepayInfo,
    paymentsAutopay,
    accountDetails,
    customerInfo,
    lineDetails,
    lineDetailsData,
    autoPayInfo,
    orderCount,
    promoDetails,
    deviceInfo,
    userMessages,
    interactionSummary
  } = data.data;
  // console.log('data is ', data.data);
  // let activeLines = 0;
  // lineDetails?.subscribers?.forEach((sub) => {
  //     if (sub?.subscriberDetails?.status === 'A') activeLines++;
  // });
  console.log('active', activeLines);
  const {
    autoPayType = 'Credit Card',
    autoPayStatus,
    billDueDate,
    billCycleDate,
    customerSince,
    statusDate,
    statusActvCode,
    statusActvRsnCode,
    openCases
  } = accountDetails;
  const ViewStatusDatePopover = () => {
    let banStatusMessage;
    let statusChangeDate;
    if (banStatus === 'S') {
      banStatusMessage = 'Suspended';
      statusChangeDate = statusDate;
    } else if (banStatus === 'N' || banStatus === 'C') {
      banStatusMessage = 'Cancelled';
      statusChangeDate = statusDate;
    } else if (banStatus === 'O') {
      banStatusMessage = 'Activated';
      statusChangeDate = customerSince;
    } else {
      setViewStatusChange(false);
    }
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "amount-due-tooltip flex-column font-14"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "title"
    }, banStatusMessage, " on:", ' ', /*#__PURE__*/_react.default.createElement("span", {
      className: "amount-due-tooltip-amount"
    }, statusChangeDate)));
  };
  let {
    ban,
    dueDaysLeft,
    banStatus
  } = accountDetails;
  // Hotline suspended
  if (statusActvCode === 'SUS' && statusActvRsnCode === 'CO') {
    dueDaysLeft = 0;
  }

  //Newly created account to have tentative color
  const newAccountInfo = _componentCache.cache.get('newAccountInfo');
  if (newAccountInfo && newAccountInfo.ban === window[window.sessionStorage?.tabId].NEW_BAN) {
    banStatus = 'T';
    ban = window[window.sessionStorage?.tabId].NEW_BAN;
  }
  const {
    name,
    emailAddress,
    fullAddress,
    accountType,
    accountSubType
  } = customerInfo;
  const {
    dueAmount,
    dueImmediately,
    accountBalance
  } = accountBalances;
  const bridgePayFeatureFlag = _jsPlugin.default.invoke('features.evaluate', 'bridgePay');
  const autoPayFeatureFlag = _jsPlugin.default.invoke('features.evaluate', 'autoPay', featureFlagDisableKeys);
  const {
    activeLines
  } = lineDetails;
  const cohorts = ebbDetails?.cohorts?.length > 0 && ebbDetails?.cohorts.map(e => e.toUpperCase());
  const [expanded, setExpanded] = (0, _react.useState)(false);
  const [programType, setProgramType] = (0, _react.useState)('');
  (0, _react.useEffect)(() => {
    if (cohorts.length > 0 && cohorts.includes('ACP')) {
      setProgramType('acp');
    } else if (cohorts.length > 0 && cohorts.includes('EBB')) {
      setProgramType('ebb');
    } else {
      setProgramType('');
    }
  }, [cohorts]);

  // For tags
  const banStatusColors = {
    O: '#52C41A',
    T: '#1301ff',
    S: '#FA8C16',
    N: '#F5222D',
    C: '#F5222D'
  };

  // Bridge pay and auto pay from feature flagging data
  const bridgePayEnabled = bridgePayFeatureFlag[0] && bridgePayFeatureFlag[0].enabled;
  const [autoPayEnabled, setAutoPayEnabled] = (0, _react.useState)(autoPayFeatureFlag[0] && autoPayFeatureFlag[0].enabled);
  //let autoPayEnabled = autoPayFeatureFlag[0] && autoPayFeatureFlag[0].enabled;

  const ebbData = ebbDetails?.associations?.find(_ref8 => {
    let {
      type
    } = _ref8;
    return type === 'BroadbandBenefit';
  });
  const ebbStatus = ebbData?.status?.length ? ebbData?.status[0]?.value : '';
  const ebbToken = ebbData?.inviteToken;
  /** Customer since calculated in number of days */
  const oneDay = 24 * 60 * 60 * 1000;
  const customerSinceInDays = Math.round(Math.abs((new Date(customerSince) - new Date()) / oneDay));
  const disableNewTagCondition = customerSinceInDays > noOfDaysToShowBanStatusNew || ['N'].includes(banStatus);
  const errorFound = error?.name;
  const StatusItem = _ref9 => {
    let {
      value,
      label,
      statusBadge,
      className
    } = _ref9;
    return value || value === 0 ? /*#__PURE__*/_react.default.createElement("div", {
      className: `stats-item ${className}`
    }, statusBadge ? /*#__PURE__*/_react.default.createElement("div", {
      className: "flex-row justify-content-center"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "stats-badge"
    }, "$"), /*#__PURE__*/_react.default.createElement("div", {
      className: "stats-value"
    }, value.toString())) : /*#__PURE__*/_react.default.createElement("div", {
      className: "stats-value"
    }, value.toString()), /*#__PURE__*/_react.default.createElement("div", {
      className: "stats-label"
    }, label.toString())) : /*#__PURE__*/_react.default.createElement(_antd.Tooltip, {
      title: "data not available at the moment"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "stats-item"
    }, errorFound && /*#__PURE__*/_react.default.createElement("div", {
      className: "stats-value error"
    }, /*#__PURE__*/_react.default.createElement(_icons.CloseCircleOutlined, null)), /*#__PURE__*/_react.default.createElement("div", {
      className: "stats-label"
    }, label.toString())));
  };
  const [visible, setVisible] = (0, _react.useState)(false);
  const handleOk = () => {
    window[sessionStorage.tabId]?.dispatchRedux('DATA_REQUEST', {
      loadLatest: true,
      datasources: updateDatasources
    });
    setVisible(false);
  };
  const statusIcon = (programType, ebbInactiveStatuses) => {
    const status = ebbInactiveStatuses?.includes(ebbStatus.toLowerCase());
    if (status && programType === 'acp') {
      return _ACPOrange.default;
    } else if (status && programType === 'ebb') {
      return _EBBOrange.default;
    } else {
      if (programType === 'acp') {
        return _iconACP.default;
      } else {
        return _iconEBB.default;
      }
    }
  };
  (0, _react.useEffect)(() => {
    if (banStatus === 'S') {
      setAutoPayEnabled(true);
    }
  }, [banStatus]);
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "dashboard-header-wrapper"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "dashboard-header-stats-bar"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: `ban-status-sider ban-status-bg-color-${banStatus}`
  }), viewStatusChange ? /*#__PURE__*/_react.default.createElement(_antd.Popover, {
    overlayClassName: "custom-popover",
    placement: "bottomLeft",
    content: /*#__PURE__*/_react.default.createElement(ViewStatusDatePopover, null),
    color: "black",
    trigger: "hover"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "flex-column"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "font-weight-bold font-16"
  }, name), /*#__PURE__*/_react.default.createElement("div", {
    className: "font-14 flex-row"
  }, /*#__PURE__*/_react.default.createElement("span", {
    className: `ban-status-color-${banStatus}`
  }, "BAN : ", ban), disableNewTagCondition ? null : /*#__PURE__*/_react.default.createElement(_antd.Tag, {
    className: "customer-ban-values",
    color: banStatus && banStatusColors[banStatus]
  }, "New")))) : /*#__PURE__*/_react.default.createElement("div", {
    className: "flex-column"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "font-weight-bold font-16"
  }, name), /*#__PURE__*/_react.default.createElement("div", {
    className: "font-14 flex-row"
  }, /*#__PURE__*/_react.default.createElement("span", {
    className: `ban-status-color-${banStatus}`
  }, "BAN : ", ban), disableNewTagCondition ? null : /*#__PURE__*/_react.default.createElement(_antd.Tag, {
    className: "customer-ban-values",
    color: banStatus && banStatusColors[banStatus]
  }, "New"))), /*#__PURE__*/_react.default.createElement("div", {
    className: "flex-column"
  }, /*#__PURE__*/_react.default.createElement(_antd.Tooltip, {
    placement: "topRight",
    title: "Reload account"
  }, /*#__PURE__*/_react.default.createElement(_icons.SyncOutlined, {
    className: "refresh-icon",
    onClick: () => setVisible(true)
  })), /*#__PURE__*/_react.default.createElement(_antd.Modal, {
    title: "Reload account",
    okText: "Yes",
    cancelText: "No",
    open: visible,
    onOk: handleOk,
    onCancel: () => setVisible(false)
  }, /*#__PURE__*/_react.default.createElement("p", null, "Reloading the account will cause you to lose progress. Would you like to proceed?")), /*#__PURE__*/_react.default.createElement("div", {
    onClick: () => setExpanded(!expanded),
    style: {
      marginTop: 12
    }
  }, expanded ? /*#__PURE__*/_react.default.createElement(_icons.CaretUpOutlined, null) : /*#__PURE__*/_react.default.createElement(_icons.CaretDownOutlined, null))), interactionSummary?.interactionSummary?.recentCaller && /*#__PURE__*/_react.default.createElement("div", {
    className: "flex-column"
  }, /*#__PURE__*/_react.default.createElement(_antd.Popover, {
    placement: "right",
    overlayClassName: "custom-popover",
    content: /*#__PURE__*/_react.default.createElement(RecentCallerPopover, {
      recentInteractionCount: interactionSummary?.interactionSummary?.recentInteractionCount,
      lastInteractionTime: interactionSummary?.interactionSummary?.lastInteractionTime
    }),
    color: "black",
    trigger: "hover"
  }, /*#__PURE__*/_react.default.createElement(_antd.Tag, {
    color: "red",
    className: "recent-contact-tag"
  }, "RECENT CONTACT"))), /*#__PURE__*/_react.default.createElement("div", {
    className: "stats-box"
  }, /*#__PURE__*/_react.default.createElement(_antd.Popover, {
    placement: "bottom",
    overlayClassName: "custom-popover",
    content: /*#__PURE__*/_react.default.createElement(AmountDueTooltip, {
      billCycleDate: billCycleDate,
      billDueDate: billDueDate
    }),
    color: "black",
    trigger: "hover"
  }, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(StatusItem, {
    value: dueAmount > 0 ? Number(dueAmount).toFixed(2) : dueAmount,
    statusBadge: true,
    label: "Amount Due"
  }))), dueImmediately || dueImmediately === 0 ? /*#__PURE__*/_react.default.createElement("div", {
    className: "stats-item"
  }, accountBalance > 0 || autoPayStatus !== 'A' && dueImmediately > 0 ? /*#__PURE__*/_react.default.createElement(_antd.Popover, {
    placement: "bottomLeft",
    content: /*#__PURE__*/_react.default.createElement(DueImmediatelyPopover, {
      autoPayStatus: autoPayStatus,
      banStatus: banStatus,
      accountBalance: accountBalance,
      dueImmediately: dueImmediately,
      onetimePaymentLink: onetimePaymentLink
    }),
    trigger: "hover"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "flex-row justify-content-center"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "stats-badge"
  }, "$"), /*#__PURE__*/_react.default.createElement("div", {
    className: `stats-value ${dueDaysLeft <= 5 && dueImmediately > 0 && `ban-status-color-${banStatus}`}`
  }, dueImmediately > 0 || accountBalance > 0 ? Number(banStatus === 'O' ? accountBalance : dueImmediately).toFixed(2) : 0)), /*#__PURE__*/_react.default.createElement("div", {
    className: "stats-label"
  }, "Due Immediately")) : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, ' ', /*#__PURE__*/_react.default.createElement("div", {
    className: "flex-row justify-content-center"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "stats-badge"
  }, "$"), /*#__PURE__*/_react.default.createElement("div", {
    className: `stats-value ${dueDaysLeft <= 5 && dueImmediately > 0 && `ban-status-color-${banStatus}`}`
  }, dueImmediately > 0 || accountBalance > 0 ? Number(banStatus === 'O' ? accountBalance : dueImmediately).toFixed(2) : 0)), /*#__PURE__*/_react.default.createElement("div", {
    className: "stats-label"
  }, "Due Immediately"))) : /*#__PURE__*/_react.default.createElement(StatusItem, {
    value: dueImmediately,
    statusBadge: true,
    label: "Due Immediately"
  }), /*#__PURE__*/_react.default.createElement(StatusItem, {
    value: dueDaysLeft,
    label: "Due Days Left"
  }), /*#__PURE__*/_react.default.createElement(StatusItem, {
    value: activeLines,
    label: "Active Lines"
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: "stats-item"
  }, /*#__PURE__*/_react.default.createElement(_componentFeatureFlagging.FeatureFlaggingTooltip, {
    feature: "AutoPay",
    title: !autoPayInfo?.billingAccountNumber && 'data not available at the moment',
    disabled: !autoPayInfo?.billingAccountNumber,
    featureFlag: banStatus === 'S' ? {
      enabled: true
    } : autoPayFeatureFlag[0]
  }, autoPayEnabled && autoPayInfo?.billingAccountNumber ? /*#__PURE__*/_react.default.createElement(_antd.Popover, {
    placement: "bottomLeft",
    content: /*#__PURE__*/_react.default.createElement(AutoPayPopover, {
      autoPayStatus: autoPayStatus,
      autoPayLink: autoPayLink,
      autoPayEnabled: autoPayEnabled,
      paymentType: autoPayType,
      autoPayInfo: autoPayInfo,
      deleteAutopay: deleteAutopay,
      datasources: datasources,
      ban: ban
    }),
    trigger: "hover"
  }, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
    className: (0, _classnames.default)('stats-value', !autoPayEnabled && 'inactive')
  }, /*#__PURE__*/_react.default.createElement("img", {
    src: _AutoPay.default,
    alt: "AutoPay"
  })), /*#__PURE__*/_react.default.createElement("div", {
    className: "stats-label"
  }, "AutoPay"))) : /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
    className: (0, _classnames.default)('stats-value', !autoPayEnabled && 'inactive')
  }, /*#__PURE__*/_react.default.createElement("img", {
    src: _AutoPay.default,
    alt: "AutoPay"
  })), /*#__PURE__*/_react.default.createElement("div", {
    className: "stats-label"
  }, "AutoPay")))), /*#__PURE__*/_react.default.createElement("div", {
    className: "stats-item"
  }, /*#__PURE__*/_react.default.createElement(_componentFeatureFlagging.FeatureFlaggingTooltip, {
    feature: "Bridgepay",
    title: !bridgepayInfo?.status && 'data not available at the moment',
    featureFlag: bridgePayFeatureFlag[0],
    disabled: !bridgepayInfo?.status
  }, bridgePayEnabled && bridgepayInfo?.status ? /*#__PURE__*/_react.default.createElement(_antd.Popover, {
    placement: "bottomLeft",
    content: /*#__PURE__*/_react.default.createElement(BridgePayPopover, {
      bridgepayInfo: bridgepayInfo,
      paymentLink: paymentLink
    }),
    trigger: "hover"
  }, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
    className: (0, _classnames.default)('stats-value', !bridgePayEnabled && 'inactive')
  }, /*#__PURE__*/_react.default.createElement(_antd.Badge, {
    count: /*#__PURE__*/_react.default.createElement(_icons.CheckCircleFilled, null)
  }, /*#__PURE__*/_react.default.createElement("img", {
    src: _BridgePay.default,
    alt: "BridgePay"
  }))), /*#__PURE__*/_react.default.createElement("div", {
    className: "stats-label"
  }, "BridgePay"))) : /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
    className: (0, _classnames.default)('stats-value', (!bridgePayEnabled || !bridgepayInfo?.status) && 'inactive')
  }, /*#__PURE__*/_react.default.createElement(_antd.Badge, {
    count: /*#__PURE__*/_react.default.createElement(_icons.CheckCircleFilled, null)
  }, /*#__PURE__*/_react.default.createElement("img", {
    src: _BridgePay.default,
    alt: "BridgePay"
  }))), /*#__PURE__*/_react.default.createElement("div", {
    className: "stats-label"
  }, "BridgePay")))), cohorts?.length > 0 && ebbStatus && /*#__PURE__*/_react.default.createElement("div", {
    className: "stats-item"
  }, /*#__PURE__*/_react.default.createElement(_antd.Popover, {
    placement: "bottomLeft",
    content: /*#__PURE__*/_react.default.createElement(_EbbPopOver.default, _extends({
      programType: programType,
      ebbStatus: ebbStatus,
      disabledEbbStatuses: disabledEbbStatuses,
      datasources: datasources
    }, ebbData, {
      resetEbbCounter: resetEbbCounter,
      ebbToken: ebbToken,
      channel: ebbData?.channel,
      failedRetries: ebbData?.failedRetries,
      visibleReset: ebbData?.failedRetries >= 4
    })),
    trigger: "hover"
  }, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
    className: "stats-value'"
  }, /*#__PURE__*/_react.default.createElement("img", {
    src: statusIcon(programType, ebbInactiveStatuses)
    // src={
    //     programType === 'acp'
    //         ? IconACP
    //         : IconEBB
    // }
    ,
    style: {
      width: 48,
      height: 32,
      marginTop: 6,
      marginBottom: 6
    },
    alt: programType
  })), /*#__PURE__*/_react.default.createElement("div", {
    className: "stats-label"
  }, programType.toUpperCase(), " Program")))), /*#__PURE__*/_react.default.createElement("div", {
    className: "stats-item"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "stats-value"
  }, orderCount?.reasons?.includes('Pending Order') ? 1 : 0), /*#__PURE__*/_react.default.createElement("div", {
    className: "stats-label"
  }, "Pending Orders")), /*#__PURE__*/_react.default.createElement(StatusItem, {
    value: openCases,
    label: "Open Cases"
  }), accountSubType === 'Z' && /*#__PURE__*/_react.default.createElement("div", {
    className: "stats-item"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "stats-value"
  }, /*#__PURE__*/_react.default.createElement("img", {
    src: _Amazon.default,
    alt: "Amazon"
  })), /*#__PURE__*/_react.default.createElement("div", {
    className: "stats-label"
  }, "Amazon")))), expanded && /*#__PURE__*/_react.default.createElement("div", {
    className: "dashboard-header-cards-wrapper"
  }, /*#__PURE__*/_react.default.createElement(_StatCard.default, {
    title: "Contact Details",
    items: [{
      label: /*#__PURE__*/_react.default.createElement(_icons.MailOutlined, {
        className: "text-gray"
      }),
      value: emailAddress
    }, {
      label: /*#__PURE__*/_react.default.createElement(_icons.CompassOutlined, {
        className: "text-gray"
      }),
      value: fullAddress
    }]
  }), /*#__PURE__*/_react.default.createElement(_StatCard.default, {
    title: /*#__PURE__*/_react.default.createElement("div", {
      className: "flex-row"
    }, /*#__PURE__*/_react.default.createElement("span", null, "Account No :\xA0"), /*#__PURE__*/_react.default.createElement("span", {
      className: "text-green"
    }, ban)),
    className: "account",
    items: [{
      label: 'AR Balance',
      value: `$ ${accountBalance !== undefined && accountBalance !== '' && accountBalance !== null ? Number(accountBalance).toFixed(2) : 'N/A'}`
    }, {
      label: 'Type',
      value: `${accountType ? accountTypes[accountType] : ''} / ${accountSubType ? accountSubTypes[accountSubType] : ''}`
    }, {
      label: 'Status',
      value: banStatus ? accountStatuses[banStatus] : ''
    }, {
      label: promoDetails?.promoDescription ? 'Promo Description' : '',
      value: promoDetails?.promoDescription
    }],
    isColon: true
  }), /*#__PURE__*/_react.default.createElement(_StatCard.default, {
    title: "Payments",
    items: [{
      label: 'Next Bill Cycle Date',
      value: billCycleDate
    }, {
      label: 'Next Payment Amount',
      value: `$  ${dueAmount ? Number(dueAmount).toFixed(2) : 'N/A'}`
    }, {
      label: 'Last Payment Channel',
      value: 'N/A'
    }],
    isColon: true
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: "actions-list flex-row align-items-center"
  }, /*#__PURE__*/_react.default.createElement("ul", null, quickLinks.map(ql => /*#__PURE__*/_react.default.createElement("li", {
    key: _shortid.default.generate()
  }, /*#__PURE__*/_react.default.createElement(_reactRouterDom.Link, {
    to: ql.link,
    onClick: () => setExpanded(!expanded)
  }, /*#__PURE__*/_react.default.createElement("a", null, ql.label))))))));
}
module.exports = exports.default;