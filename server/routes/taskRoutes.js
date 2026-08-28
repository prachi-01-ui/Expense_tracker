const express = require('express');
const router = express.Router();
const { getTasks, addTask, toggleTaskStatus, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getTasks)
  .post(protect, addTask);

router.route('/:id')
  .put(protect, toggleTaskStatus)
  .delete(protect, deleteTask);

module.exports = router;