'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.commentToFlow = commentToFlow;
exports.parseToAst = parseToAst;
const babylon = require('babylon');

const opts = {
  allowImportExportEverywhere: true,
  sourceType: 'module',
  plugins: ['asyncGenerators', 'classConstructorCall', 'classProperties', 'decorators', 'doExpressions', 'exportExtensions', 'flow', 'functionBind', 'functionSent', 'jsx', 'objectRestSpread', 'dynamicImport']
};

/**
 * Convert flow comment types into flow annotations so that
 * they end up in the final AST. If the source does not contain
 * a flow pragma, the code is returned verbatim.
 * @param {*} source code with flow type comments
 * @returns {string} code with flow annotations
 */
function commentToFlow(source) {
  if (!/@flow/.test(source)) return source;
  return source.replace(/\/\*::([^]+?)\*\//g, '$1').replace(/\/\*:\s*([^]+?)\s*\*\//g, ':$1');
}

function parseToAst(source) {
  return babylon.parse(commentToFlow(source), opts);
}