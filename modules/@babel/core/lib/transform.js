"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _config = _interopRequireDefault(require("./config"));

var _transformation = require("./transformation");

var _transformSync = _interopRequireDefault(require("./transform-sync"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var transform = function transform(code, opts, callback) {
  if (typeof opts === "function") {
    opts = undefined;
    callback = opts;
  }

  if (callback === undefined) return (0, _transformSync.default)(code, opts);
  const cb = callback;
  process.nextTick(() => {
    let cfg;

    try {
      cfg = (0, _config.default)(opts);
      if (cfg === null) return cb(null, null);
    } catch (err) {
      return cb(err);
    }

    (0, _transformation.runAsync)(cfg, code, null, cb);
  });
};

exports.default = transform;