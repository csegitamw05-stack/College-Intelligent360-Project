"""
Intelligence & Analytics Engine for Campus Intelligence 360
Computes multi-factor early warning risk scores, campus digital twin state,
and interactive What-If policy simulations.
"""
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.people import Student, Faculty
from app.models.org import Department
from app.models.academics import Attendance, AcademicPerformance, LabPerformance
from app.models.activities import StudentEngagement, Placement, Research
from app.models.intelligence import RiskScore, PredictionResult, Recommendation


class IntelligenceEngine:
    @staticmethod
    def calculate_student_risk(db: Session, student_id: int) -> Dict[str, Any]:
        """
        Calculates composite early warning risk score for a student.
        Factors:
        - Attendance Rate (Weight 35%)
        - CGPA (Weight 35%)
        - Lab Marks (Weight 15%)
        - Student Engagement Points (Weight 15%)
        """
        student = db.query(Student).filter(Student.id == student_id, Student.is_deleted == False).first()
        if not student:
            return {"error": "Student not found"}

        factors = {}
        risk_points = 0.0

        # 1. Attendance Factor (35 pts max risk)
        total_att = db.query(Attendance).filter(Attendance.student_id == student_id, Attendance.is_deleted == False).count()
        present_att = db.query(Attendance).filter(Attendance.student_id == student_id, Attendance.status == "Present", Attendance.is_deleted == False).count()
        
        att_rate = (present_att / total_att * 100.0) if total_att > 0 else 85.0
        factors["attendance_rate"] = f"{att_rate:.1f}%"
        
        if att_rate < 65.0:
            risk_points += 35.0
            factors["attendance_flag"] = "Critical Attendance Deficit (<65%)"
        elif att_rate < 75.0:
            risk_points += 22.0
            factors["attendance_flag"] = "Warning: Attendance below 75%"
        elif att_rate < 85.0:
            risk_points += 10.0

        # 2. CGPA Factor (35 pts max risk)
        latest_perf = db.query(AcademicPerformance).filter(
            AcademicPerformance.student_id == student_id, 
            AcademicPerformance.is_deleted == False
        ).order_by(AcademicPerformance.semester.desc()).first()

        cgpa = latest_perf.cgpa if (latest_perf and latest_perf.cgpa is not None) else 7.5
        factors["latest_cgpa"] = str(cgpa)

        if cgpa < 5.5:
            risk_points += 35.0
            factors["cgpa_flag"] = "Academic Probation Warning (CGPA < 5.5)"
        elif cgpa < 6.5:
            risk_points += 20.0
            factors["cgpa_flag"] = "Below Average Academic Score"
        elif cgpa < 7.5:
            risk_points += 10.0

        # 3. Lab Performance Factor (15 pts max risk)
        labs = db.query(LabPerformance).filter(LabPerformance.student_id == student_id, LabPerformance.is_deleted == False).all()
        avg_lab_marks = (sum([l.marks for l in labs]) / len(labs)) if labs else 35.0 # assume max 50
        factors["average_lab_marks"] = f"{avg_lab_marks:.1f} / 50"

        if avg_lab_marks < 25.0:
            risk_points += 15.0
            factors["lab_flag"] = "Poor Practical Lab Execution"
        elif avg_lab_marks < 35.0:
            risk_points += 8.0

        # 4. Student Engagement Factor (15 pts max risk)
        eng_records = db.query(StudentEngagement).filter(StudentEngagement.student_id == student_id, StudentEngagement.is_deleted == False).all()
        total_points = sum([e.points for e in eng_records])
        factors["engagement_points"] = str(total_points)

        if total_points == 0:
            risk_points += 15.0
            factors["engagement_flag"] = "Zero Extracurricular Engagement"
        elif total_points < 15:
            risk_points += 8.0

        # Composite Classification
        total_score = min(100.0, max(0.0, risk_points))
        if total_score >= 65.0:
            level = "High"
        elif total_score >= 35.0:
            level = "Medium"
        else:
            level = "Low"

        # Update or create RiskScore in DB
        existing_rs = db.query(RiskScore).filter(RiskScore.student_id == student_id).first()
        if existing_rs:
            existing_rs.score = total_score
            existing_rs.risk_level = level
            existing_rs.factors = factors
        else:
            rs = RiskScore(student_id=student_id, score=total_score, risk_level=level, factors=factors)
            db.add(rs)
        
        db.commit()

        return {
            "student_id": student.id,
            "name": student.name,
            "enrollment_number": student.enrollment_number,
            "department": student.department.name if student.department else "N/A",
            "score": total_score,
            "risk_level": level,
            "factors": factors
        }

    @staticmethod
    def get_digital_twin_overview(db: Session, department_code: Optional[str] = None) -> Dict[str, Any]:
        """
        Generates real-time Digital Twin state metrics across campus or specific department.
        """
        query_student = db.query(Student).filter(Student.is_deleted == False)
        query_faculty = db.query(Faculty).filter(Faculty.is_deleted == False)

        if department_code:
            dept = db.query(Department).filter(Department.code == department_code).first()
            if dept:
                query_student = query_student.filter(Student.department_id == dept.id)
                query_faculty = query_faculty.filter(Faculty.department_id == dept.id)

        students = query_student.all()
        student_ids = [s.id for s in students]

        total_students = len(students)
        total_faculty = query_faculty.count()

        # Average Attendance
        if student_ids:
            total_att = db.query(Attendance).filter(Attendance.student_id.in_(student_ids), Attendance.is_deleted == False).count()
            present_att = db.query(Attendance).filter(Attendance.student_id.in_(student_ids), Attendance.status == "Present", Attendance.is_deleted == False).count()
            avg_attendance = round((present_att / total_att * 100.0) if total_att > 0 else 82.5, 1)
        else:
            avg_attendance = 0.0

        # Average CGPA
        if student_ids:
            avg_cgpa_res = db.query(func.avg(AcademicPerformance.cgpa)).filter(
                AcademicPerformance.student_id.in_(student_ids),
                AcademicPerformance.is_deleted == False
            ).scalar()
            avg_cgpa = round(float(avg_cgpa_res), 2) if avg_cgpa_res else 7.4
        else:
            avg_cgpa = 0.0

        # Risk Counts
        high_risk_count = 0
        medium_risk_count = 0
        low_risk_count = 0

        if student_ids:
            risk_scores = db.query(RiskScore).filter(RiskScore.student_id.in_(student_ids)).all()
            for r in risk_scores:
                if r.risk_level == "High":
                    high_risk_count += 1
                elif r.risk_level == "Medium":
                    medium_risk_count += 1
                else:
                    low_risk_count += 1

        # Placements Count
        placed_count = 0
        if student_ids:
            placed_count = db.query(Placement).filter(
                Placement.student_id.in_(student_ids),
                Placement.status.in_(["Offered", "Accepted"]),
                Placement.is_deleted == False
            ).count()

        # Research Publications
        research_count = 0
        faculty_ids = [f.id for f in query_faculty.all()]
        if faculty_ids:
            research_count = db.query(Research).filter(
                Research.faculty_id.in_(faculty_ids),
                Research.is_deleted == False
            ).count()

        # Institutional Health Index calculation (0 - 100)
        # Combine attendance (30%), CGPA (30%), low-risk ratio (20%), placement ratio (20%)
        at_risk_ratio = (high_risk_count / total_students) if total_students > 0 else 0
        placement_ratio = (placed_count / total_students) if total_students > 0 else 0.5
        
        health_index = round(
            (avg_attendance * 0.30) + 
            (avg_cgpa * 10 * 0.30) + 
            ((1 - at_risk_ratio) * 100 * 0.20) + 
            (placement_ratio * 100 * 0.20),
            1
        )

        return {
            "scope": department_code if department_code else "Institution-Wide",
            "total_students": total_students,
            "total_faculty": total_faculty,
            "average_attendance": avg_attendance,
            "average_cgpa": avg_cgpa,
            "high_risk_students": high_risk_count,
            "medium_risk_students": medium_risk_count,
            "low_risk_students": low_risk_count,
            "placements_recorded": placed_count,
            "research_publications": research_count,
            "institutional_health_index": min(100.0, health_index),
            "status": "Operational & Synced with Live DB"
        }

    @staticmethod
    def simulate_what_if(db: Session, attendance_threshold: float, cgpa_threshold: float) -> Dict[str, Any]:
        """
        Simulates how many students become At-Risk if policy thresholds change.
        """
        students = db.query(Student).filter(Student.is_deleted == False).all()
        baseline_at_risk = 0
        simulated_at_risk = 0
        affected_students = []

        for st in students:
            # Current risk score
            current_rs = db.query(RiskScore).filter(RiskScore.student_id == st.id).first()
            if current_rs and current_rs.risk_level in ["High", "Medium"]:
                baseline_at_risk += 1

            # Get student attendance
            total_att = db.query(Attendance).filter(Attendance.student_id == st.id, Attendance.is_deleted == False).count()
            present_att = db.query(Attendance).filter(Attendance.student_id == st.id, Attendance.status == "Present", Attendance.is_deleted == False).count()
            att_rate = (present_att / total_att * 100.0) if total_att > 0 else 80.0

            # Get student CGPA
            latest_perf = db.query(AcademicPerformance).filter(
                AcademicPerformance.student_id == st.id,
                AcademicPerformance.is_deleted == False
            ).order_by(AcademicPerformance.semester.desc()).first()
            cgpa = latest_perf.cgpa if (latest_perf and latest_perf.cgpa) else 7.0

            is_simulated_risk = (att_rate < attendance_threshold) or (cgpa < cgpa_threshold)
            if is_simulated_risk:
                simulated_at_risk += 1
                affected_students.append({
                    "id": st.id,
                    "name": st.name,
                    "enrollment_number": st.enrollment_number,
                    "department": st.department.code if st.department else "N/A",
                    "attendance_rate": f"{att_rate:.1f}%",
                    "cgpa": cgpa,
                    "reason": f"{'Attendance < ' + str(attendance_threshold) + '%' if att_rate < attendance_threshold else ''} {'CGPA < ' + str(cgpa_threshold) if cgpa < cgpa_threshold else ''}".strip()
                })

        delta = simulated_at_risk - baseline_at_risk

        return {
            "simulation_parameters": {
                "attendance_threshold_percent": attendance_threshold,
                "cgpa_threshold": cgpa_threshold
            },
            "baseline_at_risk_count": baseline_at_risk,
            "simulated_at_risk_count": simulated_at_risk,
            "net_increase": delta,
            "total_students_evaluated": len(students),
            "affected_students": affected_students[:10], # top 10 preview
            "recommendation": f"Increasing thresholds will flag {delta} additional students. Ensure academic mentoring capacity before enforcement." if delta > 0 else "Threshold adjustments lie within existing safety boundaries."
        }
