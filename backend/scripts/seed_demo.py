"""
Seed Script for Campus Intelligence 360
Populates database with realistic institutional data across all 9 core modules:
1. Attendance
2. Academic Performance
3. Assessments
4. Student Engagement
5. Faculty Activities
6. Labs & Lab Performance
7. Events
8. Placements
9. Research
"""
import os
import sys
from datetime import date, timedelta, datetime
import random

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import engine, SessionLocal, Base
from app.security.jwt import get_password_hash
from app.models.user import User, UserRole
from app.models.org import Department, Program, Batch, Section, Course, Subject
from app.models.people import Student, Faculty
from app.models.academics import Attendance, AcademicPerformance, Assessment, Assignment, Lab, LabPerformance
from app.models.activities import StudentEngagement, FacultyActivity, Event, Placement, Research
from app.models.intelligence import RiskScore, PredictionResult, Recommendation

def run_seed():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Check if already seeded
        existing_users = db.query(User).count()
        if existing_users > 0:
            print(f"Database already contains {existing_users} users. Clearing existing data...")
            for table in reversed(Base.metadata.sorted_tables):
                db.execute(table.delete())
            db.commit()

        print("Seeding Users...")
        hashed_password = get_password_hash("Password123!")

        # 1. System Users
        principal_user = User(
            email="principal@campus.edu",
            hashed_password=hashed_password,
            full_name="Dr. Arthur Pendelton",
            role=UserRole.PRINCIPAL,
            department="Administration",
            is_active=True
        )
        admin_user = User(
            email="admin@campus.edu",
            hashed_password=hashed_password,
            full_name="System Administrator",
            role=UserRole.SYSTEM_ADMIN,
            department="IT Infrastructure",
            is_active=True
        )
        db.add_all([principal_user, admin_user])
        db.commit()

        # 2. Departments
        departments_data = [
            ("CSE", "Computer Science & Engineering"),
            ("ECE", "Electronics & Communication"),
            ("ME", "Mechanical Engineering"),
            ("IT", "Information Technology")
        ]
        dept_objs = {}
        for code, name in departments_data:
            dept = Department(code=code, name=name)
            db.add(dept)
            db.flush()
            dept_objs[code] = dept

        # 3. HOD Users
        hod_cse = User(
            email="hod_cse@campus.edu",
            hashed_password=hashed_password,
            full_name="Dr. Robert Vance",
            role=UserRole.HOD,
            department="CSE",
            is_active=True
        )
        hod_ece = User(
            email="hod_ece@campus.edu",
            hashed_password=hashed_password,
            full_name="Prof. Sarah Jenkins",
            role=UserRole.HOD,
            department="ECE",
            is_active=True
        )
        hod_me = User(
            email="hod_me@campus.edu",
            hashed_password=hashed_password,
            full_name="Dr. Henry Ford",
            role=UserRole.HOD,
            department="ME",
            is_active=True
        )
        hod_it = User(
            email="hod_it@campus.edu",
            hashed_password=hashed_password,
            full_name="Prof. Ada Lovelace",
            role=UserRole.HOD,
            department="IT",
            is_active=True
        )
        db.add_all([hod_cse, hod_ece, hod_me, hod_it])

        # 4. Incharge Users
        incharge_cse = User(
            email="incharge_cse@campus.edu",
            hashed_password=hashed_password,
            full_name="Dr. Alan Turing",
            role=UserRole.INCHARGE,
            department="CSE",
            is_active=True
        )
        incharge_ece = User(
            email="incharge_ece@campus.edu",
            hashed_password=hashed_password,
            full_name="Dr. Nikola Tesla",
            role=UserRole.INCHARGE,
            department="ECE",
            is_active=True
        )
        db.add_all([incharge_cse, incharge_ece])
        db.commit()

        # 5. Programs, Batches & Sections
        programs = {}
        for code, dept in dept_objs.items():
            prog = Program(name=f"B.Tech in {dept.name}", code=f"BTECH-{code}", department_id=dept.id)
            db.add(prog)
            db.flush()
            programs[code] = prog

        batch_2026 = Batch(name="2022-2026", start_year=2022, end_year=2026)
        db.add(batch_2026)
        db.flush()

        sections = {}
        for code, prog in programs.items():
            sec_a = Section(name=f"{code}-A", program_id=prog.id, batch_id=batch_2026.id)
            sec_b = Section(name=f"{code}-B", program_id=prog.id, batch_id=batch_2026.id)
            db.add_all([sec_a, sec_b])
            db.flush()
            sections[code] = [sec_a, sec_b]

        # 6. Faculty Members
        faculties = []
        faculty_info = [
            ("FAC-CSE-01", "Dr. Robert Vance", dept_objs["CSE"].id, hod_cse.id, "HOD & Professor"),
            ("FAC-CSE-02", "Dr. Alan Turing", dept_objs["CSE"].id, incharge_cse.id, "Associate Professor"),
            ("FAC-ECE-01", "Prof. Sarah Jenkins", dept_objs["ECE"].id, hod_ece.id, "HOD & Professor"),
            ("FAC-ECE-02", "Dr. Nikola Tesla", dept_objs["ECE"].id, incharge_ece.id, "Assistant Professor"),
            ("FAC-ME-01", "Dr. Henry Ford", dept_objs["ME"].id, hod_me.id, "HOD & Professor"),
            ("FAC-IT-01", "Prof. Ada Lovelace", dept_objs["IT"].id, hod_it.id, "HOD & Professor"),
        ]
        for emp_id, name, dept_id, user_id, desig in faculty_info:
            fac = Faculty(employee_id=emp_id, name=name, department_id=dept_id, user_id=user_id, designation=desig)
            db.add(fac)
            db.flush()
            faculties.append(fac)

        # 7. Courses & Subjects
        subjects = []
        subjects_data = [
            ("CSE-301", "Data Structures & Algorithms", 4, dept_objs["CSE"].id),
            ("CSE-402", "Machine Learning & AI Systems", 4, dept_objs["CSE"].id),
            ("ECE-201", "Embedded Microcontrollers", 3, dept_objs["ECE"].id),
            ("ECE-305", "Digital Signal Processing", 4, dept_objs["ECE"].id),
            ("ME-102", "Advanced Thermodynamics", 3, dept_objs["ME"].id),
            ("ME-304", "Robotics & Automation", 4, dept_objs["ME"].id),
            ("IT-303", "Cloud Computing Architectures", 4, dept_objs["IT"].id),
            ("IT-401", "Web Application Development", 3, dept_objs["IT"].id),
        ]
        for code, name, credits, dept_id in subjects_data:
            subj = Subject(code=code, name=name, credits=credits, department_id=dept_id)
            db.add(subj)
            db.flush()
            subjects.append(subj)

        # 8. Labs
        labs = []
        labs_data = [
            (subjects[0].id, "Advanced Algorithms Lab", "Building B - Room 204", 40),
            (subjects[1].id, "AI & Machine Learning GPU Lab", "Building B - Room 310", 35),
            (subjects[2].id, "Microcontroller Hardware Lab", "Building C - Room 102", 30),
            (subjects[5].id, "Robotics & Mechatronics Simulation Lab", "Building A - Room 105", 25),
            (subjects[6].id, "Cloud Infrastructure Virtual Lab", "Building B - Room 401", 50),
        ]
        for subj_id, name, loc, cap in labs_data:
            lab = Lab(subject_id=subj_id, name=name, location=loc, capacity=cap)
            db.add(lab)
            db.flush()
            labs.append(lab)

        # 9. Students
        student_names = [
            ("2026-CSE-001", "Aarav Sharma", "aarav.s@student.edu", "CSE", 0),
            ("2026-CSE-002", "Ananya Verma", "ananya.v@student.edu", "CSE", 0),
            ("2026-CSE-003", "Rohan Gupta", "rohan.g@student.edu", "CSE", 0),
            ("2026-CSE-004", "Priya Patel", "priya.p@student.edu", "CSE", 1),
            ("2026-CSE-005", "Kabir Mehta", "kabir.m@student.edu", "CSE", 1),
            ("2026-ECE-001", "Vihaan Reddy", "vihaan.r@student.edu", "ECE", 0),
            ("2026-ECE-002", "Ishita Joshi", "ishita.j@student.edu", "ECE", 0),
            ("2026-ECE-003", "Aditya Nair", "aditya.n@student.edu", "ECE", 1),
            ("2026-ECE-004", "Sanya Rao", "sanya.r@student.edu", "ECE", 1),
            ("2026-ME-001", "Dhruv Kapoor", "dhruv.k@student.edu", "ME", 0),
            ("2026-ME-002", "Tara Choudhury", "tara.c@student.edu", "ME", 0),
            ("2026-ME-003", "Yash Malhotra", "yash.m@student.edu", "ME", 1),
            ("2026-IT-001", "Kavya Singh", "kavya.s@student.edu", "IT", 0),
            ("2026-IT-002", "Devansh Saxena", "devansh.s@student.edu", "IT", 0),
            ("2026-IT-003", "Riya Sen", "riya.sen@student.edu", "IT", 1),
            ("2026-IT-004", "Arjun Bhatia", "arjun.b@student.edu", "IT", 1),
        ]

        students = []
        for enr, name, email, dept_code, sec_idx in student_names:
            dept = dept_objs[dept_code]
            sec = sections[dept_code][sec_idx]
            st = Student(
                enrollment_number=enr,
                name=name,
                email=email,
                department_id=dept.id,
                section_id=sec.id,
                batch="2022-2026",
                status="Active"
            )
            db.add(st)
            db.flush()
            students.append(st)

        # 10. Seed Attendance Records (Past 30 Days)
        today = date.today()
        attendance_statuses = ["Present", "Present", "Present", "Absent", "Late"]
        
        for st in students:
            # Assign specific profile to students (High performer, Average, At-Risk)
            st_id_mod = st.id % 4
            if st_id_mod == 0:  # High Performer
                p_present = 0.95
            elif st_id_mod == 1: # Good
                p_present = 0.85
            elif st_id_mod == 2: # Average
                p_present = 0.72
            else: # At-Risk Student
                p_present = 0.55

            dept_subjs = [s for s in subjects if s.department_id == st.department_id]
            for subj in dept_subjs:
                for day_offset in range(1, 20):
                    rec_date = today - timedelta(days=day_offset)
                    if rec_date.weekday() < 5: # Weekdays
                        status = "Present" if random.random() < p_present else ("Absent" if random.random() < 0.8 else "Late")
                        att = Attendance(
                            student_id=st.id,
                            subject_id=subj.id,
                            date=rec_date,
                            status=status,
                            recorded_by=principal_user.id
                        )
                        db.add(att)

        # 11. Seed Academic Performance (GPA/CGPA)
        for st in students:
            st_id_mod = st.id % 4
            base_gpa = 9.2 if st_id_mod == 0 else (8.4 if st_id_mod == 1 else (6.8 if st_id_mod == 2 else 5.2))
            for sem in [1, 2, 3, 4, 5, 6]:
                sgpa = round(min(10.0, max(4.0, base_gpa + random.uniform(-0.4, 0.4))), 2)
                cgpa = round(min(10.0, max(4.0, base_gpa + random.uniform(-0.2, 0.2))), 2)
                perf = AcademicPerformance(
                    student_id=st.id,
                    semester=sem,
                    cgpa=cgpa,
                    sgpa=sgpa,
                    total_credits=22
                )
                db.add(perf)

        # 12. Seed Assessments & Assignments
        for subj in subjects:
            ass1 = Assessment(subject_id=subj.id, name="Mid-Term Examination", date=today - timedelta(days=25), max_marks=50, weightage=30)
            ass2 = Assessment(subject_id=subj.id, name="Continuous Evaluation 1", date=today - timedelta(days=10), max_marks=20, weightage=10)
            assign1 = Assignment(subject_id=subj.id, name="Module 1 Problem Set", given_date=today - timedelta(days=30), due_date=today - timedelta(days=20), max_marks=100)
            db.add_all([ass1, ass2, assign1])

        # 13. Seed Lab Performance
        for lab in labs:
            for st in students:
                if st.department_id == lab.subject.department_id:
                    st_id_mod = st.id % 4
                    base_marks = 45 if st_id_mod == 0 else (38 if st_id_mod == 1 else (30 if st_id_mod == 2 else 22))
                    lp = LabPerformance(
                        student_id=st.id,
                        lab_id=lab.id,
                        date=today - timedelta(days=random.randint(5, 20)),
                        experiment_name="Experiment 3: Pipeline Synthesis & Performance Analysis",
                        marks=float(base_marks + random.randint(-3, 3))
                    )
                    db.add(lp)

        # 14. Seed Student Engagement
        activities_list = [
            ("Hackathon Participation", "Smart Campus AI Hackathon 2026", 25),
            ("Tech Club Workshop", "Organized Git & Github Deep Dive", 15),
            ("Sports Tournament", "Inter-College Badminton Championship", 20),
            ("Paper Presentation", "Presented Research Poster at IEEE Student Conference", 30),
            ("NSS Volunteer", "Campus Green Drive Initiative", 10),
        ]
        for st in students:
            if random.random() > 0.3:
                act_type, desc, pts = random.choice(activities_list)
                eng = StudentEngagement(
                    student_id=st.id,
                    activity_type=act_type,
                    description=desc,
                    date=today - timedelta(days=random.randint(2, 40)),
                    points=pts
                )
                db.add(eng)

        # 15. Seed Faculty Activities & Research
        faculty_activities = [
            ("Guest Lecture Delivered", "Delivered Keynote on Edge AI at TechCon 2026"),
            ("Workshop Organized", "Organized 3-Day Hands-on Workshop on Kubernetes"),
            ("FDP Attended", "Completed 1-Week Faculty Development Program on NextGen Wireless")
        ]
        for fac in faculties:
            act_type, desc = random.choice(faculty_activities)
            fact_act = FacultyActivity(
                faculty_id=fac.id,
                activity_type=act_type,
                description=desc,
                date=today - timedelta(days=random.randint(5, 60))
            )
            db.add(fact_act)

            # Research Papers
            res = Research(
                faculty_id=fac.id,
                title=f"Optimizing Neural Architectures for Real-Time Campus Intelligence in {fac.department.name}",
                publication_date=today - timedelta(days=random.randint(20, 180)),
                journal="IEEE Transactions on Smart Academic Systems",
                status="Published"
            )
            db.add(res)

        # 16. Seed Events
        event1 = Event(name="Smart Campus Tech Fest 2026", description="Annual institutional tech symposium", date=today + timedelta(days=15), organizer_department_id=dept_objs["CSE"].id)
        event2 = Event(name="AI & Digital Twin Symposium", description="National conference on Smart Education", date=today - timedelta(days=12), organizer_department_id=dept_objs["IT"].id)
        event3 = Event(name="Robotics Innovation Expo", description="Showcase of autonomous robotics projects", date=today - timedelta(days=5), organizer_department_id=dept_objs["ME"].id)
        db.add_all([event1, event2, event3])

        # 17. Seed Placements
        placements_data = [
            ("Google", "24.5 LPA", "Offered"),
            ("Microsoft", "22.0 LPA", "Offered"),
            ("Amazon", "18.0 LPA", "Accepted"),
            ("Intel", "16.5 LPA", "Accepted"),
            ("Tesla Automation", "19.0 LPA", "Offered"),
            ("TCS Innovation Labs", "7.5 LPA", "Accepted"),
        ]
        # Assign placements to high-performer final year students
        placed_students = [s for s in students if s.id % 4 == 0 or s.id % 4 == 1][:6]
        for i, st in enumerate(placed_students):
            company, pkg, stat = placements_data[i % len(placements_data)]
            pl = Placement(
                student_id=st.id,
                company_name=company,
                package=pkg,
                date=today - timedelta(days=random.randint(5, 30)),
                status=stat
            )
            db.add(pl)

        # 18. Seed Intelligence Risk Scores & Early Warning Alerts
        print("Calculating initial Early Warning Risk Scores...")
        for st in students:
            st_id_mod = st.id % 4
            if st_id_mod == 3: # At-Risk Student
                score = 82.5
                level = "High"
                factors = {
                    "attendance_rate": "54.2% (Below critical 75% threshold)",
                    "latest_cgpa": "5.12 (Academic Warning)",
                    "lab_performance": "Failed 2 practical experiments",
                    "engagement": "Low engagement score (0 points)"
                }
                rec_desc = "Immediate academic counseling & attendance warning letter issuance recommended."
            elif st_id_mod == 2: # Moderate Risk
                score = 52.0
                level = "Medium"
                factors = {
                    "attendance_rate": "71.5% (Borderline attendance)",
                    "latest_cgpa": "6.65 (Average academic index)",
                    "engagement": "10 engagement points"
                }
                rec_desc = "Monitor attendance weekly and assign peer mentor."
            else: # Low Risk
                score = 15.0
                level = "Low"
                factors = {
                    "attendance_rate": "92.8% (Excellent)",
                    "latest_cgpa": "9.15 (Dean's List candidate)",
                    "engagement": "Active participant in hackathons & research"
                }
                rec_desc = "Recommend for research assistantship & campus placement honors program."

            rs = RiskScore(student_id=st.id, score=score, risk_level=level, factors=factors)
            pred = PredictionResult(student_id=st.id, target_metric="Predicted Final CGPA", predicted_value=round(6.0 if level=="High" else (7.5 if level=="Medium" else 9.2), 2), confidence=0.89)
            rec = Recommendation(student_id=st.id, type="Academic Early Warning", description=rec_desc, priority=level)
            db.add_all([rs, pred, rec])

        db.commit()
        print("Successfully seeded all 9 domain modules with realistic institutional data!")

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()
