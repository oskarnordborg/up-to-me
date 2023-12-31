import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "./UserPage.css";
import { getUserId } from "../components/RequireAuth";
import FastAPIClient from "../services/FastAPIClient";

import OneSignal from "react-onesignal";

export default function UserPage({ toggleLoading }) {
  const { startemail } = useParams();
  const usernameRef = useRef();
  const userRef = useRef();
  const firstNameRef = useRef();
  const lastNameRef = useRef();
  const [isLoading, setIsLoading] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [onesignalId, setOnesignalId] = useState("");
  const [statistics, setStatistics] = useState({});

  const fastAPIClient = new FastAPIClient();
  const userId = getUserId();

  useEffect(() => {
    fetchUserInfo(userId);
  }, []);

  const fetchUserInfo = async (userId) => {
    toggleLoading(true);
    try {
      const response = await fastAPIClient.get(
        `/appuser/?external_id=${userId}`
      );
      if (!response.error) {
        if (response) {
          setUsername(response.username || "");
          setEmail(response.email || startemail);
          setFirstName(response.firstname || "");
          setLastName(response.lastname || "");
          setStatistics(response.statistics || {});
          if (!response.onesignal_id && OneSignal.User.PushSubscription.id) {
            response.onesignal_id = OneSignal.User.PushSubscription.id;
            updateAppUser(response);
          }
        }
      } else {
        console.error("Failed to fetch user data: " + response.error);
      }
    } catch (error) {
      console.error("An error occurred while fetching data:", error);
    }

    toggleLoading(false);
  };

  const updateAppUser = async (data = undefined) => {
    toggleLoading(true);
    try {
      const response = await fastAPIClient.put(`/appuser/`, {
        userid: userId,
        username: data?.username || username,
        email: data?.email || email,
        firstname: data?.firstname || firstName,
        lastname: data?.lastname || lastName,
        onesignal_id: data?.onesignal_id || onesignalId,
      });
      if (!response.error) {
        toast("Updated info", {
          type: "success",
          autoClose: 1000,
          hideProgressBar: true,
        });
      } else {
        toast(
          "Failed to update user info: " + JSON.parse(response.error).detail,
          {
            type: "error",
            autoClose: 3000,
            hideProgressBar: true,
          }
        );
      }
    } catch (error) {
      toast("Failed to update user info", {
        type: "error",
        autoClose: 1000,
        hideProgressBar: true,
      });
    }
    toggleLoading(false);
  };
  const requestPermission = async () => {
    OneSignal.Notifications.requestPermission();
  };

  return (
    <section>
      {!isLoading && !OneSignal.Notifications.permission && (
        <button onClick={requestPermission} className="update-button">
          Enable push notifications
        </button>
      )}
      <h1 className="registration-heading">User info</h1>
      <div className="input-container">
        <label htmlFor="username">Username</label>
        <input
          type="username"
          id="username"
          ref={usernameRef}
          autoComplete="off"
          onChange={(e) => setUsername(e.target.value)}
          value={username}
          required
          aria-describedby="uidnote"
          className="input-field"
        />
      </div>
      <div className="input-container">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          ref={userRef}
          autoComplete="off"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          required
          aria-describedby="uidnote"
          className="input-field"
        />
      </div>
      <div className="input-container">
        <label htmlFor="firstname">First Name</label>
        <input
          type="text"
          id="firstName"
          ref={firstNameRef}
          autoComplete="off"
          onChange={(e) => setFirstName(e.target.value)}
          value={firstName}
          required
          aria-describedby="uidnote"
          className="input-field"
        />
      </div>
      <div className="input-container">
        <label htmlFor="lastname">Last Name</label>
        <input
          type="text"
          id="lastname"
          ref={lastNameRef}
          autoComplete="off"
          onChange={(e) => setLastName(e.target.value)}
          value={lastName}
          required
          aria-describedby="uidnote"
          className="input-field"
        />
      </div>
      <button onClick={updateAppUser} className="update-button">
        Update info
      </button>
      <h1 className="registration-heading">Statistics</h1>
      <table className="stats-table">
        <tbody>
          {Object.entries(statistics).map(([key, value]) => (
            <tr key={key}>
              <td>{key}:</td>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <ToastContainer />
    </section>
  );
}
