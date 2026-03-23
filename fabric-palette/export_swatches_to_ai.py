#!/usr/bin/env python3
"""Export the swatch backup JSON to an Illustrator-openable PDF-compatible AI file.

The generated `.ai` file is a standard PDF document with an Illustrator file
extension. Illustrator can open PDF-compatible `.ai` files, and the iPad app
can import them from Files or Creative Cloud.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path


PAGE_WIDTH = 792
PAGE_HEIGHT = 612
MARGIN_X = 42
MARGIN_Y = 36
HEADER_HEIGHT = 42
PALETTES_PER_PAGE = 3
PALETTE_GAP = 18
PALETTE_HEIGHT = (PAGE_HEIGHT - (MARGIN_Y * 2) - HEADER_HEIGHT - (PALETTE_GAP * (PALETTES_PER_PAGE - 1))) / PALETTES_PER_PAGE


@dataclass
class Swatch:
    label: str
    hex_value: str


def escape_pdf_text(value: str) -> str:
    return value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def hex_to_rgb(hex_value: str) -> tuple[float, float, float]:
    value = hex_value.lstrip("#")
    if len(value) != 6:
        raise ValueError(f"Unsupported hex color: {hex_value}")
    r = int(value[0:2], 16) / 255
    g = int(value[2:4], 16) / 255
    b = int(value[4:6], 16) / 255
    return (r, g, b)


def color_luminance(rgb: tuple[float, float, float]) -> float:
    r, g, b = rgb
    return (0.2126 * r) + (0.7152 * g) + (0.0722 * b)


def emit_text(lines: list[str], x: float, y: float, text: str, size: int = 10, font: str = "/F1") -> None:
    lines.append("BT")
    lines.append(f"{font} {size} Tf")
    lines.append(f"1 0 0 1 {x:.2f} {y:.2f} Tm")
    lines.append(f"({escape_pdf_text(text)}) Tj")
    lines.append("ET")


def emit_rect(lines: list[str], x: float, y: float, width: float, height: float, rgb: tuple[float, float, float]) -> None:
    r, g, b = rgb
    lines.append(f"{r:.4f} {g:.4f} {b:.4f} rg")
    lines.append(f"{x:.2f} {y:.2f} {width:.2f} {height:.2f} re f")


def emit_stroke(lines: list[str], x: float, y: float, width: float, height: float, gray: float = 0.85) -> None:
    lines.append(f"{gray:.3f} G")
    lines.append("0.75 w")
    lines.append(f"{x:.2f} {y:.2f} {width:.2f} {height:.2f} re S")


def build_palette_block(lines: list[str], palette: dict[str, object], block_x: float, block_y: float, block_w: float, block_h: float) -> None:
    title = str(palette["title"])
    brand = str(palette["brand"])
    swatches = [
        Swatch(str(palette["primary"]["name"]), str(palette["primary"]["hex"])),
        *[Swatch(str(item["name"]), str(item["hex"])) for item in palette["secondary"]],
    ]

    emit_text(lines, block_x, block_y + block_h - 16, f"{brand} - {title}", size=16, font="/F2")

    cols = 3
    rows = 2
    inner_top = block_y + block_h - 44
    gap_x = 14
    gap_y = 18
    swatch_w = (block_w - (gap_x * (cols - 1))) / cols
    swatch_h = (block_h - 56 - gap_y) / rows

    for index, swatch in enumerate(swatches):
        row = index // cols
        col = index % cols
        x = block_x + col * (swatch_w + gap_x)
        y = inner_top - ((row + 1) * swatch_h) - (row * gap_y)
        rgb = hex_to_rgb(swatch.hex_value)

        emit_rect(lines, x, y, swatch_w, swatch_h, rgb)
        emit_stroke(lines, x, y, swatch_w, swatch_h)

        text_rgb = (1.0, 1.0, 1.0) if color_luminance(rgb) < 0.48 else (0.08, 0.08, 0.08)
        lines.append(f"{text_rgb[0]:.3f} {text_rgb[1]:.3f} {text_rgb[2]:.3f} rg")
        emit_text(lines, x + 10, y + swatch_h - 18, swatch.label, size=11, font="/F2")
        emit_text(lines, x + 10, y + 10, swatch.hex_value.upper(), size=11, font="/F1")


def build_page_stream(palettes: list[dict[str, object]], page_number: int, page_count: int) -> bytes:
    lines: list[str] = []
    emit_text(lines, MARGIN_X, PAGE_HEIGHT - 34, "Fabric Palette Swatch Library", size=20, font="/F2")
    emit_text(lines, MARGIN_X, PAGE_HEIGHT - 54, "Generated from swatches-backup.json", size=10, font="/F1")
    emit_text(lines, PAGE_WIDTH - 118, PAGE_HEIGHT - 34, f"Page {page_number} of {page_count}", size=10, font="/F1")

    block_w = PAGE_WIDTH - (MARGIN_X * 2)
    first_block_top = PAGE_HEIGHT - MARGIN_Y - HEADER_HEIGHT

    for index, palette in enumerate(palettes):
        block_y = first_block_top - ((index + 1) * PALETTE_HEIGHT) - (index * PALETTE_GAP)
        build_palette_block(lines, palette, MARGIN_X, block_y, block_w, PALETTE_HEIGHT)

    return ("\n".join(lines) + "\n").encode("utf-8")


def build_pdf(page_streams: list[bytes]) -> bytes:
    objects: list[bytes] = []

    def add_object(body: str | bytes) -> int:
        if isinstance(body, str):
            body = body.encode("utf-8")
        objects.append(body)
        return len(objects)

    catalog_id = add_object("<< /Type /Catalog /Pages 2 0 R >>")
    page_tree_id = add_object("<< /Type /Pages /Count 0 /Kids [] >>")
    font_regular_id = add_object("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
    font_bold_id = add_object("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")

    page_ids: list[int] = []
    content_ids: list[int] = []
    for stream in page_streams:
        content_id = add_object(
            b"<< /Length %d >>\nstream\n%sendstream" % (len(stream), stream)
        )
        page_id = add_object(
            f"<< /Type /Page /Parent {page_tree_id} 0 R /MediaBox [0 0 {PAGE_WIDTH} {PAGE_HEIGHT}] "
            f"/Resources << /Font << /F1 {font_regular_id} 0 R /F2 {font_bold_id} 0 R >> >> "
            f"/Contents {content_id} 0 R >>"
        )
        content_ids.append(content_id)
        page_ids.append(page_id)

    kids = " ".join(f"{page_id} 0 R" for page_id in page_ids)
    objects[page_tree_id - 1] = f"<< /Type /Pages /Count {len(page_ids)} /Kids [{kids}] >>".encode("utf-8")
    objects[catalog_id - 1] = f"<< /Type /Catalog /Pages {page_tree_id} 0 R >>".encode("utf-8")

    output = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets = [0]
    for index, body in enumerate(objects, start=1):
        offsets.append(len(output))
        output.extend(f"{index} 0 obj\n".encode("utf-8"))
        output.extend(body)
        output.extend(b"\nendobj\n")

    xref_offset = len(output)
    output.extend(f"xref\n0 {len(objects) + 1}\n".encode("utf-8"))
    output.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        output.extend(f"{offset:010d} 00000 n \n".encode("utf-8"))

    output.extend(
        (
            f"trailer\n<< /Size {len(objects) + 1} /Root {catalog_id} 0 R >>\n"
            f"startxref\n{xref_offset}\n%%EOF\n"
        ).encode("utf-8")
    )
    return bytes(output)


def chunked(items: list[dict[str, object]], size: int) -> list[list[dict[str, object]]]:
    return [items[index : index + size] for index in range(0, len(items), size)]


def main() -> None:
    base_dir = Path(__file__).resolve().parent
    input_path = base_dir / "swatches-backup.json"
    output_ai = base_dir / "fabric-palette-swatches.ai"
    output_pdf = base_dir / "fabric-palette-swatches.pdf"

    palettes = json.loads(input_path.read_text())
    pages = chunked(palettes, PALETTES_PER_PAGE)
    page_streams = [
        build_page_stream(page_palettes, page_number=index + 1, page_count=len(pages))
        for index, page_palettes in enumerate(pages)
    ]
    pdf_bytes = build_pdf(page_streams)

    output_ai.write_bytes(pdf_bytes)
    output_pdf.write_bytes(pdf_bytes)

    total_colors = sum(1 + len(palette["secondary"]) for palette in palettes)
    print(f"Wrote {output_ai}")
    print(f"Wrote {output_pdf}")
    print(f"Palettes: {len(palettes)}")
    print(f"Colors: {total_colors}")


if __name__ == "__main__":
    main()
