import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, Col, Row, DropdownButton, Dropdown, Alert, FormControl } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import HeaderMobile from "../layouts/HeaderMobile";

export default function Tenants() {
  const [isMaster, setIsMaster] = useState(false);
  const [tenants, setTenants] = useState([]); 
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");


  useEffect(() => {
    // Check if the user is a master user and get their ID
    if(! userId) {
        console.log("User ID not found");
        navigate("/pages/signin");
    }
    fetch("http://127.0.0.1:9000/api/check-master-user", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("status: ", data.status);
        if (data.status === "success") {
          setIsMaster(true);
          fetchTenants();
        } else if (data.status === "userIdNotFound"){
          navigate("/pages/signin");
        } else if(data.status ===  "masterNotFound"){
            navigate("/");
        } else if(data.status === 500){
            navigate("/pages/error-500");
        } else {
            navigate("/");
        }
      })
      .catch((error) => {
        console.error("Error checking master user: ", error);
        navigate("/pages/error-503");
      });
  }, [navigate, isMaster]);

  const fetchTenants = () => {
    // Fetch the list of tenants for the master user
    fetch("http://127.0.0.1:9000/api/fetch-tenants", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          console.log("tenants:", data.tenants);
          setTenants(JSON.parse(data.tenants));
          setIsError(false);
          setErrorMessage("");
        } else if (data.status === 404) {
          setIsError(true);
          setErrorMessage("You do not have any tenants registered to you. Please contact your administrator.");
        } else if (data.status === 500) {
          navigate("/pages/error-500");
        }
          else if (data.status === "roleNotFound"){
            setIsError(true);
            setErrorMessage("You do not have any roles in any tenants. Please contact your administrator.");
          }
      })
      .catch((error) => {
        console.error("Error fetching tenants: ", error);
        navigate("/pages/error-503");
      });
  };

  const handleTenantSelect = (tenantId) => {
    setSelectedTenant(tenantId);
    // You can navigate or perform actions when a tenant is selected
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    // You can filter tenants based on searchQuery
  };

  return (
    <React.Fragment>
      <HeaderMobile />
      <div className="main p-4 p-lg-5">
        <Row className="g-5">
          <Col>
            <h2 className="main-title">Tenants List</h2>
            {isError && <Alert variant="danger">{errorMessage}</Alert>}

            {/* Search Input */}
            <FormControl className="mb-3"
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearch}
            />

            {/* Display Tenants */}
            <Row className="g-2 g-xxl-3 mb-5">
              {
              tenants.map((tenant) => ( 
                <Col sm="6" md="4" key={tenant.tenantId}>
                  <Card className="card-tenant">
                    <Card.Body>
                      <h6 className="mt-3">{tenant.name}</h6>
                      <p>{tenant.description}</p>
                      <Link to={`/pages/tenant-details?tenantId=${tenant.tenantId}`}>View Details</Link>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </div>
    </React.Fragment>
  );
}