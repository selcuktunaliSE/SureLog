import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, Col, Row, DropdownButton, Dropdown, Alert, FormControl, InputGroup, Button } from "react-bootstrap";
import {Search} from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import HeaderMobile from "../layouts/HeaderMobile";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import "../scss/customStyle.scss";
import ReactApexChart from "react-apexcharts";

import DynamicTable from "../components/DynamicTable";
import BarChartCard from "../components/BarChartCard";
import ApexCharts from "../docs/ApexCharts";
import SingleStatisticCard from "../components/SingleStatisticCard";


const {FetchStatus} = require("../service/FetchService");
const fetchService = require("../service/FetchService");

export default function Tenants() {
  
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
  const [numTenantsStatisticDataDict, setNumTenantsStatisticDataDict] = useState({});
  const [numUsersStatisticDataDict, setNumUsersStatisticDataDict] = useState({});
  const [totalNumberOfUsers, setTotalNumberOfUsers] = useState(0);

  const currentSkin = (localStorage.getItem('skin-mode')) ? 'dark' : '';
  

  const searchKeys = ["name"];

  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");


  useEffect(() => {
    if(! userId) {
        navigate("/signin");
        return;
    }

    if(checkMasterUser()){
      fetchTenants();
      fetchTotalNumberOfUsers();
    }
  }, [navigate]);

  useEffect(() => {

    const numTenants = Object.keys(tenantDict).length;

    setNumTenantsStatisticDataDict({
      "icon": "ri-building-line",
      "percent": {
      "color": "success",
      "amount": "+28.5%"
      },
      "value": numTenants,
      "label": "Total Tenant Count",
      "last": {
      "color": "success",
      "amount": "2.3%"
      }
    });
  }, [tenantDict]);

  useEffect(() => {
    setNumUsersStatisticDataDict({
      "icon": "ri-group-line",
      "percent": {
      "color": "success",
      "amount": "+13.8%"
      },
      "value": totalNumberOfUsers,
      "label": "Total User Count",
      "last": {
      "color": "success",
      "amount": "7.1%"
      }
    })
  }, [totalNumberOfUsers]);

  const fetchTenants = async () => {
    const response = await fetchService.fetchTenantsOfMaster(userId);

    if(! response.isError()){
      const data = response.data;
      setTenantDict(data.tenants);
      setIsError(false);
      setErrorMessage("");
    }
    else{
      handleErrorResponse(response);
    }
  };

  const fetchTotalNumberOfUsers = async () => {
    const response = await fetchService.fetchTotalNumberOfUsers(userId);
    
    if(! response.isError()){
      setTotalNumberOfUsers(response.data.totalNumberOfUsers);
      setIsError(false);
      setErrorMessage("");
    }
    else{
      handleErrorResponse(response);
    }
  }

  const checkMasterUser = async () => {
    const response = await fetchService.checkMasterUser(userId);
    if(response){
      console.log("Response: ", response);
    }

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
      <div className="d-md-flex align-items-center justify-content-between mb-4">
          <div>
            <ol className="breadcrumb fs-sm mb-1">
              <li className="breadcrumb-item"><Link to="#">Dashboard</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Tenants</li>
            </ol>
            <h4 className="main-title mb-0">Welcome to Dashboard</h4>
          </div>
          <div className="d-flex gap-2 mt-3 mt-md-0">
            <Button variant="" className="btn-white d-flex align-items-center gap-2">
              <i className="ri-share-line fs-18 lh-1"></i>Share
            </Button>
            <Button variant="" className="btn-white d-flex align-items-center gap-2">
              <i className="ri-printer-line fs-18 lh-1"></i>Print
            </Button>
            <Button variant="primary" className="d-flex align-items-center gap-2">
              <i className="ri-bar-chart-2-line fs-18 lh-1"></i>Generate<span className="d-none d-sm-inline"> Report</span>
            </Button>
          </div>
        </div>
        
       
        <Row className="g-5 d-flex align-items-center justify-content-between mb-4">
          <Col md={12}>
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
                <div className="cursor-pointer">
                  <DynamicTable dataDict={tenantDict} onRowClick={handleRowClick}/>
                </div>
              </Col>
            </Row>
            

            <Row style={{ height: '50vh', marginBottom: "10rem" }} className="flex-grow-1 mt-3">
              <Col md={6} className="d-flex">
                <div className="w-100 d-flex flex-column">
                  <BarChartCard tenants={tenantDict}theme = {currentSkin} />
                </div>
              </Col>
              <Col md ={6} className="d-flex">
              <div className="w-100 d-flex flex-column">
              <Row style={{height: "50%"}} className="g-3">
                  <SingleStatisticCard dataDict={numTenantsStatisticDataDict}/>
                  <SingleStatisticCard dataDict={numUsersStatisticDataDict}/>
              </Row>

                </div>
              </Col>
              <Col xl="5">
              </Col>
               </Row>  

             </Col>
        </Row>
      </div>
      <Footer />
    </React.Fragment>
  );
}