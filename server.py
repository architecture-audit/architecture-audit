#!/usr/bin/env python3
"""
Development server for AI Architecture Audit website
Handles proper routing for single-page application
"""

import os
import mimetypes
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse

class SPAHTTPRequestHandler(SimpleHTTPRequestHandler):
    """HTTP request handler for single-page applications"""
    
    def __init__(self, *args, **kwargs):
        # Set the directory to serve from
        super().__init__(*args, directory='docs', **kwargs)
    
    def do_GET(self):
        """Handle GET requests with SPA routing"""
        # Parse the URL
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        # Remove trailing slash for consistency
        if path != '/' and path.endswith('/'):
            path = path[:-1]
        
        # Determine the file to serve
        if path == '/':
            self.path = '/index.html'
        elif not '.' in os.path.basename(path):
            # No file extension, try to serve index.html from that directory
            test_path = f"{path}/index.html"
            full_path = os.path.join('docs', test_path.lstrip('/'))
            if os.path.exists(full_path):
                self.path = test_path
            elif os.path.exists(os.path.join('docs', path.lstrip('/') + '.html')):
                self.path = path + '.html'
        
        # Serve the file
        return super().do_GET()
    
    def end_headers(self):
        """Add custom headers"""
        # Add CORS headers for development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        
        # Cache control for development
        if self.path.endswith('.html'):
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        elif self.path.endswith(('.js', '.css')):
            self.send_header('Cache-Control', 'public, max-age=3600')
        elif self.path.endswith(('.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico')):
            self.send_header('Cache-Control', 'public, max-age=86400')
        
        super().end_headers()
    
    def guess_type(self, path):
        """Guess the MIME type of a file"""
        mimetype = super().guess_type(path)
        
        # Add support for modern web formats
        if path.endswith('.webp'):
            return 'image/webp'
        elif path.endswith('.woff2'):
            return 'font/woff2'
        elif path.endswith('.woff'):
            return 'font/woff'
        elif path.endswith('.json'):
            return 'application/json'
        elif path.endswith('.webmanifest'):
            return 'application/manifest+json'
        
        return mimetype

def run_server(port=8888):
    """Run the development server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, SPAHTTPRequestHandler)
    
    print(f"""\n🚀 AI Architecture Audit Development Server
    
    Server running at:
    ➤ http://localhost:{port}
    ➤ http://127.0.0.1:{port}
    
    Available routes:
    ➤ Home: http://localhost:{port}/
    ➤ Calculators: http://localhost:{port}/[calculator-name]/calculator.html
    ➤ Documentation: http://localhost:{port}/[doc-name]/
    
    Press Ctrl+C to stop the server.
    """)
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\u2728 Server stopped.")
        httpd.shutdown()

if __name__ == '__main__':
    import sys
    
    # Check if port is provided as argument
    port = 8888
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print(f"Invalid port: {sys.argv[1]}. Using default port 8888.")
    
    # Start the server
    run_server(port)