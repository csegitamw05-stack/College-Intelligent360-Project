import sys
import os
import importlib.util

# Ensure backend directory is in sys.path so 'app', 'scripts', etc. resolve
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Load backend/main.py under unique name 'backend_app_module' to prevent circular self-import
backend_main_path = os.path.join(backend_dir, "main.py")
spec = importlib.util.spec_from_file_location("backend_app_module", backend_main_path)
backend_app_module = importlib.util.module_from_spec(spec)
sys.modules["backend_app_module"] = backend_app_module
spec.loader.exec_module(backend_app_module)

# Expose app for Uvicorn
app = backend_app_module.app

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
