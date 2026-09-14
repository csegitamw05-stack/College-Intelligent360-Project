"""
Domain Modules Endpoints for Campus Intelligence 360
Covers all 9 Core Modules:
Attendance, Academics, Assessments, Labs, Engagement, Faculty Activities, Events, Placements, Research.
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, Body, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date

from app.core.database import get_db
from app.models.org import Subject, Department
from app.models.academics import Attendance, AcademicPerformance, Assessment, LabPerformance, Lab
from app.models.activities import StudentEngagement, FacultyActivity, Event, Placement, Research
from app.models.people import Student, Faculty

router = APIRouter(prefix="/modules", tags=["9 Domain Data Modules"])


# 1. Attendance Module
@router.get("/attendance", summary="Get Attendance Module Data & Analytics")
def get_attendance_module(
    department_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Attendance).join(Student, Attendance.student_id == Student.id).filter(Attendance.is_deleted == False)
    if department_id:
        query = query.filter(Student.department_id == department_id)

    total_records = query.count()
    present_records = query.filter(Attendance.status == "Present").count()
    absent_records = query.filter(Attendance.status == "Absent").count()
    late_records = query.filter(Attendance.status == "Late").count()
    
    avg_rate = round((present_records / total_records * 100.0) if total_records > 0 else 0.0, 1)

    recent_records = query.order_by(Attendance.date.desc()).limit(20).all()
    records_list = []
    for r in recent_records:
        records_list.append({
            "id": r.id,
            "student_name": r.student.name if r.student else "N/A",
            "enrollment_number": r.student.enrollment_number if r.student else "N/A",
            "subject_name": r.subject.name if r.subject else "N/A",
            "date": r.date.isoformat() if r.date else None,
            "status": r.status
        })

    return {
        "module": "Attendance",
        "total_records": total_records,
        "present_count": present_records,
        "absent_count": absent_records,
        "late_count": late_records,
        "average_attendance_rate": avg_rate,
        "recent_logs": records_list
    }


# 2. Academic Performance Module
@router.get("/academics", summary="Get Academic Performance & GPA Analytics")
def get_academics_module(
    department_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(AcademicPerformance).join(Student, AcademicPerformance.student_id == Student.id).filter(AcademicPerformance.is_deleted == False)
    if department_id:
        query = query.filter(Student.department_id == department_id)

    avg_cgpa = db.query(func.avg(AcademicPerformance.cgpa)).scalar() or 0.0
    deans_list_count = query.filter(AcademicPerformance.cgpa >= 8.5).count()
    warning_count = query.filter(AcademicPerformance.cgpa < 6.0).count()

    perfs = query.order_by(AcademicPerformance.cgpa.desc()).limit(25).all()
    student_perfs = []
    for p in perfs:
        student_perfs.append({
            "id": p.id,
            "student_name": p.student.name if p.student else "N/A",
            "enrollment_number": p.student.enrollment_number if p.student else "N/A",
            "department": p.student.department.name if (p.student and p.student.department) else "N/A",
            "semester": p.semester,
            "sgpa": p.sgpa,
            "cgpa": p.cgpa,
            "status": "Dean's List" if p.cgpa >= 8.5 else ("Academic Warning" if p.cgpa < 6.0 else "Satisfactory")
        })

    return {
        "module": "Academic Performance",
        "average_cgpa": round(float(avg_cgpa), 2),
        "deans_list_count": deans_list_count,
        "academic_warning_count": warning_count,
        "records": student_perfs
    }


# 3. Assessments Module
@router.get("/assessments", summary="Get Assessments & Exams Data")
def get_assessments_module(db: Session = Depends(get_db)):
    assessments = db.query(Assessment).filter(Assessment.is_deleted == False).all()
    items = []
    for a in assessments:
        items.append({
            "id": a.id,
            "subject": a.subject.name if a.subject else "N/A",
            "subject_code": a.subject.code if a.subject else "N/A",
            "name": a.name,
            "date": a.date.isoformat() if a.date else None,
            "max_marks": a.max_marks,
            "weightage": a.weightage
        })
    return {"module": "Assessments", "count": len(items), "assessments": items}


# 4. Labs Module
@router.get("/labs", summary="Get Labs & Lab Performance Analytics")
def get_labs_module(db: Session = Depends(get_db)):
    labs = db.query(Lab).filter(Lab.is_deleted == False).all()
    lab_list = []
    for l in labs:
        perfs = db.query(LabPerformance).filter(LabPerformance.lab_id == l.id, LabPerformance.is_deleted == False).all()
        avg_marks = (sum([p.marks for p in perfs]) / len(perfs)) if perfs else 0.0
        lab_list.append({
            "id": l.id,
            "name": l.name,
            "location": l.location,
            "capacity": l.capacity,
            "subject": l.subject.name if l.subject else "N/A",
            "total_experiments_recorded": len(perfs),
            "average_marks": round(avg_marks, 1)
        })
    return {"module": "Labs", "labs": lab_list}


# 5. Student Engagement Module
@router.get("/engagement", summary="Get Student Engagement Scores & Activities")
def get_engagement_module(db: Session = Depends(get_db)):
    engs = db.query(StudentEngagement).filter(StudentEngagement.is_deleted == False).order_by(StudentEngagement.date.desc()).all()
    total_points = sum([e.points for e in engs])
    items = []
    for e in engs:
        items.append({
            "id": e.id,
            "student_name": e.student.name if e.student else "N/A",
            "enrollment_number": e.student.enrollment_number if e.student else "N/A",
            "activity_type": e.activity_type,
            "description": e.description,
            "points": e.points,
            "date": e.date.isoformat() if e.date else None
        })
    return {
        "module": "Student Engagement",
        "total_engagement_activities": len(items),
        "total_points_awarded": total_points,
        "activities": items
    }


# 6. Faculty Activities Module
@router.get("/faculty-activities", summary="Get Faculty Workloads & Activities")
def get_faculty_activities_module(db: Session = Depends(get_db)):
    fac_acts = db.query(FacultyActivity).filter(FacultyActivity.is_deleted == False).all()
    items = []
    for fa in fac_acts:
        items.append({
            "id": fa.id,
            "faculty_name": fa.faculty.name if fa.faculty else "N/A",
            "department": fa.faculty.department.name if (fa.faculty and fa.faculty.department) else "N/A",
            "activity_type": fa.activity_type,
            "description": fa.description,
            "date": fa.date.isoformat() if fa.date else None
        })
    return {"module": "Faculty Activities", "count": len(items), "activities": items}


# 7. Events Module
@router.get("/events", summary="Get Institutional Events & Workshops")
def get_events_module(db: Session = Depends(get_db)):
    events = db.query(Event).filter(Event.is_deleted == False).order_by(Event.date.desc()).all()
    items = []
    for ev in events:
        items.append({
            "id": ev.id,
            "name": ev.name,
            "description": ev.description,
            "date": ev.date.isoformat() if ev.date else None,
            "organizer_department": ev.department.name if ev.department else "Institution-Wide"
        })
    return {"module": "Events", "count": len(items), "events": items}


# 8. Placements Module
@router.get("/placements", summary="Get Placement Pipeline & Job Offers")
def get_placements_module(db: Session = Depends(get_db)):
    placements = db.query(Placement).filter(Placement.is_deleted == False).all()
    offered_count = len([p for p in placements if p.status in ["Offered", "Accepted"]])
    items = []
    for p in placements:
        items.append({
            "id": p.id,
            "student_name": p.student.name if p.student else "N/A",
            "enrollment_number": p.student.enrollment_number if p.student else "N/A",
            "department": p.student.department.name if (p.student and p.student.department) else "N/A",
            "company_name": p.company_name,
            "package": p.package,
            "status": p.status,
            "date": p.date.isoformat() if p.date else None
        })
    return {
        "module": "Placements",
        "total_offers": offered_count,
        "placements": items
    }


# 9. Research Module
@router.get("/research", summary="Get Institutional Research Publications & Grants")
def get_research_module(db: Session = Depends(get_db)):
    researches = db.query(Research).filter(Research.is_deleted == False).all()
    items = []
    for r in researches:
        items.append({
            "id": r.id,
            "faculty_name": r.faculty.name if r.faculty else "N/A",
            "department": r.faculty.department.name if (r.faculty and r.faculty.department) else "N/A",
            "title": r.title,
            "journal": r.journal,
            "status": r.status,
            "publication_date": r.publication_date.isoformat() if r.publication_date else None
        })
    return {
        "module": "Research",
        "total_publications": len(items),
        "publications": items
    }
