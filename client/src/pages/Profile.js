import React, { useState, useEffect } from "react";
import { Card, Col, Row, Image } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Footer from "../layouts/Footer";
import HeaderMobile from "../layouts/HeaderMobile";
import img1 from "../assets/img/img1.jpg"; // Placeholder image for user profile

export default function Profile() {
  const [userData, setUserData] = useState(null);
  
  const navigate = useNavigate();

  const fetchUserData = async () => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      console.error("No userId found in local storage");
      navigate("/pages/signin");
      return;
    }

    try {
      const response = await fetch(`http://localhost:9000/api/get-user-details?userId=${userId}`);
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

  useEffect(() => {
    fetchUserData();
  }, []);

  if (!userData) {
    return <div>Loading user data...</div>;
  }

  return (
    <React.Fragment>
      <HeaderMobile />
      <div className="main p-4 p-lg-5">
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="mb-5 text-center">
              <Card.Body>
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
                <p><strong>Account Created:</strong> {userData.createdAt}</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Footer />
      </div>
    </React.Fragment>
  );
}