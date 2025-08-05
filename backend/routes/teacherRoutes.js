import express from 'express';
import {
  getTeachers,
  createTeacher,
  getTeacherById,
  updateTeacher,
  deleteTeacher
} from '../controller/teacherController.js';

const router = express.Router();

router.get('/', getTeachers);
router.post('/', createTeacher);
router.get('/:id', getTeacherById);
router.put('/:id', updateTeacher);
router.delete('/:id', deleteTeacher);

export default router;