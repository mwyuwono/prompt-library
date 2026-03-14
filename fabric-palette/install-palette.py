#!/usr/bin/env python3
"""
Install fabric palette colors directly into macOS Colors panel.
Creates a .clr file in ~/Library/Colors/

Usage: python3 install-palette.py
"""

import json
import os
from pathlib import Path

try:
    from AppKit import NSColor, NSColorList
except ImportError:
    print("Error: PyObjC not installed. Install with:")
    print("  pip3 install pyobjc-framework-Cocoa")
    exit(1)

# Load swatches
script_dir = Path(__file__).parent
swatches_path = script_dir / "swatches.json"

with open(swatches_path) as f:
    swatches = json.load(f)

# Create color list
color_list = NSColorList.alloc().initWithName_("Fabric Palette")

def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) / 255.0 for i in (0, 2, 4))

color_index = 0
for swatch in swatches:
    # Add primary color
    r, g, b = hex_to_rgb(swatch["primary"]["hex"])
    color = NSColor.colorWithCalibratedRed_green_blue_alpha_(r, g, b, 1.0)
    color_list.setColor_forKey_(color, f"{color_index:03d} {swatch['title']}")
    color_index += 1

    # Add secondary colors
    for secondary in swatch["secondary"]:
        r, g, b = hex_to_rgb(secondary["hex"])
        color = NSColor.colorWithCalibratedRed_green_blue_alpha_(r, g, b, 1.0)
        # Shorter name for nuances
        nuance_name = secondary["name"].replace("Nuance ", "N").replace("Soft Tint", "Tint").replace("Lifted Midtone", "Light").replace("Grounded Midtone", "Mid").replace("Deep Shadow", "Dark").replace("Vibrant Highlight", "Accent")
        color_list.setColor_forKey_(color, f"{color_index:03d} {nuance_name}")
        color_index += 1

# Save to ~/Library/Colors/
colors_dir = Path.home() / "Library" / "Colors"
colors_dir.mkdir(exist_ok=True)
output_path = colors_dir / "Fabric Palette.clr"

color_list.writeToFile_(str(output_path))

print(f"Installed: {output_path}")
print(f"Total colors: {color_index}")
print("\nRestart Pixelmator Pro, then open Colors panel (Shift+Cmd+C)")
print("The 'Fabric Palette' should appear in the palette dropdown.")
