"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = EBBPopover;
var _react = _interopRequireWildcard(require("react"));
var _componentLinkButton = _interopRequireDefault(require("@ivoyant/component-link-button"));
var _classnames = _interopRequireDefault(require("classnames"));
var _componentMessageBus = require("@ivoyant/component-message-bus");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function EBBPopover(_ref) {
  let {
    id,
    ebbStatus,
    enrollmentDate,
    disabledEbbStatuses,
    resetEbbCounter,
    datasources,
    ebbToken,
    visibleReset,
    channel,
    failedRetries,
    programType
  } = _ref;
  const [showReset, setShowReset] = (0, _react.useState)(visibleReset);
  const hideDeEnroll = ['Inactive', 'Error'];
  const resetCounter = () => {
    const {
      datasource,
      workflow,
      responseMapping,
      successStates,
      errorStates,
      submitEvent = 'SUBMIT'
    } = resetEbbCounter;
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
      header: {
        registrationId: workflow,
        workflow,
        eventType: 'INIT'
      }
    });
    _componentMessageBus.MessageBus.subscribe(workflow, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), handleResetCounterResponse(successStates, errorStates));
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.').concat(submitEvent), {
      header: {
        registrationId: workflow,
        workflow,
        eventType: submitEvent
      },
      body: {
        datasource: datasources[datasource],
        request: {
          params: {
            token: ebbToken
          }
        },
        responseMapping
      }
    });
  };
  const handleResetCounterResponse = (successStates, errorStates) => (subscriptionId, topic, eventData, closure) => {
    const isSuccess = successStates.includes(eventData.value);
    const isError = errorStates.includes(eventData.value);
    if (isSuccess || isError) {
      if (isSuccess) {
        setShowReset(false);
      }
      _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
    }
  };
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "bridgepay-popover flex-column"
  }, /*#__PURE__*/_react.default.createElement("div", null, programType === 'acp' ? 'AFFORDABLE CONNECTIVITY PROGRAM' : 'EMERGENCY BROADBAND BENEFIT PROGRAM', ' '), ebbStatus && /*#__PURE__*/_react.default.createElement("div", null, "Current Status :", ' ', /*#__PURE__*/_react.default.createElement("span", {
    className: `status ${disabledEbbStatuses?.includes(ebbStatus) ? 'Inactive' : ebbStatus}`
  }, ebbStatus)), id && /*#__PURE__*/_react.default.createElement("div", null, "Enrollment ID : ", id), enrollmentDate && /*#__PURE__*/_react.default.createElement("div", null, "Enrollment Date : ", enrollmentDate), channel && /*#__PURE__*/_react.default.createElement("div", null, "Incoming Channel: ", channel), failedRetries && /*#__PURE__*/_react.default.createElement("div", null, "Number of failed attempts: ", failedRetries), /*#__PURE__*/_react.default.createElement("div", {
    className: "ebb-buttons-container"
  }, !disabledEbbStatuses?.includes(ebbStatus) && /*#__PURE__*/_react.default.createElement(_componentLinkButton.default, {
    className: (0, _classnames.default)('submit-button'),
    type: "primary",
    size: "small",
    href: "/dashboards/ebb-enrollment"
  }, /*#__PURE__*/_react.default.createElement("span", null, "View Form")), showReset && /*#__PURE__*/_react.default.createElement(_componentLinkButton.default, {
    className: (0, _classnames.default)('submit-button'),
    type: "primary",
    size: "small",
    onClick: resetCounter
  }, /*#__PURE__*/_react.default.createElement("span", null, "Reset")), /*#__PURE__*/_react.default.createElement(_componentLinkButton.default, {
    className: (0, _classnames.default)('submit-button'),
    type: "default",
    size: "small",
    href: "/dashboards/history-board#enrollments",
    routeData: {
      currentTab: 2
    }
  }, /*#__PURE__*/_react.default.createElement("span", null, "View History")), !hideDeEnroll?.includes(ebbStatus) && /*#__PURE__*/_react.default.createElement(_componentLinkButton.default, {
    className: (0, _classnames.default)('submit-button'),
    type: "danger",
    size: "small",
    href: "/dashboards/ebb-de-enrollment"
  }, /*#__PURE__*/_react.default.createElement("span", null, "De-enroll"))));
}
module.exports = exports.default;