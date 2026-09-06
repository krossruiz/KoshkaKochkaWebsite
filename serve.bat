@echo off
cd /d "%~dp0\.."
echo Starting local server at http://localhost:8000/project-directory/
echo (Serving from the parent folder so project subfolders are reachable too.)
echo Press Ctrl+C to stop.
python -m http.server 8000
