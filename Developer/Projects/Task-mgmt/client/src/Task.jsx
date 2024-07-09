import React from "react";

const Task = ({
  task,
  onDelete,
  onUpdate,
  onAddCollaborator,
  onRemoveCollaborator,
}) => {
  const handleDelete = () => {
    onDelete(task._id);
  };

  const handleUpdate = () => {
    onUpdate(task._id);
  };

  const handleAddCollaborator = () => {
    const userId = prompt("Enter the user ID of the collaborator:");
    const role = prompt("Enter the role (creator, collaborator, viewer):");
    if (userId && role) {
      onAddCollaborator(task._id, { userId, role });
    }
  };

  const handleRemoveCollaborator = (collaboratorId) => {
    onRemoveCollaborator(task._id, collaboratorId);
  };

  return (
    <div className="task">
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      <p>Due Date: {new Date(task.dueDate).toLocaleDateString()}</p>
      <p>Priority: {task.priority}</p>
      <p>Project/Tag: {task.project}</p>
      <button onClick={handleUpdate}>Edit</button>
      <button onClick={handleDelete}>Delete</button>
      <button onClick={handleAddCollaborator}>Add Collaborator</button>
      <div>
        <h4>Collaborators:</h4>
        <ul>
          {task.collaborators.map((collab) => (
            <li key={collab._id}>
              {collab.userId} ({collab.role}){" "}
              <button onClick={() => handleRemoveCollaborator(collab._id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Task;
