"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validate = validate;

var _plugin = _interopRequireDefault(require("../plugin"));

var _removed = _interopRequireDefault(require("./removed"));

var _optionAssertions = require("./option-assertions");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ROOT_VALIDATORS = {
  cwd: _optionAssertions.assertString,
  root: _optionAssertions.assertString,
  configFile: _optionAssertions.assertConfigFileSearch,
  filename: _optionAssertions.assertString,
  filenameRelative: _optionAssertions.assertString,
  code: _optionAssertions.assertBoolean,
  ast: _optionAssertions.assertBoolean,
  envName: _optionAssertions.assertString
};
const BABELRC_VALIDATORS = {
  babelrc: _optionAssertions.assertBoolean,
  babelrcRoots: _optionAssertions.assertBabelrcSearch
};
const NONPRESET_VALIDATORS = {
  extends: _optionAssertions.assertString,
  env: assertEnvSet,
  ignore: _optionAssertions.assertIgnoreList,
  only: _optionAssertions.assertIgnoreList,
  overrides: assertOverridesList,
  test: _optionAssertions.assertConfigApplicableTest,
  include: _optionAssertions.assertConfigApplicableTest,
  exclude: _optionAssertions.assertConfigApplicableTest
};
const COMMON_VALIDATORS = {
  inputSourceMap: _optionAssertions.assertInputSourceMap,
  presets: _optionAssertions.assertPluginList,
  plugins: _optionAssertions.assertPluginList,
  passPerPreset: _optionAssertions.assertBoolean,
  retainLines: _optionAssertions.assertBoolean,
  comments: _optionAssertions.assertBoolean,
  shouldPrintComment: _optionAssertions.assertFunction,
  compact: _optionAssertions.assertCompact,
  minified: _optionAssertions.assertBoolean,
  auxiliaryCommentBefore: _optionAssertions.assertString,
  auxiliaryCommentAfter: _optionAssertions.assertString,
  sourceType: _optionAssertions.assertSourceType,
  wrapPluginVisitorMethod: _optionAssertions.assertFunction,
  highlightCode: _optionAssertions.assertBoolean,
  sourceMaps: _optionAssertions.assertSourceMaps,
  sourceMap: _optionAssertions.assertSourceMaps,
  sourceFileName: _optionAssertions.assertString,
  sourceRoot: _optionAssertions.assertString,
  getModuleId: _optionAssertions.assertFunction,
  moduleRoot: _optionAssertions.assertString,
  moduleIds: _optionAssertions.assertBoolean,
  moduleId: _optionAssertions.assertString,
  parserOpts: _optionAssertions.assertObject,
  generatorOpts: _optionAssertions.assertObject
};

function validate(type, opts) {
  assertNoDuplicateSourcemap(opts);
  Object.keys(opts).forEach(key => {
    if (type === "preset" && NONPRESET_VALIDATORS[key]) {
      throw new Error(`.${key} is not allowed in preset options`);
    }

    if (type !== "arguments" && ROOT_VALIDATORS[key]) {
      throw new Error(`.${key} is only allowed in root programmatic options`);
    }

    if (type !== "arguments" && type !== "configfile" && BABELRC_VALIDATORS[key]) {
      if (type === "babelrcfile" || type === "extendsfile") {
        throw new Error(`.${key} is not allowed in .babelrc or "extend"ed files, only in root programmatic options, ` + `or babel.config.js/config file options`);
      }

      throw new Error(`.${key} is only allowed in root programmatic options, or babel.config.js/config file options`);
    }

    if (type === "env" && key === "env") {
      throw new Error(`.${key} is not allowed inside another env block`);
    }

    if (type === "env" && key === "overrides") {
      throw new Error(`.${key} is not allowed inside an env block`);
    }

    if (type === "override" && key === "overrides") {
      throw new Error(`.${key} is not allowed inside an overrides block`);
    }

    const validator = COMMON_VALIDATORS[key] || NONPRESET_VALIDATORS[key] || BABELRC_VALIDATORS[key] || ROOT_VALIDATORS[key];
    if (validator) validator(key, opts[key]);else throw buildUnknownError(key);
  });
  return opts;
}

function buildUnknownError(key) {
  if (_removed.default[key]) {
    const _removed$key = _removed.default[key],
          message = _removed$key.message,
          _removed$key$version = _removed$key.version,
          version = _removed$key$version === void 0 ? 5 : _removed$key$version;
    throw new ReferenceError(`Using removed Babel ${version} option: .${key} - ${message}`);
  } else {
    const unknownOptErr = `Unknown option: .${key}. Check out http://babeljs.io/docs/usage/options/ for more information about options.`;
    throw new ReferenceError(unknownOptErr);
  }
}

function has(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function assertNoDuplicateSourcemap(opts) {
  if (has(opts, "sourceMap") && has(opts, "sourceMaps")) {
    throw new Error(".sourceMap is an alias for .sourceMaps, cannot use both");
  }
}

function assertEnvSet(key, value) {
  const obj = (0, _optionAssertions.assertObject)(key, value);

  if (obj) {
    var _arr = Object.keys(obj);

    for (var _i = 0; _i < _arr.length; _i++) {
      const key = _arr[_i];
      const env = (0, _optionAssertions.assertObject)(key, obj[key]);
      if (env) validate("env", env);
    }
  }

  return obj;
}

function assertOverridesList(key, value) {
  const arr = (0, _optionAssertions.assertArray)(key, value);

  if (arr) {
    for (var _iterator = arr.entries(), _isArray = Array.isArray(_iterator), _i2 = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref;

      if (_isArray) {
        if (_i2 >= _iterator.length) break;
        _ref = _iterator[_i2++];
      } else {
        _i2 = _iterator.next();
        if (_i2.done) break;
        _ref = _i2.value;
      }

      const _ref2 = _ref,
            index = _ref2[0],
            item = _ref2[1];
      const env = (0, _optionAssertions.assertObject)(`${index}`, item);
      if (!env) throw new Error(`.${key}[${index}] must be an object`);
      validate("override", env);
    }
  }

  return arr;
}