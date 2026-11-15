import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const source = readFileSync(new URL('./usePaginate.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;

function setup(options = {}) {
    const requests = [];
    const exports = {};
    runInNewContext(compiled, {
        exports,
        require: (name) => {
            assert.equal(name, '@inertiajs/react');
            return { router: { reload: (request) => requests.push(request) } };
        },
    });
    const [pages, changePage] = exports.default({
        meta: { current_page: 1, last_page: 10, per_page: 10, from: 1, to: 10, total: 100 },
        only: ['products'],
        ...options,
    });
    return { pages: Array.from(pages), changePage, requests };
}

for (const [current, last, expected] of [
    [1, 10, [1, 2, 3, 4, 5]],
    [5, 10, [3, 4, 5, 6, 7]],
    [10, 10, [6, 7, 8, 9, 10]],
    [2, 3, [1, 2, 3]],
    [1, 1, [1]],
]) {
    test(`page window at ${current} of ${last}`, () => {
        assert.deepEqual(setup({ meta: { current_page: current, last_page: last } }).pages, expected);
    });
}

test('waits for optional pagination data', () => {
    const { pages, changePage, requests } = setup({ meta: undefined });
    assert.deepEqual(pages, []);
    changePage(1);
    assert.equal(requests.length, 0);
});

test('reloads the configured collection using its own query parameters', () => {
    const { changePage, requests } = setup({
        only: ['orders'], pageParameter: 'orders_page', perPageParameter: 'orders_per_page',
    });
    changePage(3);
    changePage(3, 20);
    assert.deepEqual(JSON.parse(JSON.stringify(requests)), [
        { data: { orders_page: 3 }, only: ['orders'] },
        { data: { orders_page: 1, orders_per_page: 20 }, only: ['orders'] },
    ]);
});

test('uses standard parameters for products', () => {
    const { changePage, requests } = setup();
    changePage(2);
    assert.deepEqual(JSON.parse(JSON.stringify(requests)), [
        { data: { page: 2 }, only: ['products'] },
    ]);
});

test('ignores invalid pages and page sizes', () => {
    const { changePage, requests } = setup();
    for (const page of [0, -1, 11, 1.5, NaN, Infinity]) changePage(page);
    for (const size of [0, -1, 1.5, NaN, Infinity]) changePage(1, size);
    assert.equal(requests.length, 0);
});
