require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const { withAuth } = require("@clerk/clerk-sdk-node");
const socketIo = require("socket.io");
const http = require("http");
const cors = require("cors");
const path = require("path");
const Task = require("./models/Task.cjs");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "https://task-mgmtt.netlify.app", // Update with your frontend origin
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
  },
});

app.use(express.json());
app.use(
  cors({
    origin: "https://task-mgmtt.netlify.app", // Update with your frontend origin
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

mongoose.connect(process.env.MONGO_URL);
const db = mongoose.connection;
db.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});
db.once("open", () => {
  console.log("MongoDB connected");
});

// API routes for tasks
app.get("/tasks", withAuth, async (req, res) => {
  console.log(`GET /tasks - User: ${req.auth.userId}`);
  try {
    const tasks = await Task.find({ userId: req.auth.userId });
    res.json(tasks);
    console.log(`Successfully fetched tasks for user: ${req.auth.userId}, Count: ${tasks.length}`);
  } catch (err) {
    console.error(`Error fetching tasks for user: ${req.auth.userId}`, err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/tasks", withAuth, async (req, res) => {
  console.log(`POST /tasks - User: ${req.auth.userId}, Body: ${JSON.stringify(req.body)}`);
  try {
    const newTask = new Task({ ...req.body, userId: req.auth.userId });
    const savedTask = await newTask.save();
    io.emit("taskAdded", savedTask);
    res.status(201).json(savedTask);
    console.log(`Successfully created task for user: ${req.auth.userId}, Task ID: ${savedTask._id}`);
  } catch (err) {
    console.error(`Error creating task for user: ${req.auth.userId}`, err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/tasks/:id", withAuth, async (req, res) => {
  console.log(`DELETE /tasks/:id - User: ${req.auth.userId}, Task ID: ${req.params.id}`);
  try {
    const { id } = req.params;
    await Task.findByIdAndDelete(id);
    io.emit("taskDeleted", id);
    res.status(204).end();
    console.log(`Successfully deleted task ID: ${req.params.id} for user: ${req.auth.userId}`);
  } catch (err) {
    console.error(`Error deleting task ID: ${req.params.id} for user: ${req.auth.userId}`, err);
    res.status(500).json({ error: err.message });
  }
});

app.put("/tasks/:id", withAuth, async (req, res) => {
  console.log(`PUT /tasks/:id - User: ${req.auth.userId}, Task ID: ${req.params.id}, Body: ${JSON.stringify(req.body)}`);
  try {
    const { id } = req.params;
    const updatedTask = await Task.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    io.emit("taskUpdated", updatedTask);
    res.json(updatedTask);
    console.log(`Successfully updated task ID: ${req.params.id} for user: ${req.auth.userId}`);
  } catch (err) {
    console.error(`Error updating task ID: ${req.params.id} for user: ${req.auth.userId}`, err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/tasks/:id/collaborators", withAuth, async (req, res) => {
  console.log(`POST /tasks/:id/collaborators - User: ${req.auth.userId}, Task ID: ${req.params.id}, Body: ${JSON.stringify(req.body)}`);
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    task.collaborators.push(req.body);
    await task.save();
    io.emit("collaboratorAdded", { taskId: id, collaborator: req.body });
    res.status(201).json(task);
    console.log(`Successfully added collaborator to task ID: ${req.params.id} for user: ${req.auth.userId}`);
  } catch (err) {
    console.error(`Error adding collaborator to task ID: ${req.params.id} for user: ${req.auth.userId}`, err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/tasks/:id/collaborators/:collabId", withAuth, async (req, res) => {
  console.log(`DELETE /tasks/:id/collaborators/:collabId - User: ${req.auth.userId}, Task ID: ${req.params.id}, Collaborator ID: ${req.params.collabId}`);
  try {
    const { id, collabId } = req.params;
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    task.collaborators.id(collabId).remove();
    await task.save();
    io.emit("collaboratorRemoved", { taskId: id, collabId });
    res.status(204).end();
    console.log(`Successfully removed collaborator ${req.params.collabId} from task ID: ${req.params.id} for user: ${req.auth.userId}`);
  } catch (err) {
    console.error(`Error removing collaborator ${req.params.collabId} from task ID: ${req.params.id} for user: ${req.auth.userId}`, err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("Welcome to the Task Management API");
});

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
