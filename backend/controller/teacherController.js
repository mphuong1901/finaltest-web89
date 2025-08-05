import mongoose from 'mongoose';
import Teacher from '../models/Teacher.js';
import User from '../models/User.js';
import TeacherPosition from '../models/TeacherPosition.js';

const generateTeacherCode = async () => {
  try {
    let code;
    let isUnique = false;

    while (!isUnique) {
      // Tạo chuỗi số ngẫu nhiên gồm 10 chữ số
      code = Math.floor(1000000000 + Math.random() * 9000000000).toString();

      // Kiểm tra xem code đã tồn tại trong DB chưa
      const exists = await Teacher.findOne({ code, isDeleted: false });
      if (!exists) {
        isUnique = true;
      }
    }

    return code;
  } catch (error) {
    console.error('Lỗi khi tạo mã giáo viên:', error);
    throw new Error('Không thể tạo mã giáo viên');
  }
};



const handleError = (res, error, context = '') => {
  console.error(`Lỗi ${context}:`, error);
  
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors
    });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID không hợp lệ'
    });
  }

  res.status(500).json({
    success: false,
    message: 'Lỗi server',
    error: error.message
  });
};


export const getTeachers = async (req, res) => {
  try {

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;


    console.log(`Fetching teachers - Page: ${page}, Limit: ${limit}`);

    const [teachers, total] = await Promise.all([
      Teacher.find({ isDeleted: false })
        .populate({
          path: 'userId',
          select: 'name email phoneNumber address identity dob',
          match: { isDeleted: false }
        })
        .populate({
          path: 'teacherPositionsId',
          select: 'name code',
          match: { isDeleted: false } 
        })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(), 
      
      Teacher.countDocuments({ isDeleted: false })
    ]);


    if (!teachers || !Array.isArray(teachers)) {
      throw new Error('Dữ liệu giáo viên không hợp lệ');
    }

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: teachers,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    handleError(res, error, 'khi lấy danh sách giáo viên');
  }
};


export const createTeacher = async (req, res) => {
  try {
    const { userId, startDate, endDate, teacherPositionsId, degrees } = req.body;


    if (!userId || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc (userId, startDate)'
      });
    }


    const user = await User.findOne({ 
      _id: userId, 
      role: 'TEACHER',
      isDeleted: false 
    }).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Người dùng không t tồn tại hoặc không phải là giáo viên'
      });
    }


    const existingTeacher = await Teacher.findOne({ 
      userId, 
      isDeleted: false 
    }).lean();

    if (existingTeacher) {
      return res.status(400).json({
        success: false,
        message: 'Người dùng đã là giáo viên'
      });
    }


    if (teacherPositionsId?.length > 0) {
      const validPositions = await TeacherPosition.countDocuments({
        _id: { $in: teacherPositionsId },
        isDeleted: false
      });

      if (validPositions !== teacherPositionsId.length) {
        return res.status(400).json({
          success: false,
          message: 'Một hoặc nhiều vị trí không tồn tại'
        });
      }
    }


    const code = await generateTeacherCode();


    const teacher = new Teacher({
      userId,
      code,
      startDate,
      endDate,
      teacherPositionsId,
      degrees
    });

    await teacher.save();
    
    // Populate dữ liệu trả về
    const result = await Teacher.findById(teacher._id)
      .populate('userId', 'name email phoneNumber address identity dob')
      .populate('teacherPositionsId', 'name code')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Tạo giáo viên thành công',
      data: result
    });

  } catch (error) {
    handleError(res, error, 'khi tạo giáo viên');
  }
};


export const getTeacherById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'ID không hợp lệ'
      });
    }

    const teacher = await Teacher.findOne({ 
      _id: req.params.id, 
      isDeleted: false 
    })
    .populate('userId', 'name email phoneNumber address identity dob')
    .populate('teacherPositionsId', 'name code')
    .lean();

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Giáo viên không tồn tại'
      });
    }

    res.json({
      success: true,
      data: teacher
    });

  } catch (error) {
    handleError(res, error, 'khi lấy thông tin giáo viên');
  }
};


export const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, teacherPositionsId, degrees, isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID không hợp lệ'
      });
    }

    // Kiểm tra giáo viên tồn tại
    const teacher = await Teacher.findOne({ 
      _id: id, 
      isDeleted: false 
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Giáo viên không tồn tại'
      });
    }

    // Kiểm tra các vị trí nếu có
    if (teacherPositionsId?.length > 0) {
      const validPositions = await TeacherPosition.countDocuments({
        _id: { $in: teacherPositionsId },
        isDeleted: false
      });

      if (validPositions !== teacherPositionsId.length) {
        return res.status(400).json({
          success: false,
          message: 'Một hoặc nhiều vị trí không t tồn tại'
        });
      }
    }

    // Cập nhật thông tin
    const updatedTeacher = await Teacher.findByIdAndUpdate(
      id,
      {
        startDate,
        endDate,
        teacherPositionsId,
        degrees,
        isActive
      },
      { new: true, runValidators: true }
    )
    .populate('userId', 'name email phoneNumber address identity dob')
    .populate('teacherPositionsId', 'name code')
    .lean();

    res.json({
      success: true,
      message: 'Cập nhật giáo viên thành công',
      data: updatedTeacher
    });

  } catch (error) {
    handleError(res, error, 'khi cập nhật giáo viên');
  }
};


export const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID không hợp lệ'
      });
    }

    const result = await Teacher.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Giáo viên không tồn tại hoặc đã bị xóa'
      });
    }

    res.json({
      success: true,
      message: 'Xóa giáo viên thành công'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa giáo viên',
      error: error.message,
    });
  }
};
