#!/usr/bin/env python3
"""
🚀 MPSYSTEM Backend Launcher - Простой запуск одним кликом!

Этот скрипт запускает FastAPI backend сервер с автоматической:
- Проверкой зависимостей
- Инициализацией базы данных
- Созданием тестовых данных
- Запуском сервера

Использование:
    python start.py
    или
    python3 start.py
"""

import os
import sys
import subprocess
import logging
from pathlib import Path

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def print_banner():
    """Печатаем красивый баннер"""
    banner = """
    ╔═══════════════════════════════════════════════════════════════╗
    ║                    🏭 MPSYSTEM ERP BACKEND                    ║
    ║                     Простой запуск сервера                    ║
    ╚═══════════════════════════════════════════════════════════════╝
    """
    print(banner)

def check_python_version():
    """Проверяем версию Python"""
    if sys.version_info < (3, 8):
        logger.error("❌ Требуется Python 3.8 или выше!")
        logger.error(f"   Текущая версия: {sys.version}")
        sys.exit(1)
    
    logger.info(f"✅ Python версия: {sys.version.split()[0]}")

def check_backend_directory():
    """Проверяем что существует папка backend"""
    backend_dir = Path('backend')
    if not backend_dir.exists():
        logger.error("❌ Папка 'backend' не найдена!")
        logger.error("   Убедитесь что запускаете скрипт из корня проекта")
        sys.exit(1)
    
    src_dir = backend_dir / 'src'
    if not src_dir.exists():
        logger.error("❌ Папка 'backend/src' не найдена!")
        sys.exit(1)
    
    logger.info("✅ Структура backend найдена")

def install_dependencies():
    """Устанавливаем зависимости"""
    requirements_file = Path('backend/requirements.txt')
    
    if not requirements_file.exists():
        logger.error("❌ Файл backend/requirements.txt не найден!")
        sys.exit(1)
    
    logger.info("📦 Проверяем и устанавливаем зависимости...")
    
    try:
        # Проверяем что pip доступен
        subprocess.run([sys.executable, '-m', 'pip', '--version'], 
                      check=True, capture_output=True)
        
        # Устанавливаем зависимости
        result = subprocess.run([
            sys.executable, '-m', 'pip', 'install', '-r', str(requirements_file)
        ], capture_output=True, text=True)
        
        if result.returncode != 0:
            logger.error("❌ Ошибка установки зависимостей:")
            logger.error(result.stderr)
            sys.exit(1)
            
        logger.info("✅ Зависимости установлены успешно")
        
    except subprocess.CalledProcessError as e:
        logger.error(f"❌ Ошибка при установке зависимостей: {e}")
        sys.exit(1)

def start_server():
    """Запускаем сервер"""
    logger.info("🚀 Запускаем MPSYSTEM Backend сервер...")
    
    # Добавляем backend/src в PYTHONPATH
    backend_src = Path('backend/src').absolute()
    env = os.environ.copy()
    current_pythonpath = env.get('PYTHONPATH', '')
    if current_pythonpath:
        env['PYTHONPATH'] = f"{backend_src}{os.pathsep}{current_pythonpath}"
    else:
        env['PYTHONPATH'] = str(backend_src)
    
    # Меняем директорию на backend для правильных путей
    os.chdir('backend')
    
    try:
        # Запускаем сервер через run_server.py
        run_server_script = Path('run_server.py')
        if run_server_script.exists():
            logger.info("📝 Используем run_server.py")
            subprocess.run([sys.executable, 'run_server.py'], env=env)
        else:
            # Альтернативный запуск напрямую через uvicorn
            logger.info("📝 Запуск через uvicorn")
            subprocess.run([
                sys.executable, '-m', 'uvicorn', 
                'app.main:app',
                '--host', '0.0.0.0',
                '--port', '8000',
                '--reload',
                '--reload-dir', 'src'
            ], env=env, cwd='src')
            
    except KeyboardInterrupt:
        logger.info("\n🛑 Сервер остановлен пользователем")
    except Exception as e:
        logger.error(f"❌ Ошибка запуска сервера: {e}")
        sys.exit(1)

def main():
    """Главная функция"""
    print_banner()
    
    logger.info("🔍 Проверяем систему...")
    check_python_version()
    check_backend_directory()
    
    logger.info("📦 Настраиваем зависимости...")
    install_dependencies()
    
    logger.info("🎯 Все проверки пройдены! Запускаем сервер...")
    print("\n" + "="*60)
    print("🌐 Backend будет доступен по адресу: http://localhost:8000")
    print("📚 API документация: http://localhost:8000/api/v1/docs")
    print("❤️ Health check: http://localhost:8000/health")
    print("📊 DB статистика: http://localhost:8000/db-stats")
    print("="*60)
    print("💡 Для остановки сервера нажмите Ctrl+C")
    print("="*60 + "\n")
    
    start_server()

if __name__ == "__main__":
    main()