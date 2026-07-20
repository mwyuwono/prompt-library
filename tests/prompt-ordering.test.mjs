import assert from 'node:assert/strict';
import test from 'node:test';

import {
    applyCategoryOrder,
    nextCustomOrder,
    normalizeCategoryOrders,
    validateCategoryOrder
} from '../prompt-metadata.js';
import {
    assignPromptMetadata,
    findModifiedAtFromVersions
} from '../scripts/backfill-prompt-metadata.mjs';

const prompts = () => [
    { id: 'a', title: 'A', category: 'Art', customOrder: 0, modifiedAt: '2026-01-01T00:00:00.000Z' },
    { id: 'b', title: 'B', category: 'Art', customOrder: 1, modifiedAt: '2026-01-02T00:00:00.000Z' },
    { id: 'c', title: 'C', category: 'Writing', customOrder: 0, modifiedAt: '2026-01-03T00:00:00.000Z' }
];

test('category reorder applies exact contiguous positions without changing timestamps', () => {
    const data = prompts();
    const before = data.map(prompt => prompt.modifiedAt);
    const result = applyCategoryOrder(data, 'Art', ['b', 'a']);
    assert.equal(result.ok, true);
    assert.deepEqual(data.filter(prompt => prompt.category === 'Art').map(prompt => prompt.customOrder), [1, 0]);
    assert.deepEqual(data.map(prompt => prompt.modifiedAt), before);
});

test('category reorder rejects duplicates, omissions, unknown IDs, and cross-category IDs', () => {
    const data = prompts();
    assert.equal(validateCategoryOrder(data, 'Art', ['a', 'a']).ok, false);
    assert.equal(validateCategoryOrder(data, 'Art', ['a']).ok, false);
    assert.equal(validateCategoryOrder(data, 'Art', ['a', 'missing']).ok, false);
    assert.equal(validateCategoryOrder(data, 'Art', ['a', 'c']).ok, false);
});

test('category helpers append and normalize deterministic positions', () => {
    const data = prompts();
    data[0].customOrder = 4;
    data[1].customOrder = 2;
    assert.equal(nextCustomOrder(data, 'Art'), 5);
    normalizeCategoryOrders(data, 'Art');
    assert.deepEqual(data.filter(prompt => prompt.category === 'Art').map(prompt => prompt.customOrder), [1, 0]);
});

test('history backfill uses the newest commit that changed a prompt', () => {
    const current = { id: 'a', title: 'Current', category: 'Art' };
    const versions = [
        { date: '2026-03-01T00:00:00Z', prompts: [{ ...current }] },
        { date: '2026-02-01T00:00:00Z', prompts: [{ id: 'a', title: 'Old', category: 'Art' }] },
        { date: '2026-01-01T00:00:00Z', prompts: [] }
    ];
    assert.equal(findModifiedAtFromVersions(current, versions, 'fallback'), versions[0].date);
});

test('history backfill falls back for uncommitted state and assigns category order', () => {
    const current = [
        { id: 'a', title: 'Uncommitted', category: 'Art' },
        { id: 'b', title: 'B', category: 'Writing' },
        { id: 'c', title: 'C', category: 'Art' }
    ];
    const versions = [{
        date: '2026-01-01T00:00:00Z',
        prompts: [{ id: 'a', title: 'Committed', category: 'Art' }]
    }];
    const result = assignPromptMetadata(current, versions, '2026-04-01T00:00:00Z');
    assert.equal(result[0].modifiedAt, '2026-04-01T00:00:00Z');
    assert.deepEqual(result.map(prompt => prompt.customOrder), [0, 0, 1]);
});
