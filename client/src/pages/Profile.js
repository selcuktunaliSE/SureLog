import React, { useState, useEffect } from "react";
import { Card, Col, Row, Image } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import Footer from "../layouts/Footer";
import HeaderMobile from "../layouts/HeaderMobile";
import Header from "../layouts/Header";
import img1 from "../assets/img/img1.jpg"; // Placeholder image for user profile

const {FetchStatus} = require("../service/FetchService");
const fetchService = require("../service/FetchService");

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [skinMode, setSkinMode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isError, setIsError] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  let userId;
  let targetUserId;

  const fetchUserData = async () => {
    if (!userId) {
      console.error("No userId found in local storage");
      navigate("/signin");
      return;
    }

    let response = await fetchService.fetchUserProfile(userId, targetUserId ? targetUserId : userId);

    if(!response.isError()){
      setUserData(response.data.user);
    }
    else{
      handleErrorResponse(response);
    }
  };

  const handleErrorResponse = (response) => {
    if(response.status === FetchStatus.AccessDenied){
      navigate("/error/505");
    }
    else if(response.status === FetchStatus.UserNotFound){
      setErrorMessage("Requested user was not found.");
      setIsError(true);
    }
    else if(response.status === FetchStatus.ServerException){
      navigate("/error/500");
    }
    else if(response.status === FetchStatus.FetchError){
      console.log("Fetch Error: ", response.message);
      navigate("/error/503");
    }
  }

  const handleSkinModeChange = (skin) => {
    setSkinMode(skin)
  }

  useEffect(() => {
    userId = localStorage.getItem("userId");
    targetUserId = location.state?.targetUserId;
    fetchUserData();
  }, [location.state]);

  

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  if (!userData) {
    return <div>Loading user data...</div>;
  }

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
