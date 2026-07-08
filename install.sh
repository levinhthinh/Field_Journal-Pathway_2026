#!/usr/bin/env bash

set -e

echo "====================================="
echo " Field Journal Installer (Linux)"
echo "====================================="

if ! command -v python >/dev/null 2>&1; then
    echo "Python  is not installed."
    exit 1
fi

cd Field_Journal

echo "Creating virtual environment..."

python -m venv .venv

echo "Activating virtual environment..."

source .venv/bin/activate

echo "Updating pip..."

python -m pip install --upgrade pip

echo "Installing dependencies..."

pip install -r ../requirements.txt

echo "Running migrations..."

python manage.py migrate

echo
echo "====================================="
echo "Installation complete!"
echo
echo "Run the project with:"
echo
echo "cd Field_Journal"
echo "source .venv/bin/activate"
echo "python manage.py runserver"
echo "====================================="