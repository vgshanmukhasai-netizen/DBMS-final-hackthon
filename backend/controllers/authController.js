const jwt = require('jsonwebtoken');
const { User, Student, Teacher, Notification } = require('../models');

// Helper to generate JWT token
const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'university_event_management_secret_key_2024';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    secret,
    { expiresIn }
  );
};

/**
 * Register a new Student
 * POST /api/auth/register/student
 */
const registerStudent = async (req, res) => {
  try {
    const { email, password, department, section } = req.body;
    const full_name = req.body.full_name || req.body.fullName;
    const student_id = req.body.student_id || req.body.studentId;
    const year_of_study = req.body.year_of_study || req.body.yearOfStudy;

    // Validation
    if (!email || !password || !full_name || !student_id || !department || !year_of_study) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: email, password, full_name, student_id, department, year_of_study.',
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    // Check if student_id already exists
    const existingStudentId = await Student.findOne({ where: { student_id } });
    if (existingStudentId) {
      return res.status(409).json({
        success: false,
        message: 'A student with this Student ID / Roll Number already exists.',
      });
    }

    // Create User record (students are auto-approved by default)
    const newUser = await User.create({
      email,
      password,
      role: 'student',
      is_approved: true,
    });

    // Create Student record
    const studentProfile = await Student.create({
      user_id: newUser.id,
      full_name,
      student_id,
      department,
      year_of_study: parseInt(year_of_study, 10),
      section: section || null,
    });

    // Create welcome notification
    await Notification.create({
      user_id: newUser.id,
      title: 'Welcome to University Event Management System',
      message: `Welcome ${full_name}! You can now explore upcoming campus events and register.`,
      type: 'system',
      reference_id: null,
    });

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Student registered successfully.',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        is_approved: newUser.is_approved,
        profile: studentProfile,
      },
    });
  } catch (error) {
    console.error('Error in registerStudent:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to register student. Internal server error.',
      error: error.message,
    });
  }
};

/**
 * Register a new Teacher
 * POST /api/auth/register/teacher
 */
const registerTeacher = async (req, res) => {
  try {
    const { email, password, department, designation } = req.body;
    const full_name = req.body.full_name || req.body.fullName;
    const faculty_id = req.body.faculty_id || req.body.facultyId;

    // Validation
    if (!email || !password || !full_name || !faculty_id || !department) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: email, password, full_name, faculty_id, department.',
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    // Check if faculty_id already exists
    const existingFaculty = await Teacher.findOne({ where: { faculty_id } });
    if (existingFaculty) {
      return res.status(409).json({
        success: false,
        message: 'A teacher with this Faculty ID already exists.',
      });
    }

    // Create User record (teachers require admin approval before managing events)
    const newUser = await User.create({
      email,
      password,
      role: 'teacher',
      is_approved: false,
    });

    // Create Teacher record
    const teacherProfile = await Teacher.create({
      user_id: newUser.id,
      full_name,
      faculty_id,
      department,
      designation: designation || 'Assistant Professor',
    });

    // Notify administrators about pending teacher registration
    const adminUsers = await User.findAll({ where: { role: 'admin' } });
    for (const admin of adminUsers) {
      await Notification.create({
        user_id: admin.id,
        title: 'New Faculty Approval Needed',
        message: `${full_name} (${department}, Faculty ID: ${faculty_id}) registered and is awaiting your approval.`,
        type: 'system',
        reference_id: newUser.id,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Teacher registered successfully. Account is pending administrator approval before event management access is granted.',
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        is_approved: newUser.is_approved,
        profile: teacherProfile,
      },
    });
  } catch (error) {
    console.error('Error in registerTeacher:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to register teacher. Internal server error.',
      error: error.message,
    });
  }
};

/**
 * Login user (admin, teacher, student)
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Find user by email, or by student_id or faculty_id
    let user = await User.findOne({
      where: { email },
      include: [
        { model: Student, as: 'studentProfile' },
        { model: Teacher, as: 'teacherProfile' },
      ],
    });

    // If not found by email, check if input is a student_id
    if (!user) {
      const student = await Student.findOne({ where: { student_id: email } });
      if (student) {
        user = await User.findByPk(student.user_id, {
          include: [
            { model: Student, as: 'studentProfile' },
            { model: Teacher, as: 'teacherProfile' },
          ],
        });
      }
    }

    // If not found, check if input is a faculty_id
    if (!user) {
      const teacher = await Teacher.findOne({ where: { faculty_id: email } });
      if (teacher) {
        user = await User.findByPk(teacher.user_id, {
          include: [
            { model: Student, as: 'studentProfile' },
            { model: Teacher, as: 'teacherProfile' },
          ],
        });
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check approval status for teachers
    if (user.role === 'teacher' && !user.is_approved) {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending administrator approval. Please contact the administrator.',
      });
    }

    const token = generateToken(user);

    const profile = user.role === 'student' ? user.studentProfile : (user.role === 'teacher' ? user.teacherProfile : null);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        is_approved: user.is_approved,
        profile,
      },
    });
  } catch (error) {
    console.error('Error in login:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to log in. Internal server error.',
      error: error.message,
    });
  }
};

/**
 * Get current authenticated user profile
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [
        { model: Student, as: 'studentProfile' },
        { model: Teacher, as: 'teacherProfile' },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const profile = user.role === 'student' ? user.studentProfile : (user.role === 'teacher' ? user.teacherProfile : null);

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        is_approved: user.is_approved,
        createdAt: user.created_at || user.createdAt,
        profile,
      },
    });
  } catch (error) {
    console.error('Error in getMe:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile.',
      error: error.message,
    });
  }
};

module.exports = {
  registerStudent,
  registerTeacher,
  login,
  getMe,
};
