import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import teacherPositionRoutes from './routes/teacherPositionRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { corsMiddleware } from './middleware/cors.js';

const app = express();

// Middleware
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
dotenv.config();

// Kết nối MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Đã kết nối MongoDB'))
.catch((err) => console.error('❌ Lỗi kết nối MongoDB:', err));

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Teacher Management API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      teachers: '/api/teachers',
      teacherPositions: '/api/teacher-positions'
    }
  });
});

app.use('/api/users', userRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/teacher-positions', teacherPositionRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint không tồn tại'
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên port ${PORT}`);
});

export default app;