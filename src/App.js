import React, { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "./App.css"; // Import the styles

const candidates = [
  { id: 1, name: "Brandon", eligibleRoles: ["President", "Vice President", "Treasurer", "Committee Head Coordinator"], role: "Eboard" },
  { id: 2, name: "Caleb", eligibleRoles: ["President", "Vice President", "Treasurer", "Committee Head Coordinator", "Praise Team Leaders"], role: "Committee Head" },
  { id: 3, name: "Jefferson", eligibleRoles: ["President", "Vice President", "Treasurer", "Committee Head Coordinator", "Praise Team Leaders"], role: "Committee Head" },
  { id: 4, name: "Josh", eligibleRoles: ["President", "Vice President", "Treasurer", "Committee Head Coordinator"], role: "Committee Head" },
  { id: 5, name: "Mina", eligibleRoles: ["Vice President", "Praise Team Leaders"], role: "Eboard" },
  { id: 7, name: "Nathan", eligibleRoles: ["Treasurer"], role: "Eboard" },
  { id: 8, name: "Paul", eligibleRoles: ["Small Group Coordinator"], role: "Small Group Leader" },
  { id: 9, name: "Rebecca", eligibleRoles: ["President", "Vice President", "Treasurer", "Small Group Coordinator"], role: "Small Group Leader" },
  { id: 10, name: "Sean", eligibleRoles: ["President", "Vice President", "Treasurer", "Small Group Coordinator"], role: "Small Group Leader" },
  { id: 11, name: "Serena", eligibleRoles: ["President", "Vice President", "Treasurer","Small Group Coordinator"], role: "Small Group Leader" },
  { id: 12, name: "Sophia", eligibleRoles: ["President", "Vice President", "Treasurer", "Committee Head Coordinator"], role: "Committee Head" },
  { id: 13, name: "Yong", eligibleRoles: ["President", "Vice President", "Treasurer", "Small Group Coordinator"], role: "Small Group Leader" },
  { id: 14, name: "Chris", eligibleRoles: ["Praise Team Leaders"], role: "Praise Team" },
  { id: 15, name: "Kenny", eligibleRoles: ["Praise Team Leaders"], role: "Praise Team" },
  { id: 16, name: "Will", eligibleRoles: ["Praise Team Leaders"], role: "Praise Team" }
];

const roles = ["President", "Vice President", "Treasurer", "Committee Head Coordinator", "Small Group Coordinator", "Praise Team Leaders"];

const Candidate = ({ candidate, isAssigned, onDragStart, onDragEnd }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "CANDIDATE",
    item: candidate,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: !isAssigned, // Disable dragging if the candidate is already assigned
  }));

  return (
    <div
      ref={drag}
      className={`candidate ${candidate.role.toLowerCase().replace(/ /g, "-")}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      onDragStart={() => onDragStart(candidate)}
      onDragEnd={onDragEnd}
    >
      {candidate.name}
    </div>
  );
};

const RoleDropZone = ({ role, assignedCandidates, onDrop, onRemoveCandidate, isDarkened, isSelected, onClick }) => {
  const [{ canDrop, isOver }, drop] = useDrop(() => ({
    accept: "CANDIDATE",
    drop: (item) => onDrop(item, role),
    canDrop: (item) => item.eligibleRoles.includes(role),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`role-box ${canDrop ? "border-highlight" : ""} ${isDarkened ? "darkened" : ""} ${isSelected ? "selected" : ""}`}
      onClick={() => onClick(role)}
    >
      <p>{role}</p>
      {assignedCandidates.length > 0 ? (
        assignedCandidates.map((candidate) => (
          <div
            key={candidate.id}
            className={`assigned ${candidate.role.toLowerCase().replace(/ /g, "-")}`}
            onClick={(e) => {
              e.stopPropagation(); // Stop event propagation
              onRemoveCandidate(role, candidate.id);
            }}
          >
            {candidate.name}
          </div>
        ))
      ) : (
        <p className="placeholder"></p>
      )}
    </div>
  );
};

// Load assignments from local storage
const loadAssignments = () => {
  const savedAssignments = localStorage.getItem("assignments");
  return savedAssignments ? JSON.parse(savedAssignments) : {};
};

const App = () => {
  const [assignments, setAssignments] = useState(loadAssignments());
  const [draggedCandidate, setDraggedCandidate] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  // Save assignments to local storage whenever they change
  useEffect(() => {
    localStorage.setItem("assignments", JSON.stringify(assignments));
  }, [assignments]);

  const handleDrop = (candidate, role) => {
    if (!candidate) return; // Ignore if no candidate is provided

    setAssignments((prev) => {
      const updatedAssignments = { ...prev };
      if (!updatedAssignments[role]) {
        updatedAssignments[role] = []; // Initialize an empty array if the role has no candidates
      }
      updatedAssignments[role] = [...updatedAssignments[role], candidate]; // Add the candidate to the role
      return updatedAssignments;
    });

    setDraggedCandidate(null); // Reset draggedCandidate after drop
  };

  const handleRemoveCandidate = (role, candidateId) => {
    setAssignments((prev) => {
      const updatedAssignments = { ...prev };
      updatedAssignments[role] = updatedAssignments[role].filter(
        (candidate) => candidate.id !== candidateId
      );
      return updatedAssignments;
    });
  };

  const handleDragStart = (candidate) => {
    setDraggedCandidate(candidate);
  };

  const handleDragEnd = () => {
    setDraggedCandidate(null);
  };

  const handleRoleClick = (role) => {
    setSelectedRole(role === selectedRole ? null : role);
  };

  // Get IDs of assigned candidates
  const assignedCandidateIds = Object.values(assignments).flat().map((candidate) => candidate.id);

  // Filter candidates based on selected role and assigned status
  const filteredCandidates = selectedRole
    ? candidates.filter(
        (candidate) =>
          candidate.eligibleRoles.includes(selectedRole) &&
          !assignedCandidateIds.includes(candidate.id)
      )
    : candidates.filter((candidate) => !assignedCandidateIds.includes(candidate.id));

  return (
    <DndProvider backend={HTML5Backend}>
      <h1>Nominations</h1>
      <div className="container">
        <div className="candidates-list">
          <h2>Leaders</h2>
          {filteredCandidates.map((candidate) => (
            <Candidate
              key={candidate.id}
              candidate={candidate}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
          ))}
        </div>
        <div className="roles-container">
          {roles.map((role) => (
            <RoleDropZone
              key={role}
              role={role}
              assignedCandidates={assignments[role] || []}
              onDrop={handleDrop}
              onRemoveCandidate={handleRemoveCandidate}
              isDarkened={
                draggedCandidate &&
                !draggedCandidate.eligibleRoles.includes(role)
              }
              isSelected={role === selectedRole}
              onClick={handleRoleClick}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
};


export default App;