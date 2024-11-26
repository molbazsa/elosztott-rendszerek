import http.server
import socketserver

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
