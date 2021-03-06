"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function helpers() {
  const data = _interopRequireWildcard(require("@babel/helpers"));

  helpers = function helpers() {
    return data;
  };

  return data;
}

function _traverse() {
  const data = _interopRequireWildcard(require("@babel/traverse"));

  _traverse = function _traverse() {
    return data;
  };

  return data;
}

function _codeFrame() {
  const data = require("@babel/code-frame");

  _codeFrame = function _codeFrame() {
    return data;
  };

  return data;
}

function t() {
  const data = _interopRequireWildcard(require("@babel/types"));

  t = function t() {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

const errorVisitor = {
  enter(path, state) {
    const loc = path.node.loc;

    if (loc) {
      state.loc = loc;
      path.stop();
    }
  }

};

class File {
  constructor(options, {
    code,
    ast,
    shebang,
    inputMap
  }) {
    this._map = new Map();
    this.declarations = {};
    this.path = null;
    this.ast = {};
    this.metadata = {};
    this.hub = new (_traverse().Hub)(this);
    this.code = "";
    this.shebang = "";
    this.inputMap = null;
    this.opts = options;
    this.code = code;
    this.ast = ast;
    this.shebang = shebang;
    this.inputMap = inputMap;
    this.path = _traverse().NodePath.get({
      hub: this.hub,
      parentPath: null,
      parent: this.ast,
      container: this.ast,
      key: "program"
    }).setContext();
    this.scope = this.path.scope;
  }

  set(key, val) {
    this._map.set(key, val);
  }

  get(key) {
    return this._map.get(key);
  }

  has(key) {
    return this._map.has(key);
  }

  getModuleName() {
    const _this$opts = this.opts,
          filename = _this$opts.filename,
          _this$opts$filenameRe = _this$opts.filenameRelative,
          filenameRelative = _this$opts$filenameRe === void 0 ? filename : _this$opts$filenameRe,
          moduleId = _this$opts.moduleId,
          _this$opts$moduleIds = _this$opts.moduleIds,
          moduleIds = _this$opts$moduleIds === void 0 ? !!moduleId : _this$opts$moduleIds,
          getModuleId = _this$opts.getModuleId,
          sourceRootTmp = _this$opts.sourceRoot,
          _this$opts$moduleRoot = _this$opts.moduleRoot,
          moduleRoot = _this$opts$moduleRoot === void 0 ? sourceRootTmp : _this$opts$moduleRoot,
          _this$opts$sourceRoot = _this$opts.sourceRoot,
          sourceRoot = _this$opts$sourceRoot === void 0 ? moduleRoot : _this$opts$sourceRoot;
    if (!moduleIds) return null;

    if (moduleId != null && !getModuleId) {
      return moduleId;
    }

    let moduleName = moduleRoot != null ? moduleRoot + "/" : "";

    if (filenameRelative) {
      const sourceRootReplacer = sourceRoot != null ? new RegExp("^" + sourceRoot + "/?") : "";
      moduleName += filenameRelative.replace(sourceRootReplacer, "").replace(/\.(\w*?)$/, "");
    }

    moduleName = moduleName.replace(/\\/g, "/");

    if (getModuleId) {
      return getModuleId(moduleName) || moduleName;
    } else {
      return moduleName;
    }
  }

  resolveModuleSource(source) {
    return source;
  }

  addImport() {
    throw new Error("This API has been removed. If you're looking for this " + "functionality in Babel 7, you should import the " + "'@babel/helper-module-imports' module and use the functions exposed " + " from that module, such as 'addNamed' or 'addDefault'.");
  }

  addHelper(name) {
    const declar = this.declarations[name];
    if (declar) return t().cloneNode(declar);
    const generator = this.get("helperGenerator");
    const runtime = this.get("helpersNamespace");

    if (generator) {
      const res = generator(name);
      if (res) return res;
    } else if (runtime) {
      return t().memberExpression(t().cloneNode(runtime), t().identifier(name));
    }

    const uid = this.declarations[name] = this.scope.generateUidIdentifier(name);
    const dependencies = {};

    for (var _iterator = helpers().getDependencies(name), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref;

      if (_isArray) {
        if (_i >= _iterator.length) break;
        _ref = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        _ref = _i.value;
      }

      const dep = _ref;
      dependencies[dep] = this.addHelper(dep);
    }

    const _helpers$get = helpers().get(name, dep => dependencies[dep], uid, Object.keys(this.scope.getAllBindings())),
          nodes = _helpers$get.nodes,
          globals = _helpers$get.globals;

    globals.forEach(name => {
      if (this.path.scope.hasBinding(name, true)) {
        this.path.scope.rename(name);
      }
    });
    nodes.forEach(node => {
      node._compact = true;
    });
    this.path.unshiftContainer("body", nodes);
    this.path.get("body").forEach(path => {
      if (nodes.indexOf(path.node) === -1) return;
      if (path.isVariableDeclaration()) this.scope.registerDeclaration(path);
    });
    return uid;
  }

  addTemplateObject() {
    throw new Error("This function has been moved into the template literal transform itself.");
  }

  buildCodeFrameError(node, msg, Error = SyntaxError) {
    let loc = node && (node.loc || node._loc);
    msg = `${this.opts.filename}: ${msg}`;

    if (!loc && node) {
      const state = {
        loc: null
      };
      (0, _traverse().default)(node, errorVisitor, this.scope, state);
      loc = state.loc;
      let txt = "This is an error on an internal node. Probably an internal error.";
      if (loc) txt += " Location has been estimated.";
      msg += ` (${txt})`;
    }

    if (loc) {
      const _this$opts$highlightC = this.opts.highlightCode,
            highlightCode = _this$opts$highlightC === void 0 ? true : _this$opts$highlightC;
      msg += "\n" + (0, _codeFrame().codeFrameColumns)(this.code, {
        start: {
          line: loc.start.line,
          column: loc.start.column + 1
        }
      }, {
        highlightCode
      });
    }

    return new Error(msg);
  }

}

exports.default = File;