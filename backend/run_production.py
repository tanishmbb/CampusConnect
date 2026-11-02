"""
Production WSGI Runner for CampusConnect
Applies database migrations, collects static assets for WhiteNoise,
and boots a production-grade multi-threaded WSGI server (Waitress).
"""
import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from django.core.management import call_command

def main():
    print("=" * 65)
    print("  CampusConnect - Production WSGI Server Initializer")
    print("=" * 65)

    # 1. Run migrations
    print("[1/3] Applying database migrations...")
    call_command('migrate', interactive=False)

    # 2. Collect static files
    print("[2/3] Collecting static assets for WhiteNoise...")
    call_command('collectstatic', interactive=False)

    # 3. Start production server
    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', '8000'))

    print(f"[3/3] Starting production WSGI server on http://{host}:{port}...")
    try:
        from waitress import serve
        from config.wsgi import application
        print(f"Server is live at http://127.0.0.1:{port}/")
        serve(application, host=host, port=port, threads=8)
    except ImportError:
        print("Waitress not installed. Falling back to Django WSGI development runner.")
        call_command('runserver', f'{host}:{port}')

if __name__ == '__main__':
    main()
