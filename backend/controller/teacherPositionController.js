import TeacherPosition from '../models/TeacherPosition.js';

// Hàm tạo mã tự động (cải tiến)
const generatePositionCode = async () => {
  let code;
  let isUnique = false;
  
  while (!isUnique) {
    const count = await TeacherPosition.countDocuments({ isDeleted: false });
    code = `POS${String(count + 1).padStart(3, '0')}`;
    
    // Kiểm tra mã đã tồn tại chưa
    const existingPosition = await TeacherPosition.findOne({ code, isDeleted: false });
    if (!existingPosition) {
      isUnique = true;
    }
  }
  
  return code;
};

// GET /api/teacher-positions - Lấy danh sách vị trí giáo viên
export const getTeacherPositions = async (req, res) => {
  try {
    const positions = await TeacherPosition.find({ isDeleted: false })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: positions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// POST /api/teacher-positions - Tạo vị trí giáo viên mới
export const createTeacherPosition = async (req, res) => {
  try {
    const { code, name, des, isActive } = req.body;

    // Kiểm tra tên vị trí đã tồn tại
    const existingPosition = await TeacherPosition.findOne({ 
      $or: [{ name }, { code }],
      isDeleted: false 
    });
    if (existingPosition) {
      return res.status(400).json({
        success: false,
        message: 'Tên vị trí đã tồn tại'
      });
    }
    if (!code) {
      code = await generatePositionCode();
    }

    const position = new TeacherPosition({
      code,
      name,
      des,
      isActive: isActive ?? true
    });

    await position.save();

    res.status(201).json({
      success: true,
      message: 'Tạo vị trí thành công',
      data: position
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

// GET /api/teacher-positions/:id - Lấy thông tin chi tiết vị trí
export const getTeacherPositionById = async (req, res) => {
  try {
    const position = await TeacherPosition.findOne({ 
      _id: req.params.id, 
      isDeleted: false 
    });

    if (!position) {
      return res.status(404).json({
        success: false,
        message: 'Vị trí không tồn tại'
      });
    }

    res.json({
      success: true,
      data: position
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// PUT /api/teacher-positions/:id - Cập nhật vị trí
export const updateTeacherPosition = async (req, res) => {
  try {
    const { name, des } = req.body;

    // Kiểm tra vị trí có tồn tại
    const position = await TeacherPosition.findOne({ 
      _id: req.params.id, 
      isDeleted: false 
    });
    if (!position) {
      return res.status(404).json({
        success: false,
        message: 'Vị trí không tồn tại'
      });
    }

    // Kiểm tra tên vị trí đã tồn tại (trừ chính nó)
    if (name && name !== position.name) {
      const existingPosition = await TeacherPosition.findOne({ 
        name, 
        _id: { $ne: req.params.id },
        isDeleted: false 
      });
      if (existingPosition) {
        return res.status(400).json({
          success: false,
          message: 'Tên vị trí đã tồn tại'
        });
      }
    }

    const updatedPosition = await TeacherPosition.findByIdAndUpdate(
      req.params.id,
      { name, des },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Cập nhật vị trí thành công',
      data: updatedPosition
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

// DELETE /api/teacher-positions/:id - Xóa vị trí (soft delete)
export const deleteTeacherPosition = async (req, res) => {
  try {
    const position = await TeacherPosition.findOne({ 
      _id: req.params.id, 
      isDeleted: false 
    });

    if (!position) {
      return res.status(404).json({
        success: false,
        message: 'Vị trí không tồn tại'
      });
    }

    await TeacherPosition.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true }
    );

    res.json({
      success: true,
      message: 'Xóa vị trí thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};