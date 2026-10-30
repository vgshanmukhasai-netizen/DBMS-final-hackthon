const { sequelize, User, Student, Teacher, Notification } = require('../models');
const { Op } = require('sequelize');

/**
 * List all users (Admin only)
 * GET /api/users
 */
const getUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const whereClause = {};
    if (role) {
      whereClause.role = role;
    }
    if (search) {
      whereClause.email = { [Op.like]: `%${search}%` };
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      include: [
        { model: Student, as: 'studentProfile' },
        { model: Teacher, as: 'teacherProfile' },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });

    return res.status(200).json({
      success: true,
      total: count,
      page: parseInt(page, 10),
      totalPages: Math.ceil(count / limit),
      users,
    });
  } catch (error) {
    console.error('Error in getUsers:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve users.',
      error: error.message,
    });
  }
};

/**
 * List all students (Admin & Teachers)
 * GET /api/users/students
 */
const getStudents = async (req, res) => {
  try {
    const { department, year_of_study, section, search } = req.query;

    const whereStudent = {};
    if (department) whereStudent.department = department;
    if (year_of_study) whereStudent.year_of_study = year_of_study;
    if (section) whereStudent.section = section;
    if (search) {
      whereStudent[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { student_id: { [Op.like]: `%${search}%` } },
      ];
    }

    const students = await Student.findAll({
      where: whereStudent,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'role', 'is_approved', 'created_at'],
        },
      ],
      order: [['department', 'ASC'], ['year_of_study', 'ASC'], ['full_name', 'ASC']],
    });

    return res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    console.error('Error in getStudents:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve students.',
      error: error.message,
    });
  }
};

/**
 * List all teachers (Admin)
 * GET /api/users/teachers
 */
const getTeachers = async (req, res) => {
  try {
    const { department, is_approved, search } = req.query;

    const whereTeacher = {};
    if (department) whereTeacher.department = department;
    if (search) {
      whereTeacher[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { faculty_id: { [Op.like]: `%${search}%` } },
      ];
    }

    const whereUser = {};
    if (is_approved !== undefined) {
      whereUser.is_approved = is_approved === 'true' || is_approved === true;
    }

    const teachers = await User.findAll({
      where: { ...whereUser, role: 'teacher' },
      include: [
        {
          model: Teacher,
          as: 'teacherProfile',
          where: whereTeacher,
          required: true,
        },
      ],
      attributes: ['id', 'email', 'role', 'is_approved', 'created_at'],
      order: [[{ model: Teacher, as: 'teacherProfile' }, 'department', 'ASC'], [{ model: Teacher, as: 'teacherProfile' }, 'full_name', 'ASC']],
    });

    const teacherUsers = teachers.map((user) => ({
      id: user.id,
      email: user.email,
      role: user.role,
      isApproved: user.is_approved,
      profile: user.teacherProfile
        ? {
            fullName: user.teacherProfile.full_name,
            facultyId: user.teacherProfile.faculty_id,
            department: user.teacherProfile.department,
            designation: user.teacherProfile.designation,
          }
        : null,
    }));

    return res.status(200).json({
      success: true,
      count: teacherUsers.length,
      teachers: teacherUsers,
    });
  } catch (error) {
    console.error('Error in getTeachers:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve teachers.',
      error: error.message,
    });
  }
};

/**
 * Approve a teacher account (Admin only)
 * PUT /api/users/:id/approve
 */
const approveTeacher = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByPk(userId, {
      include: [{ model: Teacher, as: 'teacherProfile' }],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (user.role !== 'teacher') {
      return res.status(400).json({
        success: false,
        message: 'Only teacher accounts can be approved.',
      });
    }

    if (!user.is_approved) {
      await sequelize.transaction(async (transaction) => {
        user.is_approved = true;
        await user.save({ transaction });

        await Notification.create({
          user_id: user.id,
          title: 'Faculty Account Approved',
          message: 'Your faculty account has been approved by the administrator. You now have full access to create events, mark attendance, and post announcements.',
          type: 'system',
          reference_id: user.id,
        }, { transaction });
      });
    }

    return res.status(200).json({
      success: true,
      message: `Teacher ${user.teacherProfile ? user.teacherProfile.full_name : user.email} has been approved successfully.`,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        is_approved: user.is_approved,
        teacherProfile: user.teacherProfile,
      },
    });
  } catch (error) {
    console.error('Error in approveTeacher:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to approve teacher.',
      error: error.message,
    });
  }
};

/**
 * Update user details (Admin only)
 * PUT /api/users/:id
 */
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { email, role, is_approved, full_name, department, year_of_study, section, designation, student_id, faculty_id } = req.body;

    const user = await User.findByPk(userId, {
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

    // Update user base fields
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists) {
        return res.status(409).json({ success: false, message: 'Email already in use.' });
      }
      user.email = email;
    }
    if (role !== undefined) user.role = role;
    if (is_approved !== undefined) user.is_approved = is_approved;
    await user.save();

    // Update associated student profile if student
    if (user.role === 'student' && user.studentProfile) {
      if (full_name !== undefined) user.studentProfile.full_name = full_name;
      if (department !== undefined) user.studentProfile.department = department;
      if (year_of_study !== undefined) user.studentProfile.year_of_study = year_of_study;
      if (section !== undefined) user.studentProfile.section = section;
      if (student_id !== undefined) user.studentProfile.student_id = student_id;
      await user.studentProfile.save();
    }

    // Update associated teacher profile if teacher
    if (user.role === 'teacher' && user.teacherProfile) {
      if (full_name !== undefined) user.teacherProfile.full_name = full_name;
      if (department !== undefined) user.teacherProfile.department = department;
      if (designation !== undefined) user.teacherProfile.designation = designation;
      if (faculty_id !== undefined) user.teacherProfile.faculty_id = faculty_id;
      await user.teacherProfile.save();
    }

    return res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        is_approved: user.is_approved,
        studentProfile: user.studentProfile,
        teacherProfile: user.teacherProfile,
      },
    });
  } catch (error) {
    console.error('Error in updateUser:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user.',
      error: error.message,
    });
  }
};

/**
 * Delete user (Admin only)
 * DELETE /api/users/:id
 */
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent admin from deleting themselves
    if (parseInt(userId, 10) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account.',
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    await user.destroy();

    return res.status(200).json({
      success: true,
      message: 'User and all related records deleted successfully.',
    });
  } catch (error) {
    console.error('Error in deleteUser:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete user.',
      error: error.message,
    });
  }
};

module.exports = {
  getUsers,
  getStudents,
  getTeachers,
  approveTeacher,
  updateUser,
  deleteUser,
};
