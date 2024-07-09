const express = require("express");

const router = express.Router();

router.post("/tasks", async (req, res) => {
  try {
    const {
      title,
      description,
      dueDate,
      priority,
      project,
      status,
      userId,
      collaborators,
    } = req.body;

    if (
      !title ||
      !description ||
      !dueDate ||
      !priority ||
      !project ||
      !status ||
      !userId
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newTask = new Task({
      title,
      description,
      dueDate: new Date(dueDate),
      priority,
      project,
      status,
      userId,
      collaborators: collaborators || [],
    });

    const savedTask = await newTask.save();

    res.status(201).json(savedTask);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
});

module.exports = router;
