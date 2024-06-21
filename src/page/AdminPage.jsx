import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userKeys, setUserKeys] = useState({});
  const navigate = useNavigate();
  if (localStorage.getItem("user_key") !== "admin1") {
    navigate("/");
  }
  useEffect(() => {
    // Fetch users from the backend
    let baseURL = "";
    if (process.env.NODE_ENV === "development") {
      // If in development environment, use local IP
      baseURL = "http://121.139.20.242:5011";
    }
    axios
      .get(`${baseURL}/api/users_with_null_key`)
      .then((response) => {
        setUsers(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, []);

  const handleInputChange = (id, value) => {
    setUserKeys({
      ...userKeys,
      [id]: value,
    });
  };

  const handleAssignKey = (uid) => {
    const userKey = userKeys[uid];
    if (!userKey) {
      alert("Please enter a user key.");
      return;
    }
    let baseURL = "";
    if (process.env.NODE_ENV === "development") {
      // If in development environment, use local IP
      baseURL = "http://121.139.20.242:5011";
    }
    axios
      .post(`${baseURL}/api/assign_user_key`, { uid, userKey })
      .then((response) => {
        // Update the users state to reflect the change
        setUsers(
          users.map((user) =>
            user.uid === uid ? { ...user, user_key: userKey } : user
          )
        );
        alert("User key assigned successfully.");
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error assigning user key:", error);
        alert("Error assigning user key.");
      });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <>
      <div>관리자페이지</div>
      <div>
        {users.length === 0 ? (
          <p>No users found with a null user_key.</p>
        ) : (
          <ul>
            {users.map((user) => (
              <li key={user.user_uid}>
                식별자 : {user.uid}
                <br />
                아이디 : {user.user_id}
                <br />
                패스워드 : {user.user_pw}
                <br />
                이름 : {user.uname}
                <br />
                생년월일 : {user.udate}
                <br />
                이메일 : {user.umail}
                <br />
                <input
                  type="text"
                  value={userKeys[user.uid] || ""}
                  onChange={(e) => handleInputChange(user.uid, e.target.value)}
                  placeholder="지정할 키값을 입력"
                />
                <button onClick={() => handleAssignKey(user.uid)}>
                  키 지정
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
