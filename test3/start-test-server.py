#!/usr/bin/env python3
"""
Simple HTTP server for testing neuOS glass themes
"""

import http.server
import socketserver
import os
import sys

# Change to the test3 directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers for testing
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def main():
    try:
        with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
            print(f"🚀 Test server started!")
            print(f"📁 Serving files from: {os.getcwd()}")
            print(f"🌐 Open your browser and go to: http://localhost:{PORT}")
            print(f"📋 Test URL: http://localhost:{PORT}/index.html")
            print(f"⏹️  Press Ctrl+C to stop the server")
            print(f"\n✨ Features:")
            print(f"   • Theme switcher to test different glass effects")
            print(f"   • Interactive terminal and codex windows")
            print(f"   • Draggable windows")
            print(f"   • Safe testing environment (won't affect production)")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print(f"\n🛑 Server stopped")
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Port {PORT} is already in use!")
            print(f"💡 Try a different port or stop the existing server")
        else:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    main() 