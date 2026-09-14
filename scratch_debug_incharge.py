import sys
sys.path.insert(0, 'backend')

from app.core.database import SessionLocal
from app.models.user import User
from app.api.v1.endpoints.dashboard import incharge_dashboard

db = SessionLocal()
user = db.query(User).filter(User.email == 'incharge_cse@campus.edu').first()
print("Found User:", user.email, "Role:", user.role, "Dept:", user.department)

try:
    res = incharge_dashboard(current_user=user, db=db)
    print("Incharge Dashboard Result Keys:", list(res.keys()))
except Exception as e:
    import traceback
    traceback.print_exc()
finally:
    db.close()
