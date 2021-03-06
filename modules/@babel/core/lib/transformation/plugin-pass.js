"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

class PluginPass {
  constructor(file, key, options) {
    this._map = new Map();
    this.key = key;
    this.file = file;
    this.opts = options || {};
    this.filename = typeof file.opts.filename === "string" ? file.opts.filename : undefined;
  }

  set(key, val) {
    this._map.set(key, val);
  }

  get(key) {
    return this._map.get(key);
  }

  addHelper(name) {
    return this.file.addHelper(name);
  }

  addImport() {
    return this.file.addImport();
  }

  getModuleName() {
    return this.file.getModuleName();
  }

  buildCodeFrameError(node, msg, Error) {
    return this.file.buildCodeFrameError(node, msg, Error);
  }

}

exports.default = PluginPass;