"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = shallowEqual;

function shallowEqual(actual, expected) {
  const keys = Object.keys(expected);
  var _arr = keys;

  for (var _i = 0; _i < _arr.length; _i++) {
    const key = _arr[_i];

    if (actual[key] !== expected[key]) {
      return false;
    }
  }

  return true;
}