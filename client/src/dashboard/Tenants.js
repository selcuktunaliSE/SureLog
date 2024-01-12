import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, Col, Row, DropdownButton, Dropdown, Alert, FormControl, InputGroup, Button } from "react-bootstrap";
import {Search} from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import HeaderMobile from "../layouts/HeaderMobile";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import "../scss/customStyle.scss";

import DynamicTable from "../components/DynamicTable";
import BarChartCard from "../components/BarChartCard";

const {FetchStatus} = require("../service/FetchService");
const fetchService = require("../service/FetchService");

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
  const [tenantDict, setTenantDict] = useState({});


  const searchKeys = ["name"];

  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");


  useEffect(() => {
    // Check if the user is a master user and get their ID
    if(! userId) {
        console.log("User ID not found");
        navigate("/signin");
    }

    if(checkMasterUser()){
      setIsMaster(true);
      fetchTenants();
    }
    
  }, [navigate, isMaster]);

  const fetchTenants = async () => {
    const response = await fetchService.fetchTenants(userId);
    const data = response.data;

    if(! response.isError()){
      setTenants(JSON.parse(data.tenants));
      setTenantDict(JSON.parse(data.tenants));
      setIsError(false);
      setErrorMessage("");
    }
    else{
      handleErrorResponse(response);
    }
  };

  const checkMasterUser = async () => {
    const response = await fetchService.checkMasterUser(userId);
    if(response.isError()) handleErrorResponse(response);
    return ! response.isError();
  }

  const handleErrorResponse = (response) => {
    if (response.status === FetchStatus.UserNotFound){
      navigate("/signin");
    } 
    else if(response.status ===  FetchStatus.MasterNotFound){
        navigate("/");
    }
    else if(response.status === FetchStatus.ServerException){
        navigate("/error/500");
    }
    else if(response.status === FetchStatus.AccessDenied){
      setIsError(true);
      setErrorMessage("You do not have any tenants registered to you. Please contact your administrator.");
    }
    else if(response.status === FetchStatus.RoleNotFound){
      setIsError(true);
      setErrorMessage("You do not have any roles in any tenants. Please contact your administrator.");
    }
    else if(response.status === FetchStatus.FetchError){
      console.error("Error fetching tenants: ", response.message);
      navigate("/error/503");
    }
    else {
        navigate("/");
    }
  }  

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

  const handleRowClick = (tenant) => {
    goToTenantProfile(tenant.tenantId);
  }

  const goToTenantProfile = (tenantId) => {
    navigate("/tenant-profile", {state: {tenantId: tenantId}});
  }

  const handleProcessSearchQuery = () => {
    // Process the search query using selectedSearchKey and searchQuery
    console.log("Searching for:", searchQuery, "with key:", selectedSearchKey || "firstName");
    let filtered = {};
    const searchKey = selectedSearchKey || "firstName"; // Use selectedSearchKey or default to "firstName"
    const lowerCaseQuery = searchQuery.toLowerCase();

    Object.keys(tenantDict).forEach(tenantId => {
      console.log("tenant: ", tenant);
      const tenant = tenantDict[tenantId];
      const fieldValue = tenant[searchKey] ? tenant[searchKey].toLowerCase() : ""; // Safely handle undefined values

      if (fieldValue.includes(lowerCaseQuery)) {
          filtered[tenantId] = tenant;
      }
    });

    console.log("filtered tenants: ", filtered);
    setFilteredTenants(filtered);
  };

  return (
    <React.Fragment>
      <HeaderMobile />
      <Header onSkin={handleSkinModeChange} />
      <div className="main p-4 p-lg-5 mt-5">
        <Row className="g-5 d-flex align-items-center justify-content-between mb-4">
          <Col md={12}>
            <h2 className="main-title">Tenant List</h2>
            {isError && <Alert variant="danger" className="mb-3">{errorMessage}</Alert>}


            <Row className="mt-3">
              <Col md={12}>
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

            <Row className="mt-3">
              <Col md={12}>
                <DynamicTable dataDict={tenantDict} onRowClick={handleRowClick}/>
              </Col>
            </Row>

            <Row style={{ height: '80vh' }} className="flex-grow-1">
              <Col md={6} className="d-flex">
                <div className="w-100 d-flex flex-column">
                  <BarChartCard />
                </div>
              </Col>

              <Col md={6}>
                  COMING SOON
              </Col> 
            </Row>  

          </Col>
        </Row>
      </div>
      <Footer />
    </React.Fragment>
  );
}