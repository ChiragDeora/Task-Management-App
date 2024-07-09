import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import TaskForm from "./TaskForm";
import TaskManagementApp from "./TaskManagement";
import { useClerk } from "@clerk/clerk-react";
import Header from "./Header";
import "./Dashboard.css";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false); // Ensure this state is correctly used
  const [loading, setLoading] = useState(true);
  const { signOut } = useClerk();
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("dueDate");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get("/tasks");
      setTasks(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setLoading(false);
    }
  };

  const handleCreateTask = async (newTask) => {
    try {
      const response = await axios.post("/tasks", newTask);
      setTasks([...tasks, response.data]);
      setIsTaskFormOpen(false); // Close TaskForm after task creation
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

  const handleUpdateTask = async (id, update) => {
    try {
      const response = await axios.put(`/tasks/${id}`, update);
      setTasks(tasks.map((task) => (task.id === id ? response.data : task)));
    } catch (err) {
      console.error(`Error updating task ${id}:`, err);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await axios.delete(`/tasks/${id}`);
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    if (!Array.isArray(filtered) || loading) {
      console.warn(
        "filteredTasks: Tasks data is not an array or still loading.",
      );
      return [];
    }

    if (filter !== "all") {
      filtered = tasks.filter((task) => task.status === filter);
    }

    return filtered.sort((a, b) => {
      if (sort === "dueDate") {
        return new Date(a.dueDate) - new Date(b.dueDate);
      } else if (sort === "title") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [tasks, filter, sort, loading]);

  const renderTaskColumn = (status, title) => (
    <div className="dashboard__task-column">
      <h2 className="dashboard__task-column-title">{title}</h2>
      <ul className="dashboard__task-list">
        {filteredTasks
          .filter((task) => task.status === status)
          .map((task) => (
            <li key={task.id} className="dashboard__task-item">
              <h3 className="dashboard__task-title">{task.title}</h3>
              <p className="dashboard__task-description">{task.description}</p>
              <div className="dashboard__task-footer">
                <span className="dashboard__task-due">Due: {task.dueDate}</span>
                <button
                  className="dashboard__task-button"
                  onClick={() =>
                    handleUpdateTask(task.id, {
                      status: status === "completed" ? status : "completed",
                      completedDate:
                        status === "completed"
                          ? task.completedDate
                          : new Date(),
                    })
                  }
                >
                  {status === "completed" ? "Completed" : "Complete"}
                </button>
                <button
                  className="dashboard__task-button"
                  onClick={() => handleDeleteTask(task.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );

  return (
    <div className="dashboard">
      <Header
        setFilter={setFilter}
        setSort={setSort}
        setIsTaskFormOpen={setIsTaskFormOpen}
      />
      <main className="dashboard__main">
        {renderTaskColumn("to-do", "To-do")}
        {renderTaskColumn("in progress", "In Progress")}
        {renderTaskColumn("completed", "Completed")}
      </main>
      {isTaskFormOpen && (
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setIsTaskFormOpen(false)}
        />
      )}
      {!loading && tasks.length > 0 && <TaskManagementApp tasks={tasks} />}
      <footer className="dashboard__footer">Made By Chirag Deora</footer>
    </div>
  );
}
