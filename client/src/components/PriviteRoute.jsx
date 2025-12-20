import React from 'react';
import { useSelector } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom';

function PriviteRoute() {
  const currentUser = useSelector((state) => state.user.currentUser);

  return currentUser ? <Outlet /> : <Navigate to="/signin" />;
}

export default PriviteRoute;
