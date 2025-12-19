const prompts = require("./prompts.json");

function validatePrompts() {
    let hasErrors = false;

    // 1. Check for unique IDs
    const ids = prompts.map(p => p.id);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
        hasErrors = true;
        console.error("❌ ERROR: Duplicate IDs found!");
        const counts = ids.reduce((acc, id) => {
            acc[id] = (acc[id] || 0) + 1;
            return acc;
        }, {});
        for (const id in counts) {
            if (counts[id] > 1) {
                console.error(`  - "${id}" appears ${counts[id]} times`);
            }
        }
    } else {
        console.log("✅ All prompt IDs are unique.");
    }

    // 2. Check for consistent categories
    const categories = prompts.map(p => p.category);
    const uniqueCategories = [...new Set(categories)].sort();
    console.log("\nFound categories:", uniqueCategories.join(", "));


    // 3. Template-Variable Consistency & 4. Variable-Template Consistency
    console.log("\nChecking template and variable consistency...");
    prompts.forEach(prompt => {
        const templateVariables = (prompt.template.match(/\{\{([a-zA-Z0-9_]+)\}\}/g) || [])
            .map(v => v.substring(2, v.length - 2));
        const definedVariables = prompt.variables ? prompt.variables.map(v => v.name) : [];

        // Check if all defined variables are used in the template
        const unusedVariables = definedVariables.filter(v => !templateVariables.includes(v));
        if (unusedVariables.length > 0) {
            hasErrors = true;
            console.error(`❌ ERROR in prompt "${prompt.id}":`);
            console.error(`  - The following variables are defined but not used in the template: ${unusedVariables.join(", ")}`);
        }

        // Check if all template variables are defined
        const undefinedVariables = templateVariables.filter(v => !definedVariables.includes(v));
        if (undefinedVariables.length > 0) {
            hasErrors = true;
            console.error(`❌ ERROR in prompt "${prompt.id}":`);
            console.error(`  - The following variables are used in the template but not defined: ${undefinedVariables.join(", ")}`);
        }
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
