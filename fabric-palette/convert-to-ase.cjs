#!/usr/bin/env node
/**
 * Convert swatches.json to Adobe Swatch Exchange (.ase) format
 * for use in Pixelmator Pro and other apps that support ASE files.
 *
 * Usage: node convert-to-ase.js
 * Output: fabric-palette.ase
 */

const fs = require('fs');
const path = require('path');

// Read swatches.json
const swatchesPath = path.join(__dirname, 'swatches.json');
const swatches = JSON.parse(fs.readFileSync(swatchesPath, 'utf8'));

// Convert hex to RGB (0-1 range)
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
    } : null;
}

// Write a big-endian 32-bit unsigned integer
function writeUInt32BE(buffer, value, offset) {
    buffer.writeUInt32BE(value >>> 0, offset);
    return offset + 4;
}

// Write a big-endian 16-bit unsigned integer
function writeUInt16BE(buffer, value, offset) {
    buffer.writeUInt16BE(value, offset);
    return offset + 2;
}

// Write a big-endian 32-bit float
function writeFloatBE(buffer, value, offset) {
    buffer.writeFloatBE(value, offset);
    return offset + 4;
}

// Encode string as UTF-16BE with null terminator
function encodeString(str) {
    const chars = [...str];
    const buffer = Buffer.alloc((chars.length + 1) * 2);
    let offset = 0;
    for (const char of chars) {
        buffer.writeUInt16BE(char.charCodeAt(0), offset);
        offset += 2;
    }
    buffer.writeUInt16BE(0, offset); // null terminator
    return buffer;
}

// Build ASE file
function buildAseFile(swatches) {
    const blocks = [];

    // Collect all colors organized by swatch group
    for (const swatch of swatches) {
        const groupName = swatch.title;
        const colors = [];

        // Add primary color
        colors.push({
            name: swatch.primary.name,
            hex: swatch.primary.hex
        });

        // Add secondary colors
        for (const secondary of swatch.secondary) {
            colors.push({
                name: secondary.name,
                hex: secondary.hex
            });
        }

        // Create group start block
        const groupNameEncoded = encodeString(groupName);
        const groupStartBlock = Buffer.alloc(2 + groupNameEncoded.length);
        groupStartBlock.writeUInt16BE(groupNameEncoded.length / 2, 0);
        groupNameEncoded.copy(groupStartBlock, 2);
        blocks.push({ type: 0xc001, data: groupStartBlock }); // Group start

        // Create color blocks
        for (const color of colors) {
            const rgb = hexToRgb(color.hex);
            const nameEncoded = encodeString(color.name);

            // Color block: name length (2) + name + color mode (4) + RGB values (12) + color type (2)
            const colorBlock = Buffer.alloc(2 + nameEncoded.length + 4 + 12 + 2);
            let offset = 0;

            // Name length (in UTF-16 characters including null)
            colorBlock.writeUInt16BE(nameEncoded.length / 2, offset);
            offset += 2;

            // Name
            nameEncoded.copy(colorBlock, offset);
            offset += nameEncoded.length;

            // Color mode: "RGB "
            colorBlock.write('RGB ', offset, 'ascii');
            offset += 4;

            // RGB values as big-endian floats
            colorBlock.writeFloatBE(rgb.r, offset);
            offset += 4;
            colorBlock.writeFloatBE(rgb.g, offset);
            offset += 4;
            colorBlock.writeFloatBE(rgb.b, offset);
            offset += 4;

            // Color type: 0 = global, 1 = spot, 2 = normal
            colorBlock.writeUInt16BE(2, offset);

            blocks.push({ type: 0x0001, data: colorBlock }); // Color entry
        }

        // Create group end block
        blocks.push({ type: 0xc002, data: Buffer.alloc(0) }); // Group end
    }

    // Calculate total file size
    let totalBlockSize = 0;
    for (const block of blocks) {
        totalBlockSize += 2 + 4 + block.data.length; // type (2) + length (4) + data
    }

    // Build final file
    // Header: signature (4) + version (4) + block count (4) = 12 bytes
    const file = Buffer.alloc(12 + totalBlockSize);
    let offset = 0;

    // Signature: "ASEF"
    file.write('ASEF', offset, 'ascii');
    offset += 4;

    // Version: 1.0
    file.writeUInt16BE(1, offset);
    offset += 2;
    file.writeUInt16BE(0, offset);
    offset += 2;

    // Block count
    file.writeUInt32BE(blocks.length, offset);
    offset += 4;

    // Write blocks
    for (const block of blocks) {
        file.writeUInt16BE(block.type, offset);
        offset += 2;
        file.writeUInt32BE(block.data.length, offset);
        offset += 4;
        block.data.copy(file, offset);
        offset += block.data.length;
    }

    return file;
}

// Generate and save ASE file
const aseData = buildAseFile(swatches);
const outputPath = path.join(__dirname, 'fabric-palette.ase');
fs.writeFileSync(outputPath, aseData);

console.log(`Created: ${outputPath}`);
console.log(`Total swatches: ${swatches.length}`);
console.log(`Total colors: ${swatches.length * 6}`); // 1 primary + 5 secondary each
