import React from "react";
import { useClerk } from "@clerk/clerk-react";
import "./Dashboard.css";

const Header = ({ setFilter, setSort, setIsTaskFormOpen }) => {
  const { signOut } = useClerk();

  const handleSortChange = (event) => {
    setSort(event.target.value);
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const handleNewTaskClick = () => {
    setIsTaskFormOpen(true);
  };

  return (
    <header className="dashboard__header">
      <h1 className="dashboard__title">Task Management</h1>
      <div className="dashboard__controls">
        {/* Filter Dropdown */}
        <select className="dashboard__dropdown" onChange={handleFilterChange}>
          <option value="all">All</option>
          <option value="to-do">To-do</option>
          <option value="in progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        {/* Sort Dropdown */}
        <select className="dashboard__dropdown" onChange={handleSortChange}>
          <option value="dueDate">Sort by Due Date</option>
          <option value="title">Sort by Title</option>
        </select>

        {/* New Task Button */}
        <button className="dashboard__button" onClick={handleNewTaskClick}>
          New Task
        </button>

        {/* Logout Button */}
        <button className="dashboard__button" onClick={signOut}>
          Log out
        </button>
      </div>
    </header>
  );
};

export default Header;
