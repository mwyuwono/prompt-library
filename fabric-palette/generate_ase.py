#!/usr/bin/env python3
"""Generate an ASE (Adobe Swatch Exchange) file from swatches.json."""

import json
import struct
import os

def hex_to_rgb_floats(hex_color):
    hex_color = hex_color.lstrip('#')
    r = int(hex_color[0:2], 16) / 255.0
    g = int(hex_color[2:4], 16) / 255.0
    b = int(hex_color[4:6], 16) / 255.0
    return r, g, b

def encode_name(name):
    # UTF-16 BE, null-terminated; length = number of UTF-16 code units including null
    encoded = name.encode('utf-16-be') + b'\x00\x00'
    length = len(encoded) // 2  # number of UTF-16 code units
    return struct.pack('>H', length) + encoded

def color_block(name, hex_color):
    name_bytes = encode_name(name)
    r, g, b = hex_to_rgb_floats(hex_color)
    color_data = b'RGB ' + struct.pack('>fff', r, g, b) + struct.pack('>H', 2)  # 2 = process
    block_data = name_bytes + color_data
    return struct.pack('>HI', 0xC001, len(block_data)) + block_data

def group_start_block(name):
    name_bytes = encode_name(name)
    return struct.pack('>HI', 0x0001, len(name_bytes)) + name_bytes

def group_end_block():
    return struct.pack('>HI', 0x0002, 0)

def build_ase(swatches):
    blocks = []
    block_count = 0

    for swatch in swatches:
        group_name = swatch.get('title', swatch.get('id', 'Color'))
        brand = swatch.get('brand', '')
        if brand:
            group_name = f"{brand} — {group_name}"

        # Group start
        blocks.append(group_start_block(group_name))
        block_count += 1

        # Primary color
        primary = swatch.get('primary', {})
        if primary.get('hex'):
            blocks.append(color_block(primary.get('name', group_name), primary['hex']))
            block_count += 1

        # Secondary colors
        for sec in swatch.get('secondary', []):
            if sec.get('hex'):
                blocks.append(color_block(sec.get('name', 'Color'), sec['hex']))
                block_count += 1

        # Group end
        blocks.append(group_end_block())
        block_count += 1

    header = b'ASEF' + struct.pack('>HH', 1, 0) + struct.pack('>I', block_count)
    return header + b''.join(blocks)

script_dir = os.path.dirname(os.path.abspath(__file__))
swatches_path = os.path.join(script_dir, 'swatches.json')
output_path = os.path.join(script_dir, 'fabric-palette.ase')

with open(swatches_path) as f:
    swatches = json.load(f)

ase_data = build_ase(swatches)

with open(output_path, 'wb') as f:
    f.write(ase_data)

print(f"Generated {output_path} ({len(ase_data)} bytes, {len(swatches)} groups)")
