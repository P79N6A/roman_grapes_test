"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _fs() {
  const data = _interopRequireDefault(require("fs"));

  _fs = function _fs() {
    return data;
  };

  return data;
}

var _config = _interopRequireDefault(require("./config"));

var _transformation = require("./transformation");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var transformFile = function transformFile(filename, opts, callback) {
  let options;

  if (typeof opts === "function") {
    callback = opts;
    opts = undefined;
  }

  if (opts == null) {
    options = {
      filename
    };
  } else if (opts && typeof opts === "object") {
    options = Object.assign({}, opts, {
      filename
    });
  }

  process.nextTick(() => {
    let cfg;

    try {
      cfg = (0, _config.default)(options);
      if (cfg === null) return callback(null, null);
    } catch (err) {
      return callback(err);
    }

    const config = cfg;

    _fs().default.readFile(filename, "utf8", function (err, code) {
      if (err) return callback(err, null);
      (0, _transformation.runAsync)(config, code, null, callback);
    });
  });
};

exports.default = transformFile;