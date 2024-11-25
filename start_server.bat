@echo off
echo Starting Path of Titans Server and ngrok tunnel...

:: Start the Node.js server in a new window
start cmd /k "node "C:\Users\bfjsu\Desktop\Tools\bots\INI Generator\server.js""

:: Wait a few seconds to let the server start
timeout /t 3

:: Start ngrok in a new window
start cmd /k "ngrok http --domain=funky-dassie-settling.ngrok-free.app 3001"

echo Server and ngrok tunnel are starting...
echo You can close this window now.