const express = require('express');
const router = express.Router();
const service = require('../services/taskService');


// 任务清单接口
router.get('/queryTaskList', service.queryTaskList);

// 任务详情接口
router.get('/queryTaskInfo', service.queryTaskInfo);

// 添加任务接口
router.post('/addTask', service.addTask);

// 编辑任务接口
router.put('/editTask', service.editTask);

router.get('/getTaskResult', service.getTaskResult);

// 操作任务状态接口
router.put('/updateTaskStatus', service.updateTaskStatus);

// 点亮红星标记接口
router.put('/updateMark', service.updateMark);

// 删除任务接口
router.delete('/deleteTask', service.deleteTask);


module.exports = router;

