"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _builtInDefinitions = require("./built-in-definitions");

var _debug = require("./debug");

var _utils = require("./utils");

function has(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function getType(target) {
  if (Array.isArray(target)) return "array";
  return typeof target;
}

function _default({
  types: t
}) {
  function addImport(path, builtIn, builtIns) {
    if (builtIn && !builtIns.has(builtIn)) {
      builtIns.add(builtIn);
      (0, _utils.createImport)(path, builtIn);
    }
  }

  function addUnsupported(path, polyfills, builtIn, builtIns) {
    if (Array.isArray(builtIn)) {
      for (var _iterator = builtIn, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
        var _ref;

        if (_isArray) {
          if (_i >= _iterator.length) break;
          _ref = _iterator[_i++];
        } else {
          _i = _iterator.next();
          if (_i.done) break;
          _ref = _i.value;
        }

        const i = _ref;

        if (polyfills.has(i)) {
          addImport(path, i, builtIns);
        }
      }
    } else {
      if (polyfills.has(builtIn)) {
        addImport(path, builtIn, builtIns);
      }
    }
  }

  const addAndRemovePolyfillImports = {
    ImportDeclaration(path) {
      if (path.node.specifiers.length === 0 && (0, _utils.isPolyfillSource)(path.node.source.value)) {
        console.warn(`
  When setting \`useBuiltIns: 'usage'\`, polyfills are automatically imported when needed.
  Please remove the \`import '@babel/polyfill'\` call or use \`useBuiltIns: 'entry'\` instead.`);
        path.remove();
      }
    },

    Program: {
      enter(path) {
        path.get("body").forEach(bodyPath => {
          if ((0, _utils.isRequire)(t, bodyPath)) {
            console.warn(`
  When setting \`useBuiltIns: 'usage'\`, polyfills are automatically imported when needed.
  Please remove the \`require('@babel/polyfill')\` call or use \`useBuiltIns: 'entry'\` instead.`);
            bodyPath.remove();
          }
        });
      }

    },

    ReferencedIdentifier(path, state) {
      const node = path.node,
            parent = path.parent,
            scope = path.scope;
      if (t.isMemberExpression(parent)) return;
      if (!has(_builtInDefinitions.definitions.builtins, node.name)) return;
      if (scope.getBindingIdentifier(node.name)) return;
      const builtIn = _builtInDefinitions.definitions.builtins[node.name];
      addUnsupported(path, state.opts.polyfills, builtIn, this.builtIns);
    },

    CallExpression(path) {
      if (path.node.arguments.length) return;
      const callee = path.node.callee;
      if (!t.isMemberExpression(callee)) return;
      if (!callee.computed) return;

      if (!path.get("callee.property").matchesPattern("Symbol.iterator")) {
        return;
      }

      addImport(path, "web.dom.iterable", this.builtIns);
    },

    BinaryExpression(path) {
      if (path.node.operator !== "in") return;
      if (!path.get("left").matchesPattern("Symbol.iterator")) return;
      addImport(path, "web.dom.iterable", this.builtIns);
    },

    YieldExpression(path) {
      if (!path.node.delegate) return;
      addImport(path, "web.dom.iterable", this.builtIns);
    },

    MemberExpression: {
      enter(path, state) {
        if (!path.isReferenced()) return;
        const node = path.node;
        const obj = node.object;
        const prop = node.property;
        if (!t.isReferenced(obj, node)) return;
        let instanceType;
        let evaluatedPropType = obj.name;
        let propName = prop.name;

        if (node.computed) {
          if (t.isStringLiteral(prop)) {
            propName = prop.value;
          } else {
            const res = path.get("property").evaluate();

            if (res.confident && res.value) {
              propName = res.value;
            }
          }
        }

        if (path.scope.getBindingIdentifier(obj.name)) {
          const result = path.get("object").evaluate();

          if (result.value) {
            instanceType = getType(result.value);
          } else if (result.deopt && result.deopt.isIdentifier()) {
            evaluatedPropType = result.deopt.node.name;
          }
        }

        if (has(_builtInDefinitions.definitions.staticMethods, evaluatedPropType)) {
          const staticMethods = _builtInDefinitions.definitions.staticMethods[evaluatedPropType];

          if (has(staticMethods, propName)) {
            const builtIn = staticMethods[propName];
            addUnsupported(path, state.opts.polyfills, builtIn, this.builtIns);
          }
        }

        if (has(_builtInDefinitions.definitions.instanceMethods, propName)) {
          let builtIn = _builtInDefinitions.definitions.instanceMethods[propName];

          if (instanceType) {
            builtIn = builtIn.filter(item => item.includes(instanceType));
          }

          addUnsupported(path, state.opts.polyfills, builtIn, this.builtIns);
        }
      },

      exit(path, state) {
        if (!path.isReferenced()) return;
        const node = path.node;
        const obj = node.object;
        if (!has(_builtInDefinitions.definitions.builtins, obj.name)) return;
        if (path.scope.getBindingIdentifier(obj.name)) return;
        const builtIn = _builtInDefinitions.definitions.builtins[obj.name];
        addUnsupported(path, state.opts.polyfills, builtIn, this.builtIns);
      }

    },

    VariableDeclarator(path, state) {
      if (!path.isReferenced()) return;
      const node = path.node;
      const obj = node.init;
      if (!t.isObjectPattern(node.id)) return;
      if (!t.isReferenced(obj, node)) return;
      if (obj && path.scope.getBindingIdentifier(obj.name)) return;

      for (var _iterator2 = node.id.properties, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
        var _ref2;

        if (_isArray2) {
          if (_i2 >= _iterator2.length) break;
          _ref2 = _iterator2[_i2++];
        } else {
          _i2 = _iterator2.next();
          if (_i2.done) break;
          _ref2 = _i2.value;
        }

        let prop = _ref2;
        prop = prop.key;

        if (!node.computed && t.isIdentifier(prop) && has(_builtInDefinitions.definitions.instanceMethods, prop.name)) {
          const builtIn = _builtInDefinitions.definitions.instanceMethods[prop.name];
          addUnsupported(path, state.opts.polyfills, builtIn, this.builtIns);
        }
      }
    },

    Function(path, state) {
      if (!this.usesRegenerator && (path.node.generator || path.node.async)) {
        this.usesRegenerator = true;

        if (state.opts.regenerator) {
          addImport(path, "regenerator-runtime", this.builtIns);
        }
      }
    }

  };
  return {
    name: "use-built-ins",

    pre() {
      this.builtIns = new Set();
      this.usesRegenerator = false;
    },

    post() {
      const _this$opts = this.opts,
            debug = _this$opts.debug,
            onDebug = _this$opts.onDebug;

      if (debug) {
        (0, _debug.logUsagePolyfills)(this.builtIns, this.file.opts.filename, onDebug);
      }
    },

    visitor: addAndRemovePolyfillImports
  };
}