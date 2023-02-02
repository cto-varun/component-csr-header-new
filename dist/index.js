"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _csrHeader = _interopRequireDefault(require("./csr-header"));
var _csrHeader2 = require("./csr-header.schema");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var _default = {
  component: _csrHeader.default,
  schema: _csrHeader2.schema,
  ui: _csrHeader2.ui
};
exports.default = _default;
module.exports = exports.default;