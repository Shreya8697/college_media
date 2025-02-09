import { useEffect, useState, useContext } from "react";
import axios from "axios";
import "./groupconvo.css";
import { AuthContext } from "../../context/AuthContext";

export default function GroupConversations() {
  const { user: currentUser } = useContext(AuthContext); // Current logged-in user
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null); // Track which group is being edited
  const [showOptions, setShowOptions] = useState(null); // Track which group is showing options
  const PF = process.env.REACT_APP_PUBLIC_FOLDER; // Public folder path

  // Fetch group conversations for the current user
  useEffect(() => {
    if (!currentUser) return;

    const fetchGroups = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/groups/${currentUser._id}`);
        setGroups(response.data);
      } catch (error) {
        console.error("Error fetching groups:", error);
        setError("Failed to fetch groups. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [currentUser]);

  // Fetch users when "Create Group" is clicked
  const fetchUsers = async () => {
    setError(null);
    try {
      const response = await axios.get("/users/all");
      setUsers(response.data.filter((user) => user._id !== currentUser._id));
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to fetch users. Please try again.");
    }
  };

  const handleGroupCreated = async () => {
    if (!groupName.trim()) {
      setError("Group name cannot be empty.");
      return;
    }

    if (selectedUsers.length === 0) {
      setError("Please select at least one user.");
      return;
    }

    if (!currentUser || !currentUser._id) {
      console.error("Current user is undefined or invalid.");
      setError("You must be logged in to create a group.");
      return;
    }

    const validMembers = [currentUser._id, ...selectedUsers.filter(userId => userId)];
    if (validMembers.length < 2) {
      setError("There must be at least one member besides yourself.");
      return;
    }

    const newGroup = {
      groupName,
      members: validMembers,
      createdBy: currentUser._id,
    };

    console.log("Creating group with:", newGroup);

    try {
      const response = await axios.post("/groups", newGroup, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Group created successfully:", response.data);

      setGroups((prevGroups) => [...prevGroups, response.data]);
      setShowCreateGroup(false);
      setGroupName("");
      setSelectedUsers([]);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to create group. Please try again.";
      console.error("Error creating group:", errorMessage);
      setError(errorMessage);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prevSelected) =>
      prevSelected.includes(userId)
        ? prevSelected.filter((id) => id !== userId)
        : [...prevSelected, userId]
    );
  };

  const openCreateGroupModal = () => {
    setShowCreateGroup(true);
    fetchUsers(); // Fetch users when the modal is opened
  };

  // Handle Edit Group
  const handleEditGroup = (group) => {
    setEditingGroup(group); // Set the group being edited
    setGroupName(group.groupName); // Prefill with current name
  };

  // Handle Update Group
  const handleUpdateGroup = async () => {
    if (!groupName.trim()) {
      setError("Group name cannot be empty.");
      return;
    }

    try {
      const response = await axios.put(`/groups/update-name/${editingGroup._id}`, {
        newGroupName: groupName,
      });
      console.log("Group updated successfully:", response.data);

      setGroups((prevGroups) =>
        prevGroups.map((group) =>
          group._id === editingGroup._id ? { ...group, groupName } : group
        )
      );

      setEditingGroup(null);
      setGroupName("");
    } catch (error) {
      console.error("Error updating group:", error);
      setError("Failed to update group. Please try again.");
    }
  };

  // Handle Delete Group
  const handleDeleteGroup = async (groupId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this group?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`/groups/${groupId}`);
      setGroups((prevGroups) =>
        prevGroups.filter((group) => group._id !== groupId)
      );
      console.log("Group deleted successfully");
    } catch (error) {
      console.error("Error deleting group:", error);
      setError("Failed to delete group. Please try again.");
    }
  };

  const handleLeaveGroup = async (groupId) => {
    const confirmLeave = window.confirm(
      "Are you sure you want to leave this group?"
    );
    if (!confirmLeave) return;
  
    try {
      const response = await axios.put(`/groups/leave-group/${groupId}`, {
        userId: currentUser._id,
      });
      console.log("Left group successfully:", response.data);
  
      setGroups((prevGroups) =>
        prevGroups.filter((group) => group._id !== groupId)
      );
    } catch (error) {
      console.error("Failed to leave group:", error.response || error.message);
      setError("Failed to leave group. Please try again.");
    }
  };
  

  return (
    <div className="group-conversations">
      <div className="header">
        <h2>Group Conversations</h2>
        <button className="create-group-btn" onClick={openCreateGroupModal}>
          + Create Group
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {showCreateGroup && (
        <div className="create-group-modal">
          <h3>Create Group</h3>
          <input
            type="text"
            placeholder="Enter group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="group-name-input"
          />
          <div className="user-selection">
            <h4>Select Users</h4>
            {users.length > 0 ? (
              users.map((user) => (
                <div
                  key={user._id}
                  className={`user-item ${selectedUsers.includes(user._id) ? "selected" : ""}`}
                  onClick={() => toggleUserSelection(user._id)}
                >
                  <span>{user.username}</span>
                </div>
              ))
            ) : (
              <p>Loading users...</p>
            )}
          </div>
          <div className="modal-actions">
            <button onClick={handleGroupCreated} className="create-btn" disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </button>
            <button
              onClick={() => {
                setShowCreateGroup(false);
                setGroupName("");
                setSelectedUsers([]);
              }}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading && <p>Loading groups...</p>}

      <div className="group-list">
        {groups.length > 0 ? (
          groups.map((group) => (
            <div className="group-item" key={group._id}>
              <img
                className="conversationImg"
                src={group.groupImage ? group.groupImage : PF + "person/grp.png"} // Default group image
                alt={group.groupName}
              />
              <div className="conversationDetails">
                <span className="conversationName">{group.groupName}</span>
                <p className="conversationLastMessage">
                  {group.lastMessage || "No messages yet."} {/* Placeholder for last message */}
                </p>
              </div>

              {/* Options Menu */}
              <div className="options-btn">
                <button onClick={() => setShowOptions(group._id === showOptions ? null : group._id)}>
                  ...
                </button>
                {showOptions === group._id && (
                  <div className="edit-delete-actions">
                    {currentUser._id === group.createdBy && (
                      <>
                        <button onClick={() => handleEditGroup(group)} className="edit-btn">
                          Edit
                        </button>
                        <button onClick={() => handleDeleteGroup(group._id)} className="delete-btn">
                          Delete
                        </button>
                      </>
                    )}
                    <button onClick={() => handleLeaveGroup(group._id)} className="leave-btn">
                      Leave Group
                    </button>
                  </div>
                )}
              </div>

              {editingGroup && editingGroup._id === group._id && (
                <div className="edit-group-name">
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Update group name"
                  />
                  <button onClick={handleUpdateGroup}>Save</button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No groups found</p>
        )}
      </div>
    </div>
  );
}
