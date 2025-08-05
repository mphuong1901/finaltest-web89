import { useState, useEffect } from 'react';
import apiService from '../../services/api';

const TeacherDrawer = ({ isOpen, onClose, onTeacherCreated }) => {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    // User data
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    identity: '',
    dob: '',
    // Teacher data
    teacherPositionsId: [],
    startDate: '',
    endDate: '',
    degrees: [{
      type: '',
      school: '',
      major: '',
      year: new Date().getFullYear(),
      isGraduated: false
    }]
  });


  useEffect(() => {
    if (isOpen) {
      fetchPositions();
    }
  }, [isOpen]);

  const fetchPositions = async () => {
    try {
      const response = await apiService.getTeacherPositions();
      setPositions(response.data || []);
    } catch (err) {
      console.error('Error fetching positions:', err);
      setError('Không thể tải danh sách vị trí');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePositionChange = (e) => {
    const selectedPositions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({
      ...formData,
      teacherPositionsId: selectedPositions
    });
  };

  const handleDegreeChange = (index, field, value) => {
    const newDegrees = [...formData.degrees];
    if (field === 'year') {
      newDegrees[index][field] = parseInt(value) || new Date().getFullYear();
    } else if (field === 'isGraduated') {
      newDegrees[index][field] = value === 'true';
    } else {
      newDegrees[index][field] = value;
    }
    setFormData({
      ...formData,
      degrees: newDegrees
    });
  };

  const addDegree = () => {
    setFormData({
      ...formData,
      degrees: [...formData.degrees, {
        type: '',
        school: '',
        major: '',
        year: new Date().getFullYear(),
        isGraduated: false
      }]
    });
  };

  const removeDegree = (index) => {
    if (formData.degrees.length > 1) {
      const newDegrees = formData.degrees.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        degrees: newDegrees
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.phoneNumber) {
      setError('Vui lòng điền đầy đủ thông tin cá nhân');
      return;
    }
    
    if (formData.teacherPositionsId.length === 0) {
      setError('Vui lòng chọn ít nhất một vị trí công tác');
      return;
    }

    if (!formData.startDate) {
      setError('Vui lòng chọn ngày bắt đầu');
      return;
    }

    try {
      setLoading(true);
      setError('');
      

      const userData = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        identity: formData.identity,
        dob: formData.dob,
        role: 'TEACHER'
      };
      
      const userResponse = await apiService.createUser(userData);
      

      const teacherData = {
        userId: userResponse.data._id,
        teacherPositionsId: formData.teacherPositionsId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        degrees: formData.degrees
      };
      
      const teacherResponse = await apiService.createTeacher(teacherData);
      
      if (teacherResponse.success) {
        onTeacherCreated(teacherResponse.data);
        // Reset form
        setFormData({
          name: '',
          email: '',
          phoneNumber: '',
          address: '',
          identity: '',
          dob: '',
          teacherPositionsId: [],
          startDate: '',
          endDate: '',
          degrees: [{
            type: '',
            school: '',
            major: '',
            year: new Date().getFullYear(),
            isGraduated: false
          }]
        });
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Không thể tạo giáo viên');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 overflow-hidden z-50">
      <div className="absolute inset-0 bg-gray-500 bg-opacity-75" onClick={onClose}></div>
      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="relative w-screen max-w-2xl">
          <div className="h-full flex flex-col bg-white shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="text-lg font-medium text-gray-900">Tạo giáo viên mới</h2>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500"
                onClick={onClose}
              >
                <span className="sr-only">Đóng</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Thông tin cá nhân */}
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin cá nhân</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">* Họ tên</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                          disabled={loading}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">* Email</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                          disabled={loading}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">* Số điện thoại</label>
                        <input
                          type="tel"
                          id="phoneNumber"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                          disabled={loading}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="identity" className="block text-sm font-medium text-gray-700">CCCD/CMND</label>
                        <input
                          type="text"
                          id="identity"
                          name="identity"
                          value={formData.identity}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          disabled={loading}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Ngày sinh</label>
                        <input
                          type="date"
                          id="dob"
                          name="dob"
                          value={formData.dob}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          disabled={loading}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                        <input
                          type="text"
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Thông tin công việc */}
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin công việc</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="teacherPositionsId" className="block text-sm font-medium text-gray-700">* Vị trí công tác</label>
                        <select
                          id="teacherPositionsId"
                          name="teacherPositionsId"
                          multiple
                          value={formData.teacherPositionsId}
                          onChange={handlePositionChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          size="4"
                          disabled={loading}
                        >
                          {positions.map(position => (
                            <option key={position._id} value={position._id}>
                              {position.name} ({position.code})
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Giữ Ctrl để chọn nhiều vị trí</p>
                      </div>
                      
                      <div>
                        <div className="mb-4">
                          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">* Ngày bắt đầu</label>
                          <input
                            type="date"
                            id="startDate"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                            disabled={loading}
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Ngày kết thúc</label>
                          <input
                            type="date"
                            id="endDate"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            disabled={loading}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bằng cấp */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-medium text-gray-900">Bằng cấp</h3>
                      <button
                        type="button"
                        onClick={addDegree}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                        disabled={loading}
                      >
                        + Thêm bằng cấp
                      </button>
                    </div>
                    
                    {formData.degrees.map((degree, index) => (
                      <div key={index} className="border border-gray-200 rounded-md p-4 mb-3">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-sm font-medium">Bằng cấp {index + 1}</h4>
                          {formData.degrees.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeDegree(index)}
                              className="text-red-600 hover:text-red-800 text-sm"
                              disabled={loading}
                            >
                              Xóa
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Loại bằng</label>
                            <select
                              value={degree.type}
                              onChange={(e) => handleDegreeChange(index, 'type', e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                              disabled={loading}
                            >
                              <option value="">Chọn loại bằng</option>
                              <option value="Trung cấp">Trung cấp</option>
                              <option value="Cao đẳng">Cao đẳng</option>
                              <option value="Cử nhân">Cử nhân</option>
                              <option value="Thạc sĩ">Thạc sĩ</option>
                              <option value="Tiến sĩ">Tiến sĩ</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Trường</label>
                            <input
                              type="text"
                              value={degree.school}
                              onChange={(e) => handleDegreeChange(index, 'school', e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                              disabled={loading}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Chuyên ngành</label>
                            <input
                              type="text"
                              value={degree.major}
                              onChange={(e) => handleDegreeChange(index, 'major', e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                              disabled={loading}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Năm</label>
                            <input
                              type="number"
                              value={degree.year}
                              onChange={(e) => handleDegreeChange(index, 'year', e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                              min="1950"
                              max={new Date().getFullYear() + 10}
                              disabled={loading}
                            />
                          </div>
                          
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                            <select
                              value={degree.isGraduated.toString()}
                              onChange={(e) => handleDegreeChange(index, 'isGraduated', e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                              disabled={loading}
                            >
                              <option value="true">Đã tốt nghiệp</option>
                              <option value="false">Đang học</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
                    disabled={loading}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? 'Đang tạo...' : 'Tạo giáo viên'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDrawer;