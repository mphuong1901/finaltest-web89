import User from '../models/User.js';

// GET /api/users 
export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { role } = req.query;

    const filter = { isDeleted: false };
    if (role) filter.role = role;

    const users = await User.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: users,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// POST /api/users 
export const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      phoneNumber,
      address,
      identity,
      dob,
      role
    } = req.body;

    // Kiểm tra email đã tồn tại
    const existingEmail = await User.findOne({ email, isDeleted: false });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email đã tồn tại'
      });
    }

    // Kiểm tra CCCD đã tồn tại
    const existingIdentity = await User.findOne({ identity, isDeleted: false });
    if (existingIdentity) {
      return res.status(400).json({
        success: false,
        message: 'Số CCCD đã tồn tại'
      });
    }

    const user = new User({
      name,
      email,
      phoneNumber,
      address,
      identity,
      dob,
      role
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Tạo người dùng thành công',
      data: user
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// GET /api/users/:id 
export const getUserById = async (req, res) => {
  try {
    const user = await User.findOne({ 
      _id: req.params.id, 
      isDeleted: false 
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// PUT /api/users/:id 
export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;

    if (updateData.email) {
      const existingEmail = await User.findOne({ 
        email: updateData.email, 
        _id: { $ne: userId },
        isDeleted: false
      });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email đã tồn tại'
        });
      }
    }

    if (updateData.identity) {
      const existingIdentity = await User.findOne({ 
        identity: updateData.identity, 
        _id: { $ne: userId },
        isDeleted: false
      });
      if (existingIdentity) {
        return res.status(400).json({
          success: false,
          message: 'Số CCCD đã tồn tại'
        });
      }
    }

    const user = await User.findOneAndUpdate(
      { _id: userId, isDeleted: false },
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật thông tin người dùng thành công',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};


export const deleteUser = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.json({
      success: true,
      message: 'Xóa người dùng thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};