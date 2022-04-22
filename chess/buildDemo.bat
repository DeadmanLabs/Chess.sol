@echo off
start cmd.exe /c "npm install"
echo Wait for second window to close...
PAUSE
del %cd%\node_modules\react-scripts\config\webpack.config.js
copy /y %cd%\stream-patch.js %cd%\node_modules\react-scripts\config\webpack.config.js