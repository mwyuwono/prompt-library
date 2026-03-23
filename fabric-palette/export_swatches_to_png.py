#!/usr/bin/env python3
"""Export swatches-backup.json as a simple PNG swatch grid.

The output is designed for easy color picking in Illustrator: a flat grid of
uniform color squares with no labels inside the tiles.
"""

from __future__ import annotations

import json
import math
import struct
import zlib
from pathlib import Path


SWATCH_SIZE = 40
GAP = 4
MARGIN = 8
COLUMNS = 14
BACKGROUND = (255, 255, 255)


def hex_to_rgb(hex_value: str) -> tuple[int, int, int]:
    value = hex_value.lstrip("#")
    if len(value) != 6:
        raise ValueError(f"Unsupported hex color: {hex_value}")
    return tuple(int(value[index : index + 2], 16) for index in (0, 2, 4))


def collect_colors(data: list[dict[str, object]]) -> list[tuple[int, int, int]]:
    colors: list[tuple[int, int, int]] = []
    for palette in data:
        colors.append(hex_to_rgb(str(palette["primary"]["hex"])))
        colors.extend(hex_to_rgb(str(item["hex"])) for item in palette["secondary"])
    return colors


def write_png(path: Path, width: int, height: int, pixels: bytes) -> None:
    def chunk(chunk_type: bytes, data: bytes) -> bytes:
        return (
            struct.pack("!I", len(data))
            + chunk_type
            + data
            + struct.pack("!I", zlib.crc32(chunk_type + data) & 0xFFFFFFFF)
        )

    signature = b"\x89PNG\r\n\x1a\n"
    ihdr = chunk(b"IHDR", struct.pack("!IIBBBBB", width, height, 8, 2, 0, 0, 0))
    idat = chunk(b"IDAT", zlib.compress(pixels, level=9))
    iend = chunk(b"IEND", b"")
    path.write_bytes(signature + ihdr + idat + iend)


def main() -> None:
    base_dir = Path(__file__).resolve().parent
    input_path = base_dir / "swatches-backup.json"
    output_path = base_dir / "fabric-palette-swatches-grid.png"

    data = json.loads(input_path.read_text())
    colors = collect_colors(data)

    rows = math.ceil(len(colors) / COLUMNS)
    width = (MARGIN * 2) + (COLUMNS * SWATCH_SIZE) + ((COLUMNS - 1) * GAP)
    height = (MARGIN * 2) + (rows * SWATCH_SIZE) + ((rows - 1) * GAP)

    canvas = bytearray(BACKGROUND * width * height)

    for index, color in enumerate(colors):
        row = index // COLUMNS
        col = index % COLUMNS
        start_x = MARGIN + col * (SWATCH_SIZE + GAP)
        start_y = MARGIN + row * (SWATCH_SIZE + GAP)

        for y in range(start_y, start_y + SWATCH_SIZE):
            row_offset = y * width * 3
            for x in range(start_x, start_x + SWATCH_SIZE):
                pixel_offset = row_offset + (x * 3)
                canvas[pixel_offset : pixel_offset + 3] = bytes(color)

    scanlines = bytearray()
    stride = width * 3
    for y in range(height):
        scanlines.append(0)
        start = y * stride
        scanlines.extend(canvas[start : start + stride])

    write_png(output_path, width, height, bytes(scanlines))

    print(f"Wrote {output_path}")
    print(f"Colors: {len(colors)}")
    print(f"Grid: {COLUMNS} columns x {rows} rows")
    print(f"Image: {width}x{height}px")


if __name__ == "__main__":
    main()
