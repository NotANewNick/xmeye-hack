#!/usr/bin/env python3
"""
Camera Proxy Server for CameraViewer.html
==========================================
Serves CameraViewer.html from localhost and transparently proxies
all camera requests to the real camera, solving the browser CORS issue.

Usage:
    python3 proxy.py [camera_ip] [port]

Defaults: camera_ip=192.168.1.10, port=8000

Open http://localhost:8000 in your browser.
"""

import http.server
import urllib.request
import urllib.error
import os
import sys
import threading
import webbrowser
import json
from http.cookiejar import CookieJar

CAMERA_IP    = sys.argv[1] if len(sys.argv) > 1 else '192.168.1.10'
PORT         = int(sys.argv[2]) if len(sys.argv) > 2 else 8000
CAM_USER     = sys.argv[3] if len(sys.argv) > 3 else 'admin'
CAM_PASS     = sys.argv[4] if len(sys.argv) > 4 else 'admin'
SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))
HTML_FILE    = os.path.join(SCRIPT_DIR, 'CameraViewer.html')
PROXY_BASE   = f'http://localhost:{PORT}'

# Mutable camera target — updated at runtime via /set-cam-ip from the browser
_cam = {'ip': CAMERA_IP}

def CAMERA_BASE():  return f'http://{_cam["ip"]}'
def CAMERA_ONVIF(): return f'http://{_cam["ip"]}:8899'

# Shared cookie jar so login session is preserved across requests
_cj = CookieJar()
# Digest auth handler for camera endpoints that require HTTP auth (e.g. snapshots)
_pwmgr = urllib.request.HTTPPasswordMgrWithDefaultRealm()
_pwmgr.add_password(None, CAMERA_BASE(),  CAM_USER, CAM_PASS)
_pwmgr.add_password(None, CAMERA_ONVIF(), CAM_USER, CAM_PASS)
_opener = urllib.request.build_opener(
    urllib.request.HTTPCookieProcessor(_cj),
    urllib.request.HTTPDigestAuthHandler(_pwmgr),
    urllib.request.HTTPBasicAuthHandler(_pwmgr),
)

# Thread lock for cookie jar access
_lock = threading.Lock()


