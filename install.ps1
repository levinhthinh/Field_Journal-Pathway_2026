Write-Host ""
Write-Host "====================================="
Write-Host " Field Journal Installer (Windows)"
Write-Host "====================================="
Write-Host ""

Set-Location Field_Journal

py -m venv .venv

& ".\.venv\Scripts\Activate.ps1"

python -m pip install --upgrade pip

pip install -r ..\requirements.txt

python manage.py migrate

Write-Host ""
Write-Host "Installation complete!"
Write-Host ""
Write-Host "To run later:"
Write-Host ""
Write-Host "cd Field_Journal"
Write-Host ".\.venv\Scripts\Activate.ps1"
Write-Host "python manage.py runserver"