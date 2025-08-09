import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());


const dataDir = path.join(process.cwd(), 'data');
const tasksFilePath = path.join(dataDir, 'tasks.json');


const readTasks = async () => {
    try {
        const data = await fs.readFile(tasksFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return []; 
    }
};


const writeTasks = async (data) => {
    await fs.mkdir(dataDir, { recursive: true }); 
    await fs.writeFile(tasksFilePath, JSON.stringify(data, null, 2));
};

//  CRUD 
// 1. CREATE:
app.post('/tasks', async (req, res) => {
    const { title } = req.body;
    if (!title) {
        return res.status(400).json({ message: 'Title is required' });
    }
    const tasks = await readTasks();
    const newTask = { id: crypto.randomUUID(), title, isCompleted: false };
    tasks.push(newTask);
    await writeTasks(tasks);
    res.status(201).json(newTask);
});

// 2. READ:
app.get('/tasks', async (req, res) => {
    const tasks = await readTasks();
    res.json(tasks);
});

// 3. UPDATE:
app.put('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { title, isCompleted } = req.body;
    const tasks = await readTasks();
    const taskIndex = tasks.findIndex(task => task.id === id);

    if (taskIndex === -1) {
        return res.status(404).json({ message: 'Task not found' });
    }

    
    if (title !== undefined) tasks[taskIndex].title = title;
    if (isCompleted !== undefined) tasks[taskIndex].isCompleted = isCompleted;
    
    await writeTasks(tasks);
    res.json(tasks[taskIndex]);
});

app.delete('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const tasks = await readTasks();
    const updatedTasks = tasks.filter(task => task.id !== id);

    if (tasks.length === updatedTasks.length) {
        return res.status(404).json({ message: 'Task not found' });
    }

    await writeTasks(updatedTasks);
    res.status(200).json({ message: 'Task deleted successfully' });
});



app.listen(PORT, () => {
    console.log(` server is running at http://localhost:${PORT}`);
});