# Gemma Chunk-Processor

## USER CONFIG

### OBJECTIVE
<!-- What should Gemma do to each chunk or file? Be specific and direct.
     Example: "Translate each passage to French, preserving formatting."
     Example: "Extract all proper nouns and output them as a comma-separated list." -->


### INPUT
<!-- Absolute path or glob pattern.
     Single file : /path/to/file.txt
     Multiple    : /path/to/docs/*.txt
     Mixed types : /path/to/assets/*   (text + image files handled automatically) -->


### OUTPUT_MODE
<!-- How to join results in the output file:
     seamless  — no separators between chunks (best for cleaning, rewriting)
     separated — blank line between chunks (best for extraction, classification) -->
seamless

---

## Task

Write a Python script that processes the INPUT file(s) using the Ollama local API (`gemma4:e2b`) to accomplish the OBJECTIVE. Each unit (chunk or file) is processed independently — no context passes between units.

Save the output file in the same directory as the first matched input file, using the input filename plus a short descriptive suffix derived from the OBJECTIVE (e.g. `_clean`, `_translated`, `_extracted`).

---

### API

- Endpoint: `http://localhost:11434/api/generate`
- Model: `gemma4:e2b`
- Always use `stream: true` — prevents aiohttp read-timeouts on long responses
- Options: `temperature: 0`, `num_ctx: 4096`
- Use `aiohttp` + `asyncio`

---

### File type detection

Detect each file's type by extension (case-insensitive):

- **Text**: `.txt` `.md` `.csv` `.json` `.xml` `.html` `.rst` `.log`
- **Image**: `.jpg` `.jpeg` `.png` `.gif` `.webp` `.bmp`
- **Unknown**: exit with a clear error asking the user to add the extension to the detection list

A single glob can return a mix of text and image files; each is handled according to its own type.

---

### System prompt

Derive a tight, task-specific system prompt from the OBJECTIVE. Append:
`"Output only the result. Do not summarize, add commentary, or change anything beyond the stated task."`

---

### Text file processing

- Choose a chunk size appropriate for `gemma4:e2b` — lean toward smaller chunks (~150 words) for output quality; adjust if the OBJECTIVE clearly benefits from wider context
- Split on whitespace, never mid-word
- Send each chunk as a text-only request (no `images` field)
- Join results according to `OUTPUT_MODE`:
  - `seamless` — concatenate without separators
  - `separated` — join with a blank line between chunks

---

### Image file processing

- One request per image — never chunk images
- Base64-encode the file and send via the `images` field:
  `{"model": "gemma4:e2b", "prompt": PROMPT, "images": [BASE64_STRING], "stream": true, "options": {...}}`
- Write the model's text response to the output file

---

### Multi-file output

- More than one matched file: prefix each file's output block with `=== <filename> ===\n`
- Single file: no prefix

Write all results in sorted input-file order.

---

### Concurrency and timeout

- Process all units sequentially (`CONCURRENCY = 1`)
- Per-unit timeout: 600 seconds

---

### Retry

- Retry failed units up to 2 times (wait 5 s, then 10 s)
- On total failure:
  - Text chunk: write the original chunk unchanged
  - Image file: write `[ERROR: <filename> could not be processed]`
  - Log details to `review.log` in the output directory

---

### Progress and status

- Print startup summary: model, input pattern, file count, output path, chunk size
- Show a `tqdm` progress bar; use `tqdm.write()` for all per-unit lines
- Print final summary: output path, log path, error count (omit if 0)

---

### Dependencies and setup

- Requires: `aiohttp`, `tqdm`
- Add `pip install aiohttp tqdm` as a comment at the top of the script
- Create a `.venv` in the script's directory if one doesn't exist; install deps into it
