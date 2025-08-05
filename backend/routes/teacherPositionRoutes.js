import express from 'express';
import {
  getTeacherPositions,
  createTeacherPosition,
  getTeacherPositionById,
  updateTeacherPosition,
  deleteTeacherPosition
} from '../controller/teacherPositionController.js';

const router = express.Router();

router.get('/', getTeacherPositions);
router.post('/', createTeacherPosition);
router.get('/:id', getTeacherPositionById);
router.put('/:id', updateTeacherPosition);
router.delete('/:id', deleteTeacherPosition);

export default router;