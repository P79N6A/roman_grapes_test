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

function _pluginSyntaxFunctionSent() {
  const data = _interopRequireDefault(require("@babel/plugin-syntax-function-sent"));

  _pluginSyntaxFunctionSent = function _pluginSyntaxFunctionSent() {
    return data;
  };

  return data;
}

function _helperWrapFunction() {
  const data = _interopRequireDefault(require("@babel/helper-wrap-function"));

  _helperWrapFunction = function _helperWrapFunction() {
    return data;
  };

  return data;
}

function _core() {
  const data = require("@babel/core");

  _core = function _core() {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (0, _helperPluginUtils().declare)(api => {
  api.assertVersion(7);

  const isFunctionSent = node => _core().types.isIdentifier(node.meta, {
    name: "function"
  }) && _core().types.isIdentifier(node.property, {
    name: "sent"
  });

  const hasBeenReplaced = (node, sentId) => _core().types.isAssignmentExpression(node) && _core().types.isIdentifier(node.left, {
    name: sentId
  });

  const yieldVisitor = {
    Function(path) {
      path.skip();
    },

    YieldExpression(path) {
      if (!hasBeenReplaced(path.parent, this.sentId)) {
        path.replaceWith(_core().types.assignmentExpression("=", _core().types.identifier(this.sentId), path.node));
      }
    },

    MetaProperty(path) {
      if (isFunctionSent(path.node)) {
        path.replaceWith(_core().types.identifier(this.sentId));
      }
    }

  };
  return {
    inherits: _pluginSyntaxFunctionSent().default,
    visitor: {
      MetaProperty(path, state) {
        if (!isFunctionSent(path.node)) return;
        const fnPath = path.getFunctionParent();

        if (!fnPath.node.generator) {
          throw new Error("Parent generator function not found");
        }

        const sentId = path.scope.generateUid("function.sent");
        fnPath.traverse(yieldVisitor, {
          sentId
        });
        fnPath.node.body.body.unshift(_core().types.variableDeclaration("let", [_core().types.variableDeclarator(_core().types.identifier(sentId), _core().types.yieldExpression())]));
        (0, _helperWrapFunction().default)(fnPath, state.addHelper("skipFirstGeneratorNext"));
      }

    }
  };
});

exports.default = _default;