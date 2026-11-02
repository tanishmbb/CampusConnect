import logging
from pathlib import Path
from django.conf import settings
from django.db import connection
from django.http import HttpResponse, JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

logger = logging.getLogger(__name__)

CONTENT_TYPES = {
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.html': 'text/html; charset=utf-8',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.map': 'application/json',
    '.webmanifest': 'application/manifest+json',
}


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Production health check endpoint for container orchestrators,
    load balancers, and monitoring tools.
    """
    db_healthy = True
    db_error = None
    try:
        connection.ensure_connection()
    except Exception as exc:
        db_healthy = False
        db_error = str(exc)
        logger.error(f"Health check database failure: {exc}")

    status_code = 200 if db_healthy else 503
    return Response({
        'status': 'healthy' if db_healthy else 'degraded',
        'database': 'connected' if db_healthy else 'error',
        'database_error': db_error,
        'debug': settings.DEBUG,
    }, status=status_code)


def serve_react(request, path=''):
    """
    Serve the production React build (Vite dist).
    - Hashed static assets receive immutable long-term caching headers.
    - index.html is served with no-cache to guarantee immediate UI updates on redeploy.
    - Path traversal attacks are strictly blocked using Path.is_relative_to().
    - Unmatched /api/ requests return 404 JSON instead of HTML to avoid frontend parsing errors.
    """
    if path.startswith('api/') or request.path.startswith('/api/'):
        return JsonResponse({'error': 'API endpoint not found', 'path': request.path}, status=404)

    frontend_dir = Path(settings.FRONTEND_DIR).resolve()

    if path:
        try:
            file_path = (frontend_dir / path).resolve()
            # Security guard against directory traversal
            if file_path.is_relative_to(frontend_dir) and file_path.is_file():
                suffix = file_path.suffix.lower()
                content_type = CONTENT_TYPES.get(suffix, 'application/octet-stream')
                response = HttpResponse(file_path.read_bytes(), content_type=content_type)
                # Static assets with hashed filenames can be cached for 1 year
                if '/assets/' in path or path.startswith('assets/'):
                    response['Cache-Control'] = 'public, max-age=31536000, immutable'
                else:
                    response['Cache-Control'] = 'public, max-age=86400'
                return response
        except (ValueError, Exception) as exc:
            logger.warning(f"Static file access blocked: {path} ({exc})")

    index_file = frontend_dir / 'index.html'
    if not index_file.exists():
        return HttpResponse(
            '<!doctype html><html><head><title>CampusConnect</title></head>'
            '<body style="font-family:sans-serif;padding:40px;text-align:center;">'
            '<h2>CampusConnect Production Server Running</h2>'
            '<p>Frontend assets are not built yet. Run: <code>npm run build</code> in the frontend folder.</p>'
            '<p><a href="/admin/">Django Admin</a> | <a href="/api/health/">Health Check</a></p>'
            '</body></html>',
            content_type='text/html',
            status=503,
        )

    response = HttpResponse(index_file.read_bytes(), content_type='text/html; charset=utf-8')
    # index.html must never be cached so users receive new bundle hashes immediately
    response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response['Pragma'] = 'no-cache'
    response['Expires'] = '0'
    return response


def custom_404_view(request, exception=None):
    if request.path.startswith('/api/'):
        return JsonResponse({'error': 'API endpoint not found', 'path': request.path}, status=404)
    return serve_react(request)


def custom_500_view(request):
    if request.path.startswith('/api/'):
        return JsonResponse({'error': 'Internal server error occurred. Please contact support.'}, status=500)
    return JsonResponse({'error': 'Server error'}, status=500)
