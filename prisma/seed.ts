import { AttendanceStatus, Gender } from "../generated/prisma/enums";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Seeding database....");

  // clear existing data (order matters -delete children before parents)
  await prisma.attendance.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.student.deleteMany();
  await prisma.class.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.school.deleteMany();

  // Create school
  const school = await prisma.school.create({
    data: {
      name: "Sunrise Academy",
      address: "123 Knowledge Street, Mumbai 400001",
      email: "admin@sunriseacademy.edu",
      phone: "+91-22-12345678",
    },
  });
  console.log(`■ Created school: ${school.name}`);
  // Create teachers
  const teacher1 = await prisma.teacher.create({
    data: {
      firstName: "Priya",
      lastName: "Sharma",
      email: "priya.sharma@sunrise.edu",
      schoolId: school.id,
    },
  });
  const teacher2 = await prisma.teacher.create({
    data: {
      firstName: "Rahul",
      lastName: "Verma",
      email: "rahul.verma@sunrise.edu",
      schoolId: school.id,
    },
  });
  console.log("■ Created 2 teachers");
  // Create class
  const classA = await prisma.class.create({
    data: {
      name: "Grade 10A",
      grade: "10",
      year: 2024,
      schoolId: school.id,
      teacherId: teacher1.id,
    },
  });

  // Create subjects
  const math = await prisma.subject.create({
    data: {
      name: "Mathematics",
      code: "MATH10",
      teacherId: teacher1.id,
      classId: classA.id,
    },
  });
  const science = await prisma.subject.create({
    data: {
      name: "Science",
      code: "SCI10",
      teacherId: teacher2.id,
      classId: classA.id,
    },
  });
  // Create students with grades and attendance
  const studentData = [
    {
      firstName: "Aarav",
      lastName: "Patel",
      email: "aarav@email.com",
      dob: "2010-03-15",
      gender: Gender.MALE,
    },
    {
      firstName: "Ananya",
      lastName: "Singh",
      email: "ananya@email.com",
      dob: "2010-07-22",
      gender: Gender.FEMALE,
    },
    {
      firstName: "Dev",
      lastName: "Kumar",
      email: "dev@email.com",
      dob: "2009-11-08",
      gender: Gender.MALE,
    },
  ];
  for (const s of studentData) {
    const student = await prisma.student.create({
      data: {
        firstName: s.firstName,
        lastName: s.lastName,
        email: s.email,
        dateOfBirth: new Date(s.dob),
        gender: s.gender,
        classId: classA.id,
      },
    });
    // Create grades for each subject
    await prisma.grade.createMany({
      data: [
        {
          studentId: student.id,
          subjectId: math.id,
          score: 75 + Math.random() * 20,
          term: "Term 1",
          year: 2024,
        },
        {
          studentId: student.id,
          subjectId: science.id,
          score: 70 + Math.random() * 25,
          term: "Term 1",
          year: 2024,
        },
      ],
    });
    // Create attendance for last 5 days
    for (let i = 0; i < 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      await prisma.attendance.create({
        data: {
          studentId: student.id,
          classId: classA.id,
          date,
          status: i === 2 ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT,
        },
      });
    }
  }
  console.log("■ Created 3 students with grades and attendance");
  console.log("■ Database seeded successfully!");
}
main()
  .catch((e) => {
    console.error("■ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
