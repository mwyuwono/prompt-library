#!/usr/bin/env node
/**
 * Convert swatches.json to Procreate .swatches format
 * which Pixelmator Pro can import via the Colors panel.
 *
 * Usage: node convert-to-swatches.cjs
 * Output: fabric-palette.swatches
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Read swatches.json
const swatchesPath = path.join(__dirname, 'swatches.json');
const swatches = JSON.parse(fs.readFileSync(swatchesPath, 'utf8'));

// Convert hex to HSB (Procreate uses HSB)
function hexToHsb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { hue: 0, saturation: 0, brightness: 0 };

    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;

    let h = 0;
    const s = max === 0 ? 0 : d / max;
    const v = max;

    if (max !== min) {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return {
        hue: h,
        saturation: s,
        brightness: v
    };
}

// Build Procreate swatches format
function buildProcreateSwatches(swatches) {
    const colors = [];

    for (const swatch of swatches) {
        // Add primary color
        colors.push(hexToHsb(swatch.primary.hex));

        // Add secondary colors
        for (const secondary of swatch.secondary) {
            colors.push(hexToHsb(secondary.hex));
        }
    }

    return {
        name: "Fabric Palette",
        swatches: colors.map(c => ({
            hue: c.hue,
            saturation: c.saturation,
            brightness: c.brightness,
            alpha: 1,
            colorSpace: 0
        }))
    };
}

// Generate swatches
const procreateData = buildProcreateSwatches(swatches);
const tempDir = path.join(__dirname, 'temp-swatches');
const jsonPath = path.join(tempDir, 'Swatches.json');
const outputPath = path.join(__dirname, 'fabric-palette.swatches');

// Create temp directory
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

// Write JSON
fs.writeFileSync(jsonPath, JSON.stringify(procreateData, null, 2));

// Create .swatches file (it's a zip)
try {
    // Remove existing file if present
    if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
    }

    // Create zip file
    execSync(`cd "${tempDir}" && zip -q "../fabric-palette.swatches" Swatches.json`);

    // Cleanup
    fs.unlinkSync(jsonPath);
    fs.rmdirSync(tempDir);

    console.log(`Created: ${outputPath}`);
    console.log(`Total colors: ${procreateData.swatches.length}`);
} catch (err) {
    console.error('Error creating swatches file:', err.message);
    process.exit(1);
}
