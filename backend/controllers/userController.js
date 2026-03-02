const User = require("../models/User");
const bcrypt = require("bcryptjs");

// @desc    Get all users (super_admin only)
// @route   GET /api/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    console.error("GET USERS ERROR:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch users" 
    });
  }
};

// @desc    Create new user (super_admin only)
// @route   POST /api/users
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, permissions } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'staff',
      permissions: permissions || [],
      createdBy: req.user.id,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      }
    });
  } catch (err) {
    console.error("CREATE USER ERROR:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create user" 
    });
  }
};

// @desc    Update user (super_admin only)
// @route   PUT /api/users/:id
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, isActive, permissions } = req.body;
    const { id } = req.params;

    // Prevent super_admin from being modified by non-super_admin
    const targetUser = await User.findById(id);
    if (targetUser && targetUser.role === 'super_admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: "Cannot modify super admin"
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { name, email, role, isActive, permissions },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "User updated successfully",
      data: user
    });
  } catch (err) {
    console.error("UPDATE USER ERROR:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update user" 
    });
  }
};

// @desc    Delete user (super_admin only)
// @route   DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting super_admin
    const user = await User.findById(id);
    if (user && user.role === 'super_admin') {
      return res.status(403).json({
        success: false,
        message: "Cannot delete super admin"
      });
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (err) {
    console.error("DELETE USER ERROR:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete user" 
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/users/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error("GET PROFILE ERROR:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch profile" 
    });
  }
};

// @desc    Update own profile
// @route   PUT /api/users/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: user
    });
  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update profile" 
    });
  }
};