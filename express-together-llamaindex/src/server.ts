import express from 'express';
import dotenv from 'dotenv';
import { client } from './client';
import { services } from './services';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Start the services
services();

app.use(express.json());

app.post('/', async (req, res) => {
    const { workflowName, workflowId } = req.body;
    const runId = await client.scheduleWorkflow({ workflowName, workflowId, input: req.body });
    res.json({ runId });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});