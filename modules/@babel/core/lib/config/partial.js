"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = loadPrivatePartialConfig;
exports.loadPartialConfig = loadPartialConfig;

function _path() {
  const data = _interopRequireDefault(require("path"));

  _path = function _path() {
    return data;
  };

  return data;
}

var _plugin = _interopRequireDefault(require("./plugin"));

var _util = require("./util");

var _item = require("./item");

var _configChain = require("./config-chain");

var _environment = require("./helpers/environment");

var _options = require("./validation/options");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function loadPrivatePartialConfig(inputOpts) {
  if (inputOpts != null && (typeof inputOpts !== "object" || Array.isArray(inputOpts))) {
    throw new Error("Babel options must be an object, null, or undefined");
  }

  const args = inputOpts ? (0, _options.validate)("arguments", inputOpts) : {};
  const _args$envName = args.envName,
        envName = _args$envName === void 0 ? (0, _environment.getEnv)() : _args$envName,
        _args$cwd = args.cwd,
        cwd = _args$cwd === void 0 ? "." : _args$cwd;

  const absoluteCwd = _path().default.resolve(cwd);

  const context = {
    filename: args.filename ? _path().default.resolve(cwd, args.filename) : null,
    cwd: absoluteCwd,
    envName
  };
  const configChain = (0, _configChain.buildRootChain)(args, context);
  if (!configChain) return null;
  const options = {};
  configChain.options.forEach(opts => {
    (0, _util.mergeOptions)(options, opts);
  });
  options.babelrc = false;
  options.configFile = false;
  options.envName = envName;
  options.cwd = absoluteCwd;
  options.passPerPreset = false;
  options.plugins = configChain.plugins.map(descriptor => (0, _item.createItemFromDescriptor)(descriptor));
  options.presets = configChain.presets.map(descriptor => (0, _item.createItemFromDescriptor)(descriptor));
  return {
    options,
    context,
    ignore: configChain.ignore,
    babelrc: configChain.babelrc,
    config: configChain.config
  };
}

function loadPartialConfig(inputOpts) {
  const result = loadPrivatePartialConfig(inputOpts);
  if (!result) return null;
  const options = result.options,
        babelrc = result.babelrc,
        ignore = result.ignore,
        config = result.config;
  (options.plugins || []).forEach(item => {
    if (item.value instanceof _plugin.default) {
      throw new Error("Passing cached plugin instances is not supported in " + "babel.loadPartialConfig()");
    }
  });
  return new PartialConfig(options, babelrc ? babelrc.filepath : undefined, ignore ? ignore.filepath : undefined, config ? config.filepath : undefined);
}

class PartialConfig {
  constructor(options, babelrc, ignore, config) {
    this.options = options;
    this.babelignore = ignore;
    this.babelrc = babelrc;
    this.config = config;
    Object.freeze(this);
  }

  hasFilesystemConfig() {
    return this.babelrc !== undefined || this.config !== undefined;
  }

}

Object.freeze(PartialConfig.prototype);