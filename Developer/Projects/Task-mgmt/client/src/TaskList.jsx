import React from "react";

const TaskList = ({ tasks, onDelete, onUpdate }) => {
  return (
    <div>
      {tasks.map((task) => (
        <div key={task.id}>
          <h3>{task.title}</h3>
          <p>{task.description}</p>
          <p>Status: {task.status}</p>
          <p>Due Date: {task.dueDate}</p>
          <p>Priority: {task.priority}</p>
          <button onClick={() => onUpdate(task.id)}>Update Task</button>
          <button onClick={() => onDelete(task.id)}>Delete Task</button>
        </div>
      ))}
    </div>
  );
};

export default TaskList;
