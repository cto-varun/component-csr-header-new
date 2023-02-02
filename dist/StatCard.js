"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = StatCard;
var _react = _interopRequireDefault(require("react"));
var _antd = require("antd");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function StatCard(_ref) {
  let {
    title,
    items,
    isColon,
    className
  } = _ref;
  return /*#__PURE__*/_react.default.createElement(_antd.Card, {
    size: "small",
    className: `stat-card ${className}`
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "title"
  }, title), /*#__PURE__*/_react.default.createElement("div", {
    className: "stats-wrapper"
  }, items.map((item, index) => item.label ? /*#__PURE__*/_react.default.createElement(_react.default.Fragment, {
    key: index
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "stat-label"
  }, item.label), /*#__PURE__*/_react.default.createElement("div", {
    className: "stat-value"
  }, isColon && /*#__PURE__*/_react.default.createElement("span", {
    style: {
      marginRight: 12
    }
  }, ":"), item.value), ' ') : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null))));
}
module.exports = exports.default;