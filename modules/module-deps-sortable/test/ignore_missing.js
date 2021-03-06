var parser = require('../');
var test = require('tap').test;
var fs = require('fs');
var path = require('path');

var files = {
    main: path.join(__dirname, '/ignore_missing/main.js'),
    other: path.join(__dirname, '/ignore_missing/other.js')
};

var sources = Object.keys(files).reduce(function (acc, file) {
    acc[file] = fs.readFileSync(files[file], 'utf8');
    return acc;
}, {});

test('ignoreMissing', function (t) {
    t.plan(1);
    var p = parser({ignoreMissing: true});
    p.end({file: files.main, entry: true});
    
    var rows = [];
    p.on('data', function (row) { rows.push(row) });
    p.on('end', function () {
        t.same(rows.sort(cmp), [
            {
                id: files.main,
                file: files.main,
                source: sources.main,
                sortKey: '!' + files.main,
                entry: true,
                deps: { './other': files.other }
            },
            {
                id: files.other,
                file: files.other,
                sortKey: '!' + files.main + ':00000000!' + files.other,
                source: sources.other,
                deps: { 'missingModule': undefined }
            }
        ].sort(cmp));
    });
});

test('ignoreMissing off', function (t) {
    t.plan(1);
    var p = parser();
    p.end({file: files.main, entry: true});
    
    var rows = [];
    p.on('data', function (row) { rows.push(row) });
    p.on('error', function (err) {
        t.match(
            String(err),
            /Cannot find module 'missingModule'/
        );
    });
    p.on('end', function () {
        t.fail('should have errored');
    });
});

function cmp (a, b) { return a.id < b.id ? -1 : 1 }
