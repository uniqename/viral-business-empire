#!/usr/bin/env python3
import http.server
import socketserver
import os
import webbrowser
from datetime import datetime
import socket

def get_local_ip():
    """Get the local IP address"""
    try:
        # Connect to a remote server to determine local IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except:
        return "127.0.0.1"

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/' or self.path == '/dashboard':
            self.path = '/web-dashboard/online-dashboard.html'
        super().do_GET()
    
    def log_message(self, format, *args):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {format % args}")

def main():
    PORT = 8082
    local_ip = get_local_ip()
    
    print("🚀 INSTANT ONLINE DASHBOARD")
    print("=" * 40)
    print(f"📱 Your Dashboard URLs:")
    print(f"   Computer: http://localhost:{PORT}")
    print(f"   Phone/Mobile: http://{local_ip}:{PORT}")
    print(f"   Any Device on WiFi: http://{local_ip}:{PORT}")
    print("=" * 40)
    print("🌍 SHARE WITH ANYONE:")
    print(f"   Send this link: http://{local_ip}:{PORT}")
    print("=" * 40)
    print("💡 Features:")
    print("   ✅ Works on ANY device")
    print("   ✅ No localhost issues")
    print("   ✅ Real revenue tracking")
    print("   ✅ Bank account setup")
    print("   ✅ Mobile optimized")
    print("=" * 40)
    print("Press Ctrl+C to stop")
    print()
    
    # Auto-open browser
    try:
        webbrowser.open(f'http://localhost:{PORT}')
    except:
        pass
    
    # Start server on all interfaces
    with socketserver.TCPServer(("0.0.0.0", PORT), CustomHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n👋 Dashboard stopped")

if __name__ == "__main__":
    main()
