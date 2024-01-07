import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, Col, Row, DropdownButton, Dropdown, Alert, FormControl, InputGroup, Button } from "react-bootstrap";
import {Search} from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import HeaderMobile from "../layouts/HeaderMobile";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import "../scss/customStyle.scss";

const fetchConfig = require("../config/fetchConfig.json");

const {host, port} = fetchConfig;
const fetchAddress = `http://${host}:${port}`;

export default function Tenants() {
  
  const [isMaster, setIsMaster] = useState(false);
  const [tenants, setTenants] = useState([]); 
  const [filteredTenants, setFilteredTenants] = useState({});
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSearchKey, setSelectedSearchKey] = useState("");
  const [searchKeyList, setSearchKeyList] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortBy, setSortBy] = useState("createdAt");
  const [skinMode, setSkinMode] = useState("");

  const searchKeys = ["name"];

  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");


  useEffect(() => {
    // Check if the user is a master user and get their ID
    if(! userId) {
        console.log("User ID not found");
        navigate("/signin");
    }
    fetch(`${fetchAddress}/api/check-master-user`, {
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
          navigate("/signin");
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
    fetch(`${fetchAddress}/api/fetch-tenants`, {
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

  const handleSkinModeChange = (skin) => {
    setSkinMode(skin);
    // You can add any other logic you need here for handling skin mode changes
  };

  const handleTenantSelect = (tenantId) => {
    setSelectedTenant(tenantId);
    // You can navigate or perform actions when a tenant is selected
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };
  
  const handleSortOrderChange = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    // You can filter tenants based on searchQuery
  };

  const handleSearchKeySelect = (key) => {
    setSelectedSearchKey(key);
  };

  const handleProcessSearchQuery = () => {
    // Process the search query using selectedSearchKey and searchQuery
    console.log("Searching for:", searchQuery, "with key:", selectedSearchKey);
    // Add your search logic here
  };

  return (
    <React.Fragment>
      <HeaderMobile />
      <Header onSkin={handleSkinModeChange} />
      <div className="main p-4 p-lg-5 mt-5">
        <Row className="g-5">
          <Col>
            <h2 className="main-title">Tenant List</h2>
            {isError && <Alert variant="danger" className="mb-3">{errorMessage}</Alert>}

            <Col md={6}>
              <DropdownButton
                id="sort-dropdown"
                title={`Sort by ${sortBy} (${sortOrder.toUpperCase()})`}
              >
                <Dropdown.Item onClick={handleSortOrderChange}>
                  Toggle Sort Order
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item value="createdAt" onClick={handleSortChange}>
                  Created At
                </Dropdown.Item>
                <Dropdown.Item value="updatedAt" onClick={handleSortChange}>
                  Updated At
                </Dropdown.Item>
              </DropdownButton>
            </Col>

            <Row className="mt-3">
              <Col>
                <InputGroup
                >
                  {/* Search Input */}
                  <FormControl
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={handleSearch}
                  />

                  {/* Search Button */}
                  <Button 
                    variant="outline-secondary"
                    onClick={handleProcessSearchQuery}
                    style= {{borderColor: "rgba(200,200,200, 0.25)"}}>
                    <Search /> {/* Search icon */}
                  </Button>

                  {/* Dropdown for selecting search key */}
                  <DropdownButton
                    as={InputGroup}
                    title={selectedSearchKey || "Select Key"} // Show selected key or "Select Key"
                    id="input-group-dropdown"
                  >
                    {searchKeys.map((key) => (
                      <Dropdown.Item key={key} onClick={() => handleSearchKeySelect(key)}>
                        {key}
                      </Dropdown.Item>
                    ))}
                  </DropdownButton>
                  
                </InputGroup>  
              </Col>
            </Row>

            {/* Display Tenants */}
            <Row className="g-2 g-xxl-3 mb-5 mt-3">
              {
              tenants.map((tenant) => ( 
                <Col sm="6" md="4" key={tenant.tenantId}>
                  <Card className="card-tenant hover-tilt-effect" style={{color: "#e2e5ec"}}>
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
      <Footer />
    </React.Fragment>
  );
}