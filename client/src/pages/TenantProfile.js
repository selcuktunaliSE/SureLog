import React, { useState, useEffect } from "react";
import { Card, Col, Row, Image } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import Footer from "../layouts/Footer";
import HeaderMobile from "../layouts/HeaderMobile";
import Header from "../layouts/Header";

const {FetchStatus} = require("../service/FetchService");
const fetchService = require("../service/FetchService");

export default function TenantProfile() {
  const [tenantData, setTenantData] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [isError, setIsError] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const userId = localStorage.getItem("userId");
  const tenantId = location.state?.tenantId;

  const fetchTenantProfile = async () => {
    const response = await fetchService.fetchTenantProfile(userId, tenantId);

    if(!response.isError()){
        console.log("response tenant data: ", response.data.tenant);
        setTenantData(response.data.tenant);
        console.log("final tenant data: ", tenantData);
    }
    else{
        handleErrorResponse(response);
    }
  };

  useEffect(() => {

    console.log(`User ID:${userId}, Tenant ID:${tenantId}`);
    if(!userId){
      navigate("/signin");
      return;
    }
    if(!tenantId){
      navigate("/dashboard/tenants");
      return;
    }
    
    fetchTenantProfile();

    if (!tenantData) {
      navigate("/error/404");
    }
  }, [location.state, navigate]);

  

  const handleErrorResponse = (response) => {
    if(response.status === FetchStatus.AccessDenied){
      navigate("/error/505");
    }
    else if(response.status === FetchStatus.TenantNotFound){
      navigate("/error/404");
    }
    else if(response.status === FetchStatus.ServerException){
      navigate("/error/500");
    }
    else if(response.status === FetchStatus.FetchError){
      console.log("Error while fetching tenant profile: ", response.message);
    }
  }

  // Function to format the date
  const formatDate = (dateStr) => {
    // ... same as in the Profile component
  };

  return (
    <React.Fragment>
      <HeaderMobile />
      <Header /* ...props */ />
      <div className="main p-4 p-lg-5 mt-5">
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="mb-5 text-center">
              <Card.Body style={{color: "#e2e5ec"}}>
                {tenantData ? (
                  <>
                    <h5>{tenantData.name}</h5>
                    <p><strong>Tenant ID:</strong> {tenantData.tenantId}</p>
                    <p><strong>User Count:</strong> {tenantData.userCount}</p>
                    <p><strong>Account Created:</strong> {formatDate(tenantData.createdAt)}</p>
                    <p><strong>Last Updated:</strong> {formatDate(tenantData.updatedAt)}</p>
                  </>
                ) : (
                  <p>Loading tenant data...</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Footer />
      </div>
    </React.Fragment>
  );
  
}
