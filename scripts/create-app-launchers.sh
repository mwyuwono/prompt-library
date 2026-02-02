#!/bin/bash

# Create macOS .app launchers for Prompts Library
# Run this script after cloning the repo on a new machine

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
APPS_DIR="$HOME/Applications"

echo "Creating Prompts Library app launchers..."
echo "Project directory: $PROJECT_DIR"
echo "Apps will be installed to: $APPS_DIR"
echo ""

# Function to create an app bundle
create_app() {
    local APP_NAME="$1"
    local URL_PATH="$2"
    local APP_DIR="$APPS_DIR/$APP_NAME.app"
    
    echo "Creating $APP_NAME.app..."
    
    # Create directory structure
    mkdir -p "$APP_DIR/Contents/MacOS"
    
    # Create Info.plist
    cat > "$APP_DIR/Contents/Info.plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleExecutable</key>
	<string>$APP_NAME</string>
	<key>CFBundleIdentifier</key>
	<string>com.weaver-yuwono.$(echo "$APP_NAME" | tr '[:upper:] ' '[:lower:]-')</string>
	<key>CFBundleName</key>
	<string>$APP_NAME</string>
	<key>CFBundleDisplayName</key>
	<string>$APP_NAME</string>
	<key>CFBundleVersion</key>
	<string>1.0</string>
	<key>CFBundleShortVersionString</key>
	<string>1.0</string>
	<key>CFBundlePackageType</key>
	<string>APPL</string>
	<key>LSMinimumSystemVersion</key>
	<string>10.15</string>
	<key>LSUIElement</key>
	<false/>
</dict>
</plist>
EOF

    # Create executable script
    cat > "$APP_DIR/Contents/MacOS/$APP_NAME" << EOF
#!/bin/bash

# $APP_NAME Launcher
# Opens $URL_PATH

PROJECT_DIR="$PROJECT_DIR"
SITE_URL="http://localhost:3001$URL_PATH"
PORT=3001

# Function to check if server is running
is_server_running() {
    curl -s --connect-timeout 1 "http://localhost:\${PORT}" > /dev/null 2>&1
    return \$?
}

# Function to start the server
start_server() {
    echo "Starting Prompts Library server..."
    cd "\$PROJECT_DIR"
    
    # Start server in background
    nohup node server.js > /dev/null 2>&1 &
    
    # Wait for server to be ready (max 10 seconds)
    for i in {1..20}; do
        if is_server_running; then
            echo "Server started successfully"
            return 0
        fi
        sleep 0.5
    done
    
    echo "Warning: Server may not have started properly"
    return 1
}

# Main execution
if ! is_server_running; then
    start_server
fi

# Open in default browser
open "\$SITE_URL"
EOF

    # Make executable
    chmod +x "$APP_DIR/Contents/MacOS/$APP_NAME"
    
    echo "✅ Created $APP_NAME.app"
    echo ""
}

# Create both apps
create_app "Prompts Library" ""
create_app "Prompts Admin" "/admin.html"

echo "✅ Done! You can now launch:"
echo "   - Prompts Library (public site)"
echo "   - Prompts Admin (editor)"
echo ""
echo "Find them in Applications folder or Spotlight search."
