set projectDir to "/Users/mwy/Library/Mobile Documents/com~apple~CloudDocs/Projects/prompts-library/rb-fabric-collection"

set launcherScript to "
PROJECT_DIR=" & quoted form of projectDir & "
PORT_START=5173
PORT_END=5180
LOG_DIR=\"$HOME/Library/Logs\"
STATE_DIR=\"$HOME/Library/Application Support/RobertBrownLookbook\"
LOG_FILE=\"$LOG_DIR/RobertBrownLookbook.log\"
PID_FILE=\"$STATE_DIR/vite.pid\"

mkdir -p \"$LOG_DIR\" \"$STATE_DIR\"

is_lookbook() {
  local port=\"$1\"
  curl -fsS --max-time 2 \"http://127.0.0.1:$port/api/fabric-content\" 2>/dev/null | grep -q 'Robert Brown'
}

for port in $(seq \"$PORT_START\" \"$PORT_END\"); do
  if is_lookbook \"$port\"; then
    echo \"http://127.0.0.1:$port/\"
    exit 0
  fi
done

cd \"$PROJECT_DIR\" || exit 10

if [ ! -d node_modules ]; then
  echo \"Missing node_modules. Run npm install in $PROJECT_DIR before using this launcher.\" >> \"$LOG_FILE\"
  exit 11
fi

for port in $(seq \"$PORT_START\" \"$PORT_END\"); do
  if ! lsof -nP -iTCP:\"$port\" -sTCP:LISTEN >/dev/null 2>&1; then
    nohup npm run dev -- --host 127.0.0.1 --port \"$port\" --strictPort >> \"$LOG_FILE\" 2>&1 &
    echo $! > \"$PID_FILE\"

    for attempt in {1..60}; do
      if is_lookbook \"$port\"; then
        echo \"http://127.0.0.1:$port/\"
        exit 0
      fi
      sleep 0.25
    done

    echo \"Timed out waiting for Robert Brown Lookbook on port $port.\" >> \"$LOG_FILE\"
    exit 12
  fi
done

echo \"No available local port from $PORT_START to $PORT_END.\" >> \"$LOG_FILE\"
exit 12
"

try
	set publicUrl to do shell script "/bin/zsh -lc " & quoted form of launcherScript
	open location publicUrl
	open location (publicUrl & "admin")
	display notification "Public site and admin are open." with title "Robert Brown Lookbook"
on error errorMessage number errorNumber
	display dialog "Could not start the Robert Brown Lookbook local server." & return & return & errorMessage & return & return & "Error code: " & errorNumber buttons {"OK"} default button "OK" with icon caution
end try
