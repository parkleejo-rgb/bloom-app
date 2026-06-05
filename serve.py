#!/usr/bin/env python3
import http.server, socketserver, os

os.chdir('/Users/JoPark/Desktop/Bloom-app')
PORT = 3737

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    httpd.serve_forever()
