import signal
import sys
import http.server
import socketserver

def sigint_handler(sig, frame):
    sys.exit(0)

signal.signal(signal.SIGINT, sigint_handler)

PORT = 8000

def run():
    Handler = http.server.SimpleHTTPRequestHandler

    with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
        print("Serving at port", PORT)
        httpd.serve_forever()

def main():
    try:
        run()
    except KeyboardInterrupt:
        print("Received interrupt")

if __name__ == "__main__":
    main()
