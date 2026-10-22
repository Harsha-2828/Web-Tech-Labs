/**
 * server.js — Express REST API for Student Management
 *
 * Endpoints:
 *   GET  /api/students        → returns all students (200)
 *   GET  /api/students/:id    → returns one student by ID (200 | 404)
 *   POST /api/students        → creates a new student (201 | 400)
 *
 * Run: node server.js
 * Server listens on http://localhost:3000
 */

const express = require('express');
const cors    = require('cors');

const app  = express();
const PORT = 3000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());                      // allow cross-origin requests from the frontend
app.use(express.json());              // parse JSON request bodies
app.use(express.static('public'));    // serve static files (HTML/CSS/JS) from /public

// ── In-memory "database" ─────────────────────────────────────────────────────
let students = [
  { id: 1, name: 'Alice Johnson',  age: 20, email: 'alice@college.edu',   course: 'Computer Science',  grade: 'A' },
  { id: 2, name: 'Bob Smith',      age: 22, email: 'bob@college.edu',     course: 'Mathematics',       grade: 'B+' },
  { id: 3, name: 'Clara Davis',    age: 21, email: 'clara@college.edu',   course: 'Physics',           grade: 'A-' },
  { id: 4, name: 'David Lee',      age: 23, email: 'david@college.edu',   course: 'Chemistry',         grade: 'B' },
  { id: 5, name: 'Eva Martinez',   age: 20, email: 'eva@college.edu',     course: 'Computer Science',  grade: 'A+' },
];
let nextId = 6;

// ── Helper: validate student payload ─────────────────────────────────────────
function validateStudent(body) {
  const errors = [];
  if (!body.name  || body.name.trim()  === '') errors.push('Name is required.');
  if (!body.email || body.email.trim() === '') errors.push('Email is required.');
  if (!body.course|| body.course.trim()=== '') errors.push('Course is required.');
  if (body.age === undefined || body.age === '') errors.push('Age is required.');
  if (body.age !== undefined && (isNaN(body.age) || body.age < 1 || body.age > 120))
    errors.push('Age must be a number between 1 and 120.');
  // Simple email format check
  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email))
    errors.push('Email format is invalid.');
  return errors;
}

// ── Routes ────────────────────────────────────────────────────────────────────

/**
 * GET /api/students
 * Returns the full list of students.
 * HTTP 200 OK
 */
app.get('/api/students', (req, res) => {
  res.status(200).json({
    success: true,
    count: students.length,
    data: students,
  });
});

/**
 * GET /api/students/:id
 * Returns a single student by ID.
 * HTTP 200 OK | 404 Not Found
 */
app.get('/api/students/:id', (req, res) => {
  const id      = parseInt(req.params.id, 10);
  const student = students.find(s => s.id === id);

  if (!student) {
    return res.status(404).json({
      success: false,
      message: `Student with ID ${id} not found.`,
    });
  }

  res.status(200).json({ success: true, data: student });
});

/**
 * POST /api/students
 * Creates and stores a new student.
 * Expects JSON body: { name, age, email, course, grade }
 * HTTP 201 Created | 400 Bad Request | 409 Conflict (duplicate email)
 */
app.post('/api/students', (req, res) => {
  const body   = req.body;
  const errors = validateStudent(body);

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed.', errors });
  }

  // Check for duplicate email
  if (students.some(s => s.email.toLowerCase() === body.email.toLowerCase())) {
    return res.status(409).json({
      success: false,
      message: 'A student with this email already exists.',
    });
  }

  const newStudent = {
    id:     nextId++,
    name:   body.name.trim(),
    age:    Number(body.age),
    email:  body.email.trim().toLowerCase(),
    course: body.course.trim(),
    grade:  body.grade ? body.grade.trim() : 'N/A',
  };

  students.push(newStudent);

  res.status(201).json({
    success: true,
    message: `Student "${newStudent.name}" registered successfully!`,
    data:    newStudent,
  });
});

// ── 404 catch-all for unknown API routes ─────────────────────────────────────
app.use('/api/{*path}', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found.' });
});

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  Student API server running at http://localhost:${PORT}`);
  console.log(`   GET  http://localhost:${PORT}/api/students`);
  console.log(`   POST http://localhost:${PORT}/api/students`);
});
