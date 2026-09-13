"""
Decision Support Engine for Campus Intelligence 360
Includes:
1. AI Recommendation Engine (Factor-derived evidence-based recommendations)
2. What-If Simulator (Hypothetical scenario estimations labeled ESTIMATED SCENARIO)
"""
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.models.people import Student
from app.models.academics import Attendance, AcademicPerformance, LabPerformance
from app.models.intelligence import RiskScore
from app.analytics.intelligence_engine import IntelligenceEngine


class DecisionSupportEngine:

    @staticmethod
    def generate_recommendations(db: Session, student_id: int) -> Dict[str, Any]:
        """
        Generates evidence-backed recommendations derived from detected student risk factors.
        """
        student = db.query(Student).filter(Student.id == student_id, Student.is_deleted == False).first()
        if not student:
            return {"error": "Student not found"}

        # Fetch attendance & performance
        tot_att = db.query(Attendance).filter(Attendance.student_id == student_id, Attendance.is_deleted == False).count()
        pres_att = db.query(Attendance).filter(Attendance.student_id == student_id, Attendance.status == "Present", Attendance.is_deleted == False).count()
        att_rate = (pres_att / tot_att * 100.0) if tot_att > 0 else 80.0

        latest_perf = db.query(AcademicPerformance).filter(
            AcademicPerformance.student_id == student_id,
            AcademicPerformance.is_deleted == False
        ).order_by(AcademicPerformance.semester.desc()).first()
        cgpa = float(latest_perf.cgpa) if (latest_perf and latest_perf.cgpa) else 7.0

        recommendations = []

        if att_rate < 75.0:
            recommendations.append({
                "detected_issue": "Critical Attendance Deficit",
                "evidence": f"Current attendance rate is {att_rate:.1f}% (Below mandatory 75.0% institutional threshold).",
                "recommended_action": "Issue formal attendance warning letter and assign a dedicated faculty mentor for weekly check-ins.",
                "priority": "HIGH",
                "suggested_monitoring_period": "3 Weeks"
            })

        if cgpa < 6.0:
            recommendations.append({
                "detected_issue": "Below Average Academic Score (CGPA Warning)",
                "evidence": f"Latest CGPA index is {cgpa:.2f} (Below minimum 6.0 academic cutoff).",
                "recommended_action": "Enroll student in mandatory departmental remedial tutorial classes for core subjects.",
                "priority": "HIGH",
                "suggested_monitoring_period": "Full Semester"
            })

        if att_rate < 75.0 and cgpa < 6.0:
            recommendations.append({
                "detected_issue": "Compound Academic & Attendance Risk",
                "evidence": f"Dual deficit detected: {att_rate:.1f}% attendance combined with CGPA {cgpa:.2f}.",
                "recommended_action": "Schedule immediate parent-faculty conference and issue academic probation advisory.",
                "priority": "CRITICAL",
                "suggested_monitoring_period": "Immediate (1 Week)"
            })

        if not recommendations:
            recommendations.append({
                "detected_issue": "None Detected (Good Standing)",
                "evidence": f"Student maintains {att_rate:.1f}% attendance and CGPA {cgpa:.2f}.",
                "recommended_action": "Recommend for placement honors track and peer tutoring assistantship.",
                "priority": "LOW",
                "suggested_monitoring_period": "Regular Semester Cycle"
            })

        return {
            "student_id": student.id,
            "student_name": student.name,
            "enrollment_number": student.enrollment_number,
            "recommendations_count": len(recommendations),
            "recommendations": recommendations
        }

    @staticmethod
    def simulate_what_if_scenario(
        db: Session,
        attendance_improvement_pct: float = 10.0,
        remedial_classes_conducted: int = 2,
        assignment_completion_increase_pct: float = 15.0
    ) -> Dict[str, Any]:
        """
        Simulates hypothetical policy scenario improvements.
        Edge case validation: Handles values outside valid bounds (<0 or >100).
        Output clearly labeled ESTIMATED SCENARIO.
        """
        # Validate Bounds
        att_imp = max(-50.0, min(50.0, float(attendance_improvement_pct)))
        remedials = max(0, min(10, int(remedial_classes_conducted)))
        assign_imp = max(0.0, min(50.0, float(assignment_completion_increase_pct)))

        # Baseline Digital Twin
        baseline = IntelligenceEngine.get_digital_twin_overview(db)
        baseline_att = baseline["average_attendance"]
        baseline_high_risk = baseline["high_risk_students"]

        # Calculate estimated improvement
        est_att = min(100.0, max(0.0, baseline_att + att_imp))
        
        # Risk reduction estimation logic
        risk_reduction_factor = (att_imp * 0.4) + (remedials * 1.5) + (assign_imp * 0.2)
        est_high_risk = max(0, int(round(baseline_high_risk * (1.0 - (risk_reduction_factor / 100.0)))))

        est_improvement_pct = round(((baseline_high_risk - est_high_risk) / baseline_high_risk * 100.0) if baseline_high_risk > 0 else 0.0, 1)

        return {
            "scenario_label": "ESTIMATED SCENARIO",
            "disclaimer": "ESTIMATED SCENARIO output for decision support. Results are model predictions, not guaranteed future outcomes.",
            "inputs": {
                "attendance_improvement_pct": att_imp,
                "remedial_classes_conducted": remedials,
                "assignment_completion_increase_pct": assign_imp
            },
            "current_metrics": {
                "average_attendance": baseline_att,
                "high_risk_students_count": baseline_high_risk
            },
            "estimated_scenario_metrics": {
                "estimated_attendance": est_att,
                "estimated_high_risk_students_count": est_high_risk,
                "estimated_risk_reduction_pct": est_improvement_pct
            },
            "policy_summary": f"Conducting {remedials} remedial classes and improving attendance by {att_imp}% is estimated to reduce high-risk students from {baseline_high_risk} to {est_high_risk} ({est_improvement_pct}% improvement)."
        }
