"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.matchesPattern = matchesPattern;
exports.has = has;
exports.isStatic = isStatic;
exports.isnt = isnt;
exports.equals = equals;
exports.isNodeType = isNodeType;
exports.canHaveVariableDeclarationOrExpression = canHaveVariableDeclarationOrExpression;
exports.canSwapBetweenExpressionAndStatement = canSwapBetweenExpressionAndStatement;
exports.isCompletionRecord = isCompletionRecord;
exports.isStatementOrBlock = isStatementOrBlock;
exports.referencesImport = referencesImport;
exports.getSource = getSource;
exports.willIMaybeExecuteBefore = willIMaybeExecuteBefore;
exports._guessExecutionStatusRelativeTo = _guessExecutionStatusRelativeTo;
exports._guessExecutionStatusRelativeToDifferentFunctions = _guessExecutionStatusRelativeToDifferentFunctions;
exports.resolve = resolve;
exports._resolve = _resolve;
exports.isConstantExpression = isConstantExpression;
exports.isInStrictMode = isInStrictMode;
exports.is = void 0;

function _includes() {
  const data = _interopRequireDefault(require("lodash/includes"));

  _includes = function _includes() {
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function matchesPattern(pattern, allowPartial) {
  return t().matchesPattern(this.node, pattern, allowPartial);
}

function has(key) {
  const val = this.node && this.node[key];

  if (val && Array.isArray(val)) {
    return !!val.length;
  } else {
    return !!val;
  }
}

function isStatic() {
  return this.scope.isStatic(this.node);
}

const is = has;
exports.is = is;

function isnt(key) {
  return !this.has(key);
}

function equals(key, value) {
  return this.node[key] === value;
}

function isNodeType(type) {
  return t().isType(this.type, type);
}

function canHaveVariableDeclarationOrExpression() {
  return (this.key === "init" || this.key === "left") && this.parentPath.isFor();
}

function canSwapBetweenExpressionAndStatement(replacement) {
  if (this.key !== "body" || !this.parentPath.isArrowFunctionExpression()) {
    return false;
  }

  if (this.isExpression()) {
    return t().isBlockStatement(replacement);
  } else if (this.isBlockStatement()) {
    return t().isExpression(replacement);
  }

  return false;
}

function isCompletionRecord(allowInsideFunction) {
  let path = this;
  let first = true;

  do {
    const container = path.container;

    if (path.isFunction() && !first) {
      return !!allowInsideFunction;
    }

    first = false;

    if (Array.isArray(container) && path.key !== container.length - 1) {
      return false;
    }
  } while ((path = path.parentPath) && !path.isProgram());

  return true;
}

function isStatementOrBlock() {
  if (this.parentPath.isLabeledStatement() || t().isBlockStatement(this.container)) {
    return false;
  } else {
    return (0, _includes().default)(t().STATEMENT_OR_BLOCK_KEYS, this.key);
  }
}

function referencesImport(moduleSource, importName) {
  if (!this.isReferencedIdentifier()) return false;
  const binding = this.scope.getBinding(this.node.name);
  if (!binding || binding.kind !== "module") return false;
  const path = binding.path;
  const parent = path.parentPath;
  if (!parent.isImportDeclaration()) return false;

  if (parent.node.source.value === moduleSource) {
    if (!importName) return true;
  } else {
    return false;
  }

  if (path.isImportDefaultSpecifier() && importName === "default") {
    return true;
  }

  if (path.isImportNamespaceSpecifier() && importName === "*") {
    return true;
  }

  if (path.isImportSpecifier() && path.node.imported.name === importName) {
    return true;
  }

  return false;
}

function getSource() {
  const node = this.node;

  if (node.end) {
    return this.hub.file.code.slice(node.start, node.end);
  } else {
    return "";
  }
}

function willIMaybeExecuteBefore(target) {
  return this._guessExecutionStatusRelativeTo(target) !== "after";
}

function _guessExecutionStatusRelativeTo(target) {
  const targetFuncParent = target.scope.getFunctionParent() || target.scope.getProgramParent();
  const selfFuncParent = this.scope.getFunctionParent() || target.scope.getProgramParent();

  if (targetFuncParent.node !== selfFuncParent.node) {
    const status = this._guessExecutionStatusRelativeToDifferentFunctions(targetFuncParent);

    if (status) {
      return status;
    } else {
      target = targetFuncParent.path;
    }
  }

  const targetPaths = target.getAncestry();
  if (targetPaths.indexOf(this) >= 0) return "after";
  const selfPaths = this.getAncestry();
  let commonPath;
  let targetIndex;
  let selfIndex;

  for (selfIndex = 0; selfIndex < selfPaths.length; selfIndex++) {
    const selfPath = selfPaths[selfIndex];
    targetIndex = targetPaths.indexOf(selfPath);

    if (targetIndex >= 0) {
      commonPath = selfPath;
      break;
    }
  }

  if (!commonPath) {
    return "before";
  }

  const targetRelationship = targetPaths[targetIndex - 1];
  const selfRelationship = selfPaths[selfIndex - 1];

  if (!targetRelationship || !selfRelationship) {
    return "before";
  }

  if (targetRelationship.listKey && targetRelationship.container === selfRelationship.container) {
    return targetRelationship.key > selfRelationship.key ? "before" : "after";
  }

  const keys = t().VISITOR_KEYS[commonPath.type];
  const targetKeyPosition = keys.indexOf(targetRelationship.key);
  const selfKeyPosition = keys.indexOf(selfRelationship.key);
  return targetKeyPosition > selfKeyPosition ? "before" : "after";
}

function _guessExecutionStatusRelativeToDifferentFunctions(targetFuncParent) {
  const targetFuncPath = targetFuncParent.path;
  if (!targetFuncPath.isFunctionDeclaration()) return;
  const binding = targetFuncPath.scope.getBinding(targetFuncPath.node.id.name);
  if (!binding.references) return "before";
  const referencePaths = binding.referencePaths;

  for (var _iterator = referencePaths, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
    var _ref;

    if (_isArray) {
      if (_i >= _iterator.length) break;
      _ref = _iterator[_i++];
    } else {
      _i = _iterator.next();
      if (_i.done) break;
      _ref = _i.value;
    }

    const path = _ref;

    if (path.key !== "callee" || !path.parentPath.isCallExpression()) {
      return;
    }
  }

  let allStatus;

  for (var _iterator2 = referencePaths, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
    var _ref2;

    if (_isArray2) {
      if (_i2 >= _iterator2.length) break;
      _ref2 = _iterator2[_i2++];
    } else {
      _i2 = _iterator2.next();
      if (_i2.done) break;
      _ref2 = _i2.value;
    }

    const path = _ref2;
    const childOfFunction = !!path.find(path => path.node === targetFuncPath.node);
    if (childOfFunction) continue;

    const status = this._guessExecutionStatusRelativeTo(path);

    if (allStatus) {
      if (allStatus !== status) return;
    } else {
      allStatus = status;
    }
  }

  return allStatus;
}

function resolve(dangerous, resolved) {
  return this._resolve(dangerous, resolved) || this;
}

function _resolve(dangerous, resolved) {
  if (resolved && resolved.indexOf(this) >= 0) return;
  resolved = resolved || [];
  resolved.push(this);

  if (this.isVariableDeclarator()) {
    if (this.get("id").isIdentifier()) {
      return this.get("init").resolve(dangerous, resolved);
    } else {}
  } else if (this.isReferencedIdentifier()) {
    const binding = this.scope.getBinding(this.node.name);
    if (!binding) return;
    if (!binding.constant) return;
    if (binding.kind === "module") return;

    if (binding.path !== this) {
      const ret = binding.path.resolve(dangerous, resolved);
      if (this.find(parent => parent.node === ret.node)) return;
      return ret;
    }
  } else if (this.isTypeCastExpression()) {
    return this.get("expression").resolve(dangerous, resolved);
  } else if (dangerous && this.isMemberExpression()) {
    const targetKey = this.toComputedKey();
    if (!t().isLiteral(targetKey)) return;
    const targetName = targetKey.value;
    const target = this.get("object").resolve(dangerous, resolved);

    if (target.isObjectExpression()) {
      const props = target.get("properties");
      var _arr = props;

      for (var _i3 = 0; _i3 < _arr.length; _i3++) {
        const prop = _arr[_i3];
        if (!prop.isProperty()) continue;
        const key = prop.get("key");
        let match = prop.isnt("computed") && key.isIdentifier({
          name: targetName
        });
        match = match || key.isLiteral({
          value: targetName
        });
        if (match) return prop.get("value").resolve(dangerous, resolved);
      }
    } else if (target.isArrayExpression() && !isNaN(+targetName)) {
      const elems = target.get("elements");
      const elem = elems[targetName];
      if (elem) return elem.resolve(dangerous, resolved);
    }
  }
}

function isConstantExpression() {
  if (this.isIdentifier()) {
    const binding = this.scope.getBinding(this.node.name);

    if (!binding) {
      return false;
    }

    return binding.constant && binding.path.get("init").isConstantExpression();
  }

  if (this.isLiteral()) {
    if (this.isRegExpLiteral()) {
      return false;
    }

    if (this.isTemplateLiteral()) {
      return this.get("expressions").every(expression => expression.isConstantExpression());
    }

    return true;
  }

  if (this.isUnaryExpression()) {
    if (this.get("operator").node !== "void") {
      return false;
    }

    return this.get("argument").isConstantExpression();
  }

  if (this.isBinaryExpression()) {
    return this.get("left").isConstantExpression() && this.get("right").isConstantExpression();
  }

  return false;
}

function isInStrictMode() {
  const start = this.isProgram() ? this : this.parentPath;
  const strictParent = start.find(path => {
    if (path.isProgram({
      sourceType: "module"
    })) return true;
    if (path.isClass()) return true;
    if (!path.isProgram() && !path.isFunction()) return false;

    if (path.isArrowFunctionExpression() && !path.get("body").isBlockStatement()) {
      return false;
    }

    let node = path.node;
    if (path.isFunction()) node = node.body;

    for (var _iterator3 = node.directives, _isArray3 = Array.isArray(_iterator3), _i4 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
      var _ref3;

      if (_isArray3) {
        if (_i4 >= _iterator3.length) break;
        _ref3 = _iterator3[_i4++];
      } else {
        _i4 = _iterator3.next();
        if (_i4.done) break;
        _ref3 = _i4.value;
      }

      const directive = _ref3;

      if (directive.value.value === "use strict") {
        return true;
      }
    }
  });
  return !!strictParent;
}