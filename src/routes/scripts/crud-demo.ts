import { prisma } from "../../lib/prisma";

const school = await prisma.school.create({
  data: {
    name: "Sunrise Academy",
    address: "123 Education STreet",
    email: "info@sunrise.edu",
    phone: "+91987654321",
  },
});

console.log("Created School: ", school);

// CREATE a teacher linked to the school
const teacher = await prisma.teacher.create({
  data: {
    firstName: "Priya",
    lastName: "Sharma",
    email: "priya@sunrise.edu",
    schoolId: school.id, // Foreign key link
  },
});

// CREATE MANY students at once (batch insert)
const students = await prisma.student.createMany({
  data: [
    {
      firstName: "Aarav",
      lastName: "Patel",
      email: "aarav@email.com",
      dateOfBirth: new Date("2010-05-14"),
      gender: "MALE",
      classId: 1,
    },
    {
      firstName: "Ananya",
      lastName: "Singh",
      email: "ananya@email.com",
      dateOfBirth: new Date("2010-09-22"),
      gender: "FEMALE",
      classId: 1,
    },
  ],
  skipDuplicates: true, // Skip if email already exists (no error thrown)
});
console.log(`Created ${students.count} students`);

// FIND ONE by unique field
const student = await prisma.student.findUnique({
  where: { email: "aarav@email.com" },
});
// Returns null if not found (always check!)
// FIND FIRST matching a condition
const firstMaleStudent = await prisma.student.findFirst({
  where: { gender: "MALE" },
  orderBy: { firstName: "asc" },
});
// FIND MANY with filters
const allStudents = await prisma.student.findMany({
  where: {
    class: { year: 2024 }, // Filter by related model
    firstName: { startsWith: "A" }, // SQL LIKE "A%"
  },
  orderBy: { lastName: "asc" },
  take: 10, // LIMIT 10
  skip: 0, // OFFSET 0 (for pagination)
  select: {
    // Only fetch these columns (saves bandwidth)
    id: true,
    firstName: true,
    lastName: true,
    email: true,
  },
});
// COUNT records
const total = await prisma.student.count({
  where: { class: { year: 2024 } },
});

// UPDATE ONE by primary key
const updated = await prisma.student.update({
  where: { id: 1 },
  data: { firstName: "Aarav Kumar" },
});
// UPDATE MANY matching a condition
const result = await prisma.attendance.updateMany({
  where: {
    date: { lt: new Date("2024-01-01") }, // lt = less than
    status: "ABSENT",
  },
  data: { status: "EXCUSED" },
});
console.log(`Updated ${result.count} attendance records`);
// UPSERT — insert if not exists, update if exists
const grade = await prisma.grade.upsert({
  where: {
    studentId_subjectId_term_year: {
      // Composite unique key
      studentId: 1,
      subjectId: 2,
      term: "Term 1",
      year: 2024,
    },
  },
  update: { score: 88.5 }, // Run if record exists
  create: {
    // Run if record does NOT exist
    score: 88.5,
    term: "Term 1",
    year: 2024,
    studentId: 1,
    subjectId: 2,
  },
});

// DELETE ONE by primary key
const deleted = await prisma.grade.delete({
  where: { id: 5 },
});
// DELETE MANY matching condition
const removed = await prisma.attendance.deleteMany({
  where: {
    date: { lt: new Date("2020-01-01") }, // Clean up old records
  },
});
console.log(`Deleted ${removed.count} old attendance records`);

// Fetch a student WITH their class, grades, and attendance
const studentWithDetails = await prisma.student.findUnique({
  where: { id: 1 },
  include: {
    class: {
      include: {
        school: true,
        teacher: true,
      },
    },
    grades: {
      include: {
        subject: true,
      },
      orderBy: {
        year: "desc",
      },
    },
    attendances: {
      where: {
        status: "ABSENT",
      },
      orderBy: { date: "desc" },
      take: 10,
    },
  },
});

// studentWithDetails.class.school.name
// studentWithDetails.grades[0].subject.name
// studentWithDetails.attendance[0].status

// Efficient query: only fetch what you need
const studentList = await prisma.student.findMany({
  select: {
    id: true,
    firstName: true,
    lastName: true,
    class: {
      select: {
        name: true,
        grade: true,
      },
    },
    _count: {
      select: { grades: true, attendances: true }, // count relations
    },
  },
});

// Returns: [{ id, firstName, lastName, class: { name, grade }, _count: { grades: 5, attendances: 180 } }]

// Create a school WITH teachers and classes in one transaction
const school = await prisma.school.create({
  data: {
    name: "Springfield High",
    address: "724 Evergreen Teerrace",
    email: "admin@springfield.edu",
    teachers: {
      create: [
        { firstName: "John", lastName: "Doe", email: "john@spring.edu" },
        { firstName: "Jane", lastName: "Roe", email: "jane@spring.edu" },
      ],
    },
  },
  include: { teachers: true }, // Return teachers in response
});

// Find all students in classes with grade 10
const grade10Students = await prisma.student.findMany({
  where: {
    class: { grade: "10", year: 2024 },
  },
});

// Find teachers who have least 1 class
const activeTeachers = await prisma.teacher.findMany({
  where: {
    classes: {
      some: {},
    }, // some: {} = has at least one related record
  },
});

// Find students with no attendance records at all
const untracked = await prisma.student.findMany({
  where: {
    attendances: { none: {} }, // none = zero related records
  },
});
