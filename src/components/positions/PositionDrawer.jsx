import { useState } from 'react';
import apiService from '../../services/api';

const PositionDrawer = ({ isOpen, onClose, onPositionCreated }) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    des: '', 
    status: 'active',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        code: formData.code,
        name: formData.name,
        des: formData.des, 
        isActive: formData.status === 'active',
      };
        console.log("🚀 Payload gửi lên:", payload);

      const response = await apiService.createTeacherPosition(payload);
      alert('Tạo vị trí công tác thành công!');

      if (onPositionCreated) {
        onPositionCreated(response.data);
      }

      setFormData({
        code: '',
        name: '',
        des: '', 
        status: 'active',
      });

      onClose();
    } catch (error) {
      console.error('Lỗi tạo vị trí:', error);
      alert('Không thể tạo vị trí công tác. Vui lòng thử lại.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 overflow-hidden z-50">
      <div className="absolute inset-0 bg-gray-500 bg-opacity-75" onClick={onClose}></div>
      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="relative w-screen max-w-md">
          <div className="h-full flex flex-col bg-white shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="text-lg font-medium text-gray-900">Tạo vị trí công tác</h2>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500"
                onClick={onClose}
              >
                <span className="sr-only">Đóng</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                      * Mã
                    </label>
                    <input
                      type="text"
                      id="code"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                    />
                  </div>

                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      * Tên
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                    />
                  </div>

                  <div>
                    <label htmlFor="des" className="block text-sm font-medium text-gray-700">
                      Mô tả
                    </label>
                    <textarea
                      id="des"
                      name="des"
                      rows="4"
                      value={formData.des}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">* Trạng thái</label>
                    <div className="mt-2 space-x-4 flex">
                      <div className="flex items-center">
                        <input
                          id="active"
                          name="status"
                          type="radio"
                          value="active"
                          checked={formData.status === 'active'}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600"
                        />
                        <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                          Hoạt động
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="inactive"
                          name="status"
                          type="radio"
                          value="inactive"
                          checked={formData.status === 'inactive'}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600"
                        />
                        <label htmlFor="inactive" className="ml-2 block text-sm text-gray-700">
                          Ngừng hoạt động
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md text-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Lưu
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

export default PositionDrawer;
