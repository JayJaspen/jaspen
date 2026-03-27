@echo off
cd /d C:\Users\info\Desktop\Jaspen
git add .
git commit -m "Initial commit"
git branch -M main
git remote set-url origin https://github.com/JayJaspen/jaspen.git
git push -u origin main
echo.
echo === KLAR! ===
pause
