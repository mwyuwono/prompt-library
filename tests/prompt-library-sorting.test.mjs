import assert from 'node:assert/strict';
import test from 'node:test';

globalThis.window = {
    localStorage: { getItem: () => null, setItem: () => {} }
};
globalThis.document = { addEventListener: () => {} };
await import('../app.js');

function createLibrary(prompts, { sortMode = 'custom', category = '', searchTerm = '' } = {}) {
    const library = Object.create(window.PromptLibrary.prototype);
    Object.assign(library, {
        prompts,
        filteredPrompts: [],
        sortMode,
        selectedCategory: category,
        searchTerm,
        showFeaturedOnly: false,
        showHiddenOnly: false,
        hiddenPromptIds: new Set(),
        renderPrompts: () => {}
    });
    return library;
}

const prompt = (id, title, category, customOrder, modifiedAt, featured = false) => ({
    id, title, category, customOrder, modifiedAt, featured
});

test('custom ordering groups mixed results by category and uses category positions', () => {
    const library = createLibrary([
        prompt('w1', 'Writing One', 'Writing', 0, '2026-01-03T00:00:00Z'),
        prompt('a2', 'Art Two', 'Art', 1, '2026-01-02T00:00:00Z'),
        prompt('a1', 'Art One', 'Art', 0, '2026-01-01T00:00:00Z')
    ]);
    library.filterPrompts();
    assert.deepEqual(library.filteredPrompts.map(item => item.id), ['a1', 'a2', 'w1']);
});

test('date ordering is newest first globally with deterministic custom-order ties', () => {
    const library = createLibrary([
        prompt('old', 'Old', 'Writing', 0, '2026-01-01T00:00:00Z'),
        prompt('tie-2', 'Tie Two', 'Art', 2, '2026-02-01T00:00:00Z'),
        prompt('tie-1', 'Tie One', 'Writing', 1, '2026-02-01T00:00:00Z')
    ], { sortMode: 'modified' });
    library.filterPrompts();
    assert.deepEqual(library.filteredPrompts.map(item => item.id), ['tie-1', 'tie-2', 'old']);
});

test('featured prompts do not override the selected custom order', () => {
    const library = createLibrary([
        prompt('featured', 'Featured', 'Writing', 1, '2026-02-01T00:00:00Z', true),
        prompt('regular', 'Regular', 'Writing', 0, '2026-01-01T00:00:00Z')
    ], { category: 'Writing' });
    library.filterPrompts();
    assert.deepEqual(library.filteredPrompts.map(item => item.id), ['regular', 'featured']);
});
