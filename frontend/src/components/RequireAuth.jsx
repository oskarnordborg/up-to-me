import { useLocation, Navigate, Outlet } from "react-router-dom";
// import useAuth from "../hooks/useAuth";
import { useContext } from "react";
import AuthContext from "../context/AuthProvider";
import { jwtDecode } from "jwt-decode";

function hasMatchingRole(allowedRoles, userRoles) {
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  for (let i = 0; i < allowedRoles.length; i++) {
    if (userRoles.indexOf(allowedRoles[i]) !== -1) {
      return true;
    }
  }

  return false;
}

const RequireAuth = ({ allowedRoles }) => {
  const { auth } = useContext(AuthContext);
  const location = useLocation();

  let isAllowed = true;
  const jwt = localStorage.getItem("jwt");
  if (allowedRoles) {
    if (jwt) {
      const decodedToken = jwtDecode(jwt);

      isAllowed = hasMatchingRole(allowedRoles, decodedToken.roles);
    } else {
      isAllowed = false;
    }
  }

  return isAllowed ? (
    <Outlet />
  ) : auth?.verifiedToken ? (
    <Navigate to="/unauthorized" state={{ from: location }} replace />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default RequireAuth;