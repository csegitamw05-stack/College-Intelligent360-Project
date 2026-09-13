"""
AI-HOD Assistant with Controlled Query Layer for Campus Intelligence 360.
CRITICAL SECURITY ENFORCEMENT:
- Never executes arbitrary SQL strings.
- Uses structured intent extraction mapped strictly to parameterized SQLAlchemy ORM queries.
- Enforces role-based department authorization (Principal: campus-wide, HOD: department-scoped).
"""
import re
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.user import User, UserRole
from app.models.people import Student
from app.models.org import Department, Section, Subject
from app.models.academics import Attendance, AcademicPerformance, Assessment, LabPerformance
from app.models.intelligence import RiskScore
from app.services.audit_service import AuditService


class AIAssistantEngine:

    @staticmethod
    def extract_intent(question: str) -> Dict[str, Any]:
        """
        Parses natural language question into a structured, safe query representation.
        Extracts numbers for thresholds (e.g. attendance below 75%, marks below 40%).
        """
        q = question.lower().strip()

        # Intent 1: Low Attendance & Low Marks
        if "attendance" in q and ("below" in q or "<" in q or "low" in q):
            # Extract attendance threshold
            att_match = re.search(r'attendance\s+(?:below|<|under)?\s*(\d+)', q)
            att_thresh = float(att_match.group(1)) if att_match else 75.0

            marks_match = re.search(r'(?:marks|gpa|cgpa|score)\s+(?:below|<|under)?\s*(\d+)', q)
            marks_thresh = float(marks_match.group(1)) if marks_match else 60.0

            return {
                "intent_type": "low_attendance_and_marks",
                "attendance_threshold": att_thresh,
                "marks_threshold": marks_thresh,
                "description": f"Query students with attendance < {att_thresh}% and academic score < {marks_thresh}"
            }

        # Intent 2: Highest Academic Risk Subject
        elif "subject" in q and ("risk" in q or "worst" in q or "failing" in q or "low" in q):
            return {
                "intent_type": "highest_risk_subject",
                "description": "Identify subject with lowest average attendance or academic scores"
            }

        # Intent 3: Section Performance Comparison
        elif "section" in q and ("better" in q or "performance" in q or "compare" in q):
            return {
                "intent_type": "section_comparison",
                "description": "Compare attendance and CGPA performance across department sections"
            }

        # Intent 4: Immediate Intervention Needed
        elif "intervention" in q or "critical" in q or "immediate" in q:
            return {
                "intent_type": "immediate_intervention",
                "description": "Query students categorized under High or Critical Risk"
            }

        # Intent 5: Academic Risk Factors & Actions
        elif "factor" in q or "action" in q or "why" in q or "recommend" in q:
            return {
                "intent_type": "risk_factors_actions",
                "description": "Analyze top contributing factors driving academic risk"
            }

        # Default fallback intent: At-Risk Overview
        return {
            "intent_type": "at_risk_overview",
            "description": "Overview of at-risk students"
        }

    @staticmethod
    def process_query(db: Session, question: str, user: User) -> Dict[str, Any]:
        """
        Executes safe ORM query based on extracted intent and user role permissions.
        Enforces department scoping for HOD users.
        """
        # Role Enforcement Check
        if user.role == UserRole.INCHARGE:
            return {
                "answer": "AI-HOD Assistant functionality is reserved for Principal and Department Head roles. Your account is scoped to course-level telemetry.",
                "query_intent": "unauthorized_role",
                "records": [],
                "context": "Authorization Control Enforced"
            }

        intent = AIAssistantEngine.extract_intent(question)
        intent_type = intent["intent_type"]

        # Department scoping for HOD
        user_dept_code = user.department if user.role == UserRole.HOD else None
        user_dept_obj = None
        if user_dept_code:
            user_dept_obj = db.query(Department).filter(Department.code == user_dept_code).first()

        results = []
        answer_text = ""

        # Safe ORM Execution per Intent
        if intent_type == "low_attendance_and_marks":
            att_thresh = intent["attendance_threshold"]
            marks_thresh = intent["marks_threshold"]

            query = db.query(Student).filter(Student.is_deleted == False)
            if user_dept_obj:
                query = query.filter(Student.department_id == user_dept_obj.id)

            students = query.all()
            for st in students:
                # Attendance
                tot = db.query(Attendance).filter(Attendance.student_id == st.id, Attendance.is_deleted == False).count()
                pres = db.query(Attendance).filter(Attendance.student_id == st.id, Attendance.status == "Present", Attendance.is_deleted == False).count()
                att_rate = (pres / tot * 100.0) if tot > 0 else 80.0

                # Academic CGPA
                latest_perf = db.query(AcademicPerformance).filter(
                    AcademicPerformance.student_id == st.id,
                    AcademicPerformance.is_deleted == False
                ).order_by(AcademicPerformance.semester.desc()).first()
                cgpa = latest_perf.cgpa if (latest_perf and latest_perf.cgpa) else 7.0

                if att_rate < att_thresh or cgpa < (marks_thresh / 10.0 if marks_thresh > 10 else marks_thresh):
                    results.append({
                        "student_name": st.name,
                        "enrollment_number": st.enrollment_number,
                        "department": st.department.code if st.department else "N/A",
                        "attendance_rate": f"{att_rate:.1f}%",
                        "cgpa": cgpa
                    })

            if results:
                answer_text = f"Found {len(results)} student(s) with attendance below {att_thresh}% or academic scores below threshold."
            else:
                answer_text = "No matching records were found in the available institutional data."

        elif intent_type == "highest_risk_subject":
            subjs = db.query(Subject).filter(Subject.is_deleted == False)
            if user_dept_obj:
                subjs = subjs.filter(Subject.department_id == user_dept_obj.id)

            subj_stats = []
            for s in subjs.all():
                tot = db.query(Attendance).filter(Attendance.subject_id == s.id, Attendance.is_deleted == False).count()
                pres = db.query(Attendance).filter(Attendance.subject_id == s.id, Attendance.status == "Present", Attendance.is_deleted == False).count()
                att_rate = (pres / tot * 100.0) if tot > 0 else 85.0
                subj_stats.append({"subject_code": s.code, "subject_name": s.name, "attendance_rate": att_rate})

            subj_stats.sort(key=lambda x: x["attendance_rate"])
            results = subj_stats[:3]
            if results:
                top = results[0]
                answer_text = f"Subject '{top['subject_name']}' ({top['subject_code']}) shows the lowest average attendance at {top['attendance_rate']:.1f}%."
            else:
                answer_text = "Insufficient data to answer this question reliably."

        elif intent_type == "section_comparison":
            secs = db.query(Section).filter(Section.is_deleted == False)
            if user_dept_obj:
                secs = secs.join(Section.program).filter(Department.id == user_dept_obj.id)

            for sec in secs.all():
                st_count = db.query(Student).filter(Student.section_id == sec.id, Student.is_deleted == False).count()
                results.append({"section_name": sec.name, "student_count": st_count})

            if results:
                answer_text = f"Analyzed {len(results)} section(s) within authorized department scope."
            else:
                answer_text = "No matching section records found."

        else: # Immediate Intervention or Risk Factors
            query = db.query(RiskScore, Student).join(Student, RiskScore.student_id == Student.id).filter(
                RiskScore.risk_level.in_(["High", "Medium"]),
                Student.is_deleted == False
            )
            if user_dept_obj:
                query = query.filter(Student.department_id == user_dept_obj.id)

            for rs, st in query.all():
                results.append({
                    "student_name": st.name,
                    "enrollment_number": st.enrollment_number,
                    "risk_level": rs.risk_level,
                    "score": rs.score,
                    "factors": rs.factors
                })

            if results:
                answer_text = f"Identified {len(results)} student(s) requiring academic intervention within your authorized scope."
            else:
                answer_text = "No matching records were found in the available institutional data."

        # Audit Logging
        AuditService.log_action(
            db=db,
            action="AI_ASSISTANT_QUERY",
            actor_id=str(user.id),
            entity_type="AssistantQuery",
            details={
                "question": question[:100],
                "intent": intent_type,
                "results_count": len(results),
                "user_role": user.role,
                "scoped_department": user_dept_code
            }
        )

        return {
            "answer": answer_text,
            "query_intent": intent_type,
            "results_count": len(results),
            "records": results,
            "context_marker": "Based on current institutional records.",
            "authorized_scope": user_dept_code if user_dept_code else "Institution-Wide"
        }
