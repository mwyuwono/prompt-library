import prompts from "./prompts.json" with { type: "json" };

function getTemplateVariables(template = "") {
    return (template.match(/\{\{([a-zA-Z0-9_]+)\}\}/g) || [])
        .map((variable) => variable.slice(2, -2));
}

function validateMissingVariables(ownerLabel, template, availableVariables) {
    let hasErrors = false;
    const templateVariables = getTemplateVariables(template);

    const undefinedVariables = templateVariables.filter(
        (variable) => !availableVariables.includes(variable)
    );
    if (undefinedVariables.length > 0) {
        hasErrors = true;
        console.error(`❌ ERROR in ${ownerLabel}:`);
        console.error(
            `  - The following variables are used in the template but not defined: ${undefinedVariables.join(", ")}`
        );
    }

    return hasErrors;
}

function validateUnusedVariables(ownerLabel, definedVariables, usedVariables) {
    const unusedVariables = definedVariables.filter(
        (variable) => !usedVariables.includes(variable)
    );

    if (unusedVariables.length > 0) {
        console.error(`❌ ERROR in ${ownerLabel}:`);
        console.error(
            `  - The following variables are defined but not used in the template: ${unusedVariables.join(", ")}`
        );
        return true;
    }

    return false;
}

function validatePrompts() {
    let hasErrors = false;

    const ids = prompts.map((prompt) => prompt.id);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
        hasErrors = true;
        console.error("❌ ERROR: Duplicate IDs found!");
        const counts = ids.reduce((accumulator, id) => {
            accumulator[id] = (accumulator[id] || 0) + 1;
            return accumulator;
        }, {});
        for (const id in counts) {
            if (counts[id] > 1) {
                console.error(`  - "${id}" appears ${counts[id]} times`);
            }
        }
    } else {
        console.log("✅ All prompt IDs are unique.");
    }

    const categories = prompts.map((prompt) => prompt.category);
    const uniqueCategories = [...new Set(categories)].sort();
    console.log("\nFound categories:", uniqueCategories.join(", "));

    console.log("\nChecking template and variable consistency...");
    prompts.forEach((prompt) => {
        const promptVariables = prompt.variables ? prompt.variables.map((variable) => variable.name) : [];
        const promptTemplateVariables = getTemplateVariables(prompt.template || "");
        const variationTemplateVariables = [];

        if (prompt.template) {
            hasErrors =
                validateMissingVariables(`prompt "${prompt.id}"`, prompt.template, promptVariables) ||
                hasErrors;
        }

        if (prompt.variations?.length) {
            prompt.variations.forEach((variation) => {
                const variationVariables = variation.variables
                    ? variation.variables.map((variable) => variable.name)
                    : [];
                const availableVariables = [...new Set([...promptVariables, ...variationVariables])];
                const usedVariables = getTemplateVariables(variation.template || "");

                variationTemplateVariables.push(...usedVariables);

                hasErrors =
                    validateMissingVariables(
                        `variation "${variation.id}" in prompt "${prompt.id}"`,
                        variation.template,
                        availableVariables
                    ) || hasErrors;

                hasErrors =
                    validateUnusedVariables(
                        `variation "${variation.id}" in prompt "${prompt.id}"`,
                        variationVariables,
                        usedVariables
                    ) || hasErrors;
            });
        }

        const allPromptLevelUsage = [...promptTemplateVariables, ...variationTemplateVariables];
        hasErrors =
            validateUnusedVariables(`prompt "${prompt.id}"`, promptVariables, allPromptLevelUsage) ||
            hasErrors;
    });

    if (!hasErrors) {
        console.log("✅ All template-variable consistencies passed.");
    }

    if (hasErrors) {
        console.error("\nValidation failed with errors.");
        process.exit(1);
    } else {
        console.log("\nValidation successful!");
    }
}

validatePrompts();
