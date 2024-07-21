import React from "react";
import "./myStyle.css";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Button, Result } from "antd";
export default function MainContainer() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  if (!token) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="Sorry, you are not authorized to access this page."
        extra={
          <Button type="primary" onClick={() => navigate("/")}>
            Back Home
          </Button>
        }
      />
    );
  }
  return (
    <div className="main-container">
      <Sidebar />
      <Outlet />
    </div>
  );
}
