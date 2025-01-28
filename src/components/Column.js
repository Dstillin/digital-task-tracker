// components/Column.js
import React from "react";
import { useDrop } from "react-dnd";
import Task from "./Task";

const ItemType = {
  TASK: "task",
};

const Column = ({ status, tasks, onDrop, onDelete, onEdit }) => {
  const [{ isOver }, drop] = useDrop({
    accept: ItemType.TASK,
    drop: (item) => onDrop(item.id, status),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`flex-1 bg-gray-100 p-4 rounded ${
        isOver ? "bg-green-200" : ""
      }`}
    >
      <h2 className="text-xl font-semibold mb-4">{status}</h2>
      {tasks.map((task) => (
        <Task key={task.id} task={task} onDelete={onDelete} onEdit={onEdit} />
      ))}
    </div>
  );
};

export default Column;
