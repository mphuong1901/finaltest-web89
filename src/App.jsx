import { useState } from 'react'
import TeacherList from './components/teachers/TeacherList'
import PositionList from './components/positions/PositionList'
function App() {
  const [activeTab, setActiveTab] = useState('teachers')

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Quản lý giáo viên</h1>
          <div className="mt-4 flex space-x-8">
            <button
              className={`px-1 py-2 text-sm font-medium ${activeTab === 'teachers' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('teachers')}
            >
              Danh sách giáo viên
            </button>
            <button
              className={`px-1 py-2 text-sm font-medium ${activeTab === 'positions' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('positions')}
            >
              Vị trí công tác
            </button>
          </div>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {activeTab === 'teachers' ? <TeacherList /> : <PositionList />}
        </div>
      </main>
    </div>
  )
}

export default App