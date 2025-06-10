const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  dueDate: { type: Date, required: true },
  priority: { type: String, required: true },
  project: { type: String, required: true },
  status: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  collaborators: [
    {
      // Assuming collaborators might have an ID and a name/email
      collaboratorId: { type: String },
      name: { type: String },
      email: { type: String }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
