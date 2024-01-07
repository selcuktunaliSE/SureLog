import React, { useState, useEffect } from "react";
import { Card, Col, Row, Image } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Footer from "../layouts/Footer";
import HeaderMobile from "../layouts/HeaderMobile";
import Header from "../layouts/Header";
import img1 from "../assets/img/img1.jpg"; // Placeholder image for user profile

const fetchConfig = require("../config/fetchConfig.json");

const {host, port} = fetchConfig;
const fetchAddress = `http://${host}:${port}`;

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [skinMode, setSkinMode] = useState("");
  
  const navigate = useNavigate();

  const fetchUserData = async () => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      console.error("No userId found in local storage");
      navigate("/pages/signin");
      return;
    }

    try {
      const response = await fetch(`${fetchAddress}/api/get-user-details?userId=${userId}`);
      const data = await response.json();
      if (data.status === "success") {
        setUserData(data.user);
      } else {
        console.error("User data fetch request failed, server message: ", data.message);
        navigate("/pages/error-505");
      }
    } catch (error) {
      console.error("Error fetching user data: ", error);
      navigate("/pages/error-503");
    }
  };

  const handleSkinModeChange = (skin) => {
    setSkinMode(skin)
  }

  useEffect(() => {
    fetchUserData();
  }, []);

  if (!userData) {
    return <div>Loading user data...</div>;
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  return (
    <React.Fragment>
      <HeaderMobile />
      <Header onSkin={handleSkinModeChange}/>
      <div className="main p-4 p-lg-5 mt-5">
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="mb-5 text-center">
              <Card.Body style={{color: "#e2e5ec"}}>
                <Image 
                  src={img1} 
                  roundedCircle 
                  className="img-fluid mb-3" 
                  alt="User Profile" 
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }} 
                />
                <h5>{userData.firstName} {userData.lastName}</h5>
                <p><strong>Email:</strong> {userData.email}</p>
                <p><strong>User ID:</strong> {userData.userId}</p>
                <p><strong>Account Created:</strong> {formatDate(userData.createdAt)}</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Footer />
      </div>
    </React.Fragment>
  );
}
