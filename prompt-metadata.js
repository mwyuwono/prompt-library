export function getCategoryPrompts(prompts, category) {
    return prompts.filter(prompt => prompt.category === category);
}

export function nextCustomOrder(prompts, category) {
    const orders = getCategoryPrompts(prompts, category)
        .map(prompt => prompt.customOrder)
        .filter(Number.isInteger);
    return orders.length ? Math.max(...orders) + 1 : 0;
}

export function normalizeCategoryOrders(prompts, category) {
    getCategoryPrompts(prompts, category)
        .sort((a, b) => {
            const aOrder = Number.isInteger(a.customOrder) ? a.customOrder : Number.MAX_SAFE_INTEGER;
            const bOrder = Number.isInteger(b.customOrder) ? b.customOrder : Number.MAX_SAFE_INTEGER;
            return aOrder - bOrder || String(a.title || '').localeCompare(String(b.title || ''));
        })
        .forEach((prompt, index) => {
            prompt.customOrder = index;
        });
    return prompts;
}

export function validateCategoryOrder(prompts, category, promptIds) {
    if (typeof category !== 'string' || !category.trim()) {
        return { ok: false, error: 'category must be a non-empty string' };
    }
    if (!Array.isArray(promptIds)) {
        return { ok: false, error: 'promptIds must be an array' };
    }

    const expectedIds = getCategoryPrompts(prompts, category).map(prompt => prompt.id);
    const expectedSet = new Set(expectedIds);
    const receivedSet = new Set(promptIds);

    if (receivedSet.size !== promptIds.length) {
        return { ok: false, error: 'promptIds must not contain duplicates' };
    }
    if (promptIds.length !== expectedIds.length) {
        return { ok: false, error: 'promptIds must include every prompt in the category exactly once' };
    }

    const invalidId = promptIds.find(id => !expectedSet.has(id));
    if (invalidId) {
        return { ok: false, error: `prompt "${invalidId}" does not belong to category "${category}"` };
    }

    return { ok: true };
}

export function applyCategoryOrder(prompts, category, promptIds) {
    const validation = validateCategoryOrder(prompts, category, promptIds);
    if (!validation.ok) return validation;

    const positions = new Map(promptIds.map((id, index) => [id, index]));
    getCategoryPrompts(prompts, category).forEach(prompt => {
        prompt.customOrder = positions.get(prompt.id);
    });
    return { ok: true, prompts };
}
