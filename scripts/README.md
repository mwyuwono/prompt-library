# App Launchers Setup

This directory contains a script to create macOS .app launchers for the Prompts Library.

## Quick Setup

After cloning this repo on a new machine, run:

```bash
./scripts/create-app-launchers.sh
```

This creates two apps in your `~/Applications` folder:
- **Prompts Library** - Opens the public prompts site
- **Prompts Admin** - Opens the admin editor

Both apps automatically start the server if needed.

## What It Does

The script:
1. Detects your project directory location automatically
2. Creates proper macOS .app bundles with Info.plist files
3. Generates executable scripts with correct paths
4. Installs apps to `~/Applications`

## Manual Installation

If you prefer, you can also run the apps directly from the command line:

```bash
# Start server and open public site
cd prompt-library && node server.js &
open http://localhost:3000

# Open admin
open http://localhost:3000/admin.html
```

## Why Not Commit .app Bundles?

.app bundles are directories with macOS-specific metadata that don't sync well through Git. This script approach:
- ✅ Works across different machines with different paths
- ✅ Automatically adapts to wherever you clone the repo
- ✅ Keeps the repo clean and portable
- ✅ Easy to regenerate if apps get corrupted
