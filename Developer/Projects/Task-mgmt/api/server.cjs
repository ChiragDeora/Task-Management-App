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
    origin: "http://localhost:5173", // Update with your frontend origin
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
  },
});

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", // Update with your frontend origin
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
  try {
    const tasks = await Task.find({ userId: req.auth.userId });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/tasks", withAuth, async (req, res) => {
  try {
    const newTask = new Task({ ...req.body, userId: req.auth.userId });
    const savedTask = await newTask.save();
    io.emit("taskAdded", savedTask);
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/tasks/:id", withAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await Task.findByIdAndDelete(id);
    io.emit("taskDeleted", id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/tasks/:id", withAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTask = await Task.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    io.emit("taskUpdated", updatedTask);
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/tasks/:id/collaborators", withAuth, async (req, res) => {
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/tasks/:id/collaborators/:collabId", withAuth, async (req, res) => {
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
  } catch (err) {
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