class ProxyHandler(http.server.BaseHTTPRequestHandler):

    def log_message(self, fmt, *args):
        print(f'  {self.command:7s} {self.path[:80]}')

    def do_GET(self):     self._handle()
    def do_POST(self):    self._handle()
    def do_OPTIONS(self): self._options()

    def _options(self):
        self.send_response(200)
        self._cors_headers()
        self.send_header('Allow', 'GET, POST, OPTIONS')
        self.end_headers()

    def _cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Credentials', 'true')
        self.send_header('Access-Control-Allow-Headers',
                         'Content-Type, SOAPAction, Authorization')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')

    def _handle(self):
        # Serve the HTML viewer at root paths
        if self.path.split('?')[0] in ('/', '/index.html', '/CameraViewer.html'):
            self._serve_html()
            return
        # Allow browser to push camera IP so proxy routes to the right target
        if self.path == '/set-cam-ip' and self.command == 'POST':
            self._handle_set_ip()
            return
        # Allow browser to push login credentials so proxy can use them for Digest auth
        if self.path == '/set-cam-credentials' and self.command == 'POST':
            self._handle_set_creds()
            return
        # Proxy everything else to the camera
        self._proxy()

    def _handle_set_ip(self):
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length) if length else b''
        try:
            data = json.loads(body)
            ip = data.get('ip', '').strip()
            if ip:
                with _lock:
                    _cam['ip'] = ip
                    _pwmgr.add_password(None, CAMERA_BASE(),  CAM_USER, CAM_PASS)
                    _pwmgr.add_password(None, CAMERA_ONVIF(), CAM_USER, CAM_PASS)
                print(f'  [proxy] camera IP changed to {ip}')
        except Exception:
            pass
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self._cors_headers()
        self.end_headers()
        self.wfile.write(b'{"ok":true}')

    def _handle_set_creds(self):
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length) if length else b''
        try:
            data = json.loads(body)
            user = data.get('user', '')
            password = data.get('password', '')
            if user:
                with _lock:
                    _pwmgr.add_password(None, CAMERA_BASE(),  user, password)
                    _pwmgr.add_password(None, CAMERA_ONVIF(), user, password)
                print(f'  [proxy] snapshot credentials updated: {user}')
        except Exception:
            pass
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self._cors_headers()
        self.end_headers()
        self.wfile.write(b'{"ok":true}')

    def _serve_html(self):
        try:
            with open(HTML_FILE, 'rb') as f:
                content = f.read()
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(content)))
            self.send_header('Cache-Control', 'no-cache')
            self.end_headers()
            self.wfile.write(content)
        except FileNotFoundError:
            self.send_error(404, f'CameraViewer.html not found at {HTML_FILE}')
        except Exception as e:
            self.send_error(500, str(e))

    def _proxy(self):
        # Route /onvif/ paths to port 8899 where ONVIF services live
        if self.path.startswith('/onvif/'):
            cam_url = CAMERA_ONVIF() + self.path
        else:
            cam_url = CAMERA_BASE() + self.path

        # Read request body for POST
        body = None
        if self.command == 'POST':
            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length) if length else b''

        # Forward relevant request headers
        req_headers = {}
        for h in ('Content-Type', 'SOAPAction', 'Authorization'):
            v = self.headers.get(h)
            if v:
                req_headers[h] = v

        try:
            req = urllib.request.Request(
                cam_url,
                data=body,
                headers=req_headers,
                method=self.command
            )
            with _lock:
                resp = _opener.open(req, timeout=30)
                data = resp.read()

            # Rewrite camera IP in response so ONVIF XAddr / redirect URLs
            # point back through this proxy instead of directly to camera
            data = data.replace(CAMERA_ONVIF().encode(), PROXY_BASE.encode())
            data = data.replace(CAMERA_BASE().encode(), PROXY_BASE.encode())

            self.send_response(resp.status)
            for key in ('Content-Type', 'WWW-Authenticate'):
                val = resp.headers.get(key)
                if val:
                    self.send_header(key, val)
            self._cors_headers()
            self.send_header('Content-Length', str(len(data)))
            self.end_headers()
            self.wfile.write(data)

        except urllib.error.HTTPError as e:
            data = e.read()
            data = data.replace(CAMERA_ONVIF().encode(), PROXY_BASE.encode())
            data = data.replace(CAMERA_BASE().encode(), PROXY_BASE.encode())
            self.send_response(e.code)
            for key in ('Content-Type',):
                val = e.headers.get(key)
                if val:
                    self.send_header(key, val)
            self._cors_headers()
            self.send_header('Content-Length', str(len(data)))
            self.end_headers()
            self.wfile.write(data)

        except urllib.error.URLError as e:
            msg = f'Cannot reach camera at {CAMERA_BASE()}: {e.reason}'.encode()
            self.send_response(502)
            self.send_header('Content-Type', 'text/plain')
            self.send_header('Content-Length', str(len(msg)))
            self.end_headers()
            self.wfile.write(msg)

        except Exception as e:
            msg = f'Proxy error: {e}'.encode()
            self.send_response(500)
            self.send_header('Content-Type', 'text/plain')
            self.send_header('Content-Length', str(len(msg)))
            self.end_headers()
            self.wfile.write(msg)


if __name__ == '__main__':
    if not os.path.exists(HTML_FILE):
        print(f'ERROR: {HTML_FILE} not found.')
        sys.exit(1)

    server = http.server.ThreadingHTTPServer(('localhost', PORT), ProxyHandler)
    print(f'┌─────────────────────────────────────────────┐')
    print(f'│  Camera Proxy Server                        │')
    print(f'│  Viewer  : {PROXY_BASE:<33s}│')
    print(f'│  Camera  : {CAMERA_BASE():<33s}│')
    print(f'│  Cam auth: {(CAM_USER+"/"+CAM_PASS):<33s}│')
    print(f'└─────────────────────────────────────────────┘')
    print(f'  Open browser at {PROXY_BASE}')
    print(f'  Press Ctrl+C to stop\n')

    threading.Timer(1.5, lambda: webbrowser.open(PROXY_BASE)).start()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nProxy stopped.')
