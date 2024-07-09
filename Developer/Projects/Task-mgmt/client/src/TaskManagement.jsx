import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import TaskList from "./TaskList";
import TaskForm from "./TaskForm";
import io from "socket.io-client";
import "./Table.css";

const socket = io("http://localhost:5001");

const TaskManagementApp = () => {
  const { user, isLoaded } = useUser();
  const [tasks, setTasks] = useState([]);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    const fetchTasks = async () => {
      try {
        const response = await fetch("http://localhost:5001/tasks", {
          headers: {
            Authorization: `Bearer ${user.idToken}`,
          },
        });
        const data = await response.json();
        setTasks(data);
      } catch (err) {
        console.error("Failed to fetch tasks", err);
      }
    };

    fetchTasks();

    const handleTaskEvent = (event) => {
      const { type, payload } = event;
      switch (type) {
        case "taskAdded":
          setTasks((prevTasks) => [...prevTasks, payload]);
          break;
        case "taskDeleted":
          setTasks((prevTasks) =>
            prevTasks.filter((task) => task._id !== payload),
          );
          break;
        case "taskUpdated":
          setTasks((prevTasks) =>
            prevTasks.map((task) =>
              task._id === payload._id ? payload : task,
            ),
          );
          break;
        case "collaboratorAdded":
          setTasks((prevTasks) =>
            prevTasks.map((task) =>
              task._id === payload.taskId
                ? {
                    ...task,
                    collaborators: [
                      ...task.collaborators,
                      payload.collaborator,
                    ],
                  }
                : task,
            ),
          );
          break;
        case "collaboratorRemoved":
          setTasks((prevTasks) =>
            prevTasks.map((task) =>
              task._id === payload.taskId
                ? {
                    ...task,
                    collaborators: task.collaborators.filter(
                      (c) => c._id !== payload.collabId,
                    ),
                  }
                : task,
            ),
          );
          break;
        default:
          break;
      }
    };

    socket.on("taskEvent", handleTaskEvent);

    return () => {
      socket.off("taskEvent", handleTaskEvent);
    };
  }, [isLoaded, user]);

  const handleAddTask = async (task) => {
    try {
      const response = await fetch("http://localhost:5001/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.idToken}`,
        },
        body: JSON.stringify(task),
      });
      const newTask = await response.json();
      setTasks((prevTasks) => [...prevTasks, newTask]);
      setIsTaskFormOpen(false); // Close the form after adding a task
    } catch (err) {
      console.error("Failed to add task", err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await fetch(`http://localhost:5001/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.idToken}`,
        },
      });
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
    } catch (err) {
      console.error("Failed to delete task", err);
    }
  };

  const handleUpdateTask = async (taskId) => {
    const taskToUpdate = tasks.find((task) => task._id === taskId);
    const newTitle =
      prompt("Update title:", taskToUpdate.title) || taskToUpdate.title;
    const newDescription =
      prompt("Update description:", taskToUpdate.description) ||
      taskToUpdate.description;
    const newDueDate =
      prompt("Update due date:", taskToUpdate.dueDate) || taskToUpdate.dueDate;
    const newPriority =
      prompt("Update priority:", taskToUpdate.priority) ||
      taskToUpdate.priority;
    const newProject =
      prompt("Update project:", taskToUpdate.project) || taskToUpdate.project;

    try {
      const response = await fetch(`http://localhost:5001/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.idToken}`,
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          dueDate: newDueDate,
          priority: newPriority,
          project: newProject,
        }),
      });
      const updatedTask = await response.json();
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === updatedTask._id ? updatedTask : task,
        ),
      );
    } catch (err) {
      console.error("Failed to update task", err);
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="task-management-app">
      <main className="app-main">
        {isTaskFormOpen && (
          <TaskForm
            onSubmit={handleAddTask}
            onCancel={() => setIsTaskFormOpen(false)}
          />
        )}
        <TaskList
          tasks={tasks}
          onDeleteTask={handleDeleteTask}
          onUpdateTask={handleUpdateTask}
        />
      </main>
    </div>
  );
};

export default TaskManagementApp;
