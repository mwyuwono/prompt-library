set projectDir to "/Users/mwy/Library/Mobile Documents/com~apple~CloudDocs/Projects/RB/fabric-collection-site"
set publicUrl to "http://127.0.0.1:5173/"
set adminUrl to "http://127.0.0.1:5173/admin"

set launcherScript to "
PROJECT_DIR=" & quoted form of projectDir & "
PORT=5173
PUBLIC_URL='http://127.0.0.1:5173/'
LOG_DIR=\"$HOME/Library/Logs\"
STATE_DIR=\"$HOME/Library/Application Support/RobertBrownLookbook\"
LOG_FILE=\"$LOG_DIR/RobertBrownLookbook.log\"
PID_FILE=\"$STATE_DIR/vite.pid\"

mkdir -p \"$LOG_DIR\" \"$STATE_DIR\"

if ! curl -fsS --max-time 2 \"$PUBLIC_URL\" >/dev/null 2>&1; then
  cd \"$PROJECT_DIR\" || exit 10

  if [ ! -d node_modules ]; then
    echo \"Missing node_modules. Run npm install in $PROJECT_DIR before using this launcher.\" >> \"$LOG_FILE\"
    exit 11
  fi

  nohup npm run dev -- --host 127.0.0.1 >> \"$LOG_FILE\" 2>&1 &
  echo $! > \"$PID_FILE\"
fi

for attempt in {1..40}; do
  if curl -fsS --max-time 2 \"$PUBLIC_URL\" >/dev/null 2>&1; then
    exit 0
  fi
  sleep 0.25
done

echo \"Timed out waiting for Robert Brown Lookbook on port $PORT.\" >> \"$LOG_FILE\"
exit 12
"

try
	do shell script "/bin/zsh -lc " & quoted form of launcherScript
	open location publicUrl
	open location adminUrl
	display notification "Public site and admin are open." with title "Robert Brown Lookbook"
on error errorMessage number errorNumber
	display dialog "Could not start the Robert Brown Lookbook local server." & return & return & errorMessage & return & return & "Error code: " & errorNumber buttons {"OK"} default button "OK" with icon caution
end try
