"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _helperPluginUtils() {
  const data = require("@babel/helper-plugin-utils");

  _helperPluginUtils = function _helperPluginUtils() {
    return data;
  };

  return data;
}

function _regexpuCore() {
  const data = _interopRequireDefault(require("regexpu-core"));

  _regexpuCore = function _regexpuCore() {
    return data;
  };

  return data;
}

function regex() {
  const data = _interopRequireWildcard(require("@babel/helper-regex"));

  regex = function regex() {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (0, _helperPluginUtils().declare)(api => {
  api.assertVersion(7);
  return {
    visitor: {
      RegExpLiteral({
        node
      }) {
        if (!regex().is(node, "u")) return;
        node.pattern = (0, _regexpuCore().default)(node.pattern, node.flags);
        regex().pullFlag(node, "u");
      }

    }
  };
});

exports.default = _default;