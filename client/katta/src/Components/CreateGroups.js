import React, { useEffect, useState, useContext } from "react";
import { IconButton } from "@mui/material";
import "./myStyle.css";
import axios from "axios";
import { useSelector } from "react-redux";
import SearchSharpIcon from "@mui/icons-material/SearchSharp";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import AddIcon from "@mui/icons-material/Add";
import { RefreshContext } from "../App";
import Avatar from "@mui/material/Avatar";
import { bufferToImage } from "./Utils";
import Facebook from "./Skeleton";
import SimpleBackdrop from "./PageLoading";
import chat from "./Images/Katta_logo_2.png";
export default function CreateGroups() {
  const URL = process.env.REACT_APP_API_KEY;
  const [users, setUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const lightTheme = useSelector((state) => state.themeKey);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedNames, setSelectedNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createloading, setCreateLoading] = useState(false);
  const { MasterRefresh, setMasterRefresh } = useContext(RefreshContext);
  useEffect(() => {
    setLoading(true);
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${URL}/user/fetchUsers`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const usersWithoutPasswords = response.data.map(
          ({ _id, name, email, image }) => ({
            _id,
            name,
            email,
            image,
          })
        );

        setUsers(usersWithoutPasswords);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    return (
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleCheckboxChange = (userId, userName, isChecked) => {
    if (isChecked) {
      setSelectedUsers((prevSelectedUsers) => [...prevSelectedUsers, userId]);
      setSelectedNames((prevSelectedNames) => [...prevSelectedNames, userName]);
    } else {
      setSelectedUsers((prevSelectedUsers) =>
        prevSelectedUsers.filter((selectedUserId) => selectedUserId !== userId)
      );
      setSelectedNames((prevSelectedNames) =>
        prevSelectedNames.filter((selectedName) => selectedName !== userName)
      );
    }
  };

  const createGroup = async () => {
    setCreateLoading(true);
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found.");
        setCreateLoading(false);
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const data = {
        name: groupName,
        users: selectedUsers,
      };

      const response = await axios.post(
        `${URL}/chats/createGroup`,
        data,
        config
      );

      setMasterRefresh(!MasterRefresh);
      setSelectedUsers([]);
      setSelectedNames([]);
      setGroupName("");
    } catch (error) {
      console.error("Error creating group:", error);
    } finally {
      setCreateLoading(false);
    }
  };
  return (
    <div className={"list-container"}>
      <div className={"ug-header" + (lightTheme ? "" : " dark")}>
        <img src={chat} alt="alt" style={{ height: "2rem", width: "2rem" }} />
        <input
          placeholder="group name"
          className={`search-box${lightTheme ? "" : " dark"}`}
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        {selectedUsers.length > 0 && groupName.length > 0 ? (
          <IconButton onClick={createGroup}>
            <AddIcon />
          </IconButton>
        ) : null}
      </div>
      <div className={`ug-search${lightTheme ? "" : " dark"}`}>
        <IconButton>
          <SearchSharpIcon className={`icon${lightTheme ? "" : " dark"}`} />
        </IconButton>
        <input
          placeholder="Add users"
          className={`search-box${lightTheme ? "" : " dark"}`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div>
        {selectedNames.map((userName) => (
          <Chip label={userName} style={{ backgroundColor: "#7D82B8" }} />
        ))}
      </div>

      <div className="ug-list">
        {loading ? (
          <Facebook />
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user._id}
              className={"list-item" + (lightTheme ? "" : " dark")}
            >
              {user.image ? (
                <Avatar
                  className="con-icon"
                  sx={{ width: 52, height: 52, borderRadius: 15 }}
                  src={bufferToImage(user.image)}
                />
              ) : (
                <p className="con-icon">{user.name[0]}</p>
              )}
              <p
                className="con-title"
                style={{ color: lightTheme ? "black" : "white" }}
              >
                {user.name}
              </p>
              <div>
                {" "}
                <Checkbox
                  onChange={(e) =>
                    handleCheckboxChange(user._id, user.name, e.target.checked)
                  }
                  checked={selectedUsers.includes(user._id)}
                />
              </div>
            </div>
          ))
        )}
      </div>
      {createloading ? <SimpleBackdrop title="creating group .." /> : null}
    </div>
  );
}
