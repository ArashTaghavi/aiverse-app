@echo off
cd /d "%~dp0"
start "Laravel Server" cmd /k "php artisan serve"
start "Laravel Queue" cmd /k "php artisan queue:work"
start "Laravel Reverb" cmd /k "php artisan reverb:start --debug"
