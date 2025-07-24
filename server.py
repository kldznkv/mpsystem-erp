#!/usr/bin/env python3
import http.server
import socketserver
import os
import webbrowser
from urllib.parse import urlparse, parse_qs

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Добавляем заголовки для поддержки CORS
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_GET(self):
        # Обработка запросов к API
        if self.path.startswith('/api/'):
            self.handle_api_request()
        else:
            super().do_GET()
    
    def do_POST(self):
        if self.path.startswith('/api/'):
            self.handle_api_request()
        else:
            self.send_error(404)
    
    def handle_api_request(self):
        # Простой API для демонстрации
        if self.path == '/api/stats':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            import json
            import random
            
            stats = {
                'users': random.randint(50, 200),
                'views': random.randint(1000, 5000),
                'orders': random.randint(10, 100),
                'timestamp': int(time.time()) if 'time' in globals() else 0
            }
            
            self.wfile.write(json.dumps(stats).encode())
            
        elif self.path == '/api/submit':
            # Обработка отправки формы
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length).decode('utf-8')
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            response = {'status': 'success', 'message': 'Данные получены!'}
            self.wfile.write(json.dumps(response).encode())
            
            print(f"Получены данные формы: {post_data}")
        else:
            self.send_error(404)

def main():
    PORT = 8000
    
    # Проверяем, существует ли index.html
    if not os.path.exists('index.html'):
        print("Ошибка: файл index.html не найден!")
        return
    
    try:
        with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
            print(f"🚀 Сервер запущен на http://localhost:{PORT}")
            print(f"📁 Корневая папка: {os.getcwd()}")
            print("⭐ Тестовый интерфейс готов к использованию!")
            print("\n🌐 Откройте браузер и перейдите по адресу:")
            print(f"   http://localhost:{PORT}")
            print("\n💡 Функции интерфейса:")
            print("   • Дашборд с графиками")
            print("   • Настройки приложения")
            print("   • Редактор заметок")
            print("   • Интерактивная форма")
            print("   • Данные в реальном времени")
            print("\n⚠️  Для остановки сервера нажмите Ctrl+C")
            
            # Автоматически открываем браузер (опционально)
            try:
                webbrowser.open(f'http://localhost:{PORT}')
            except:
                pass
            
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 Сервер остановлен")
    except OSError as e:
        if e.errno == 98:  # Address already in use
            print(f"❌ Порт {PORT} уже используется!")
            print("Попробуйте использовать другой порт или остановите процесс, использующий этот порт.")
        else:
            print(f"❌ Ошибка запуска сервера: {e}")

if __name__ == "__main__":
    main()