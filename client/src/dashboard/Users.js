import React from "react";
import { Col, Row, DropdownButton, Dropdown, Alert, FormControl, InputGroup, Button} from "react-bootstrap";
import { Search } from "react-bootstrap-icons";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import Footer from "../layouts/Footer";
import HeaderMobile from "../layouts/HeaderMobile";
import Header from "../layouts/Header";
import "../scss/customStyle.scss";
import img6 from "../assets/img/img6.jpg";
import img7 from "../assets/img/img7.jpg";

import DynamicTable from "../components/DynamicTable";

const {FetchStatus} = require("../service/FetchService");
const fetchService = require("../service/FetchService");

export default function Users() {
 
  const [tenants, setTenants] = useState([]);
  const [isUserMaster, setIsUserMaster] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState(null);
  const [userDict, setUserDict] = useState({});
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTenantName, setSelectedTenantName] = useState(""); // [TODO] Implement this
  const [selectedSearchKey, setSelectedSearchKey] = useState("");
  const [searchKeyList, setSearchKeyList] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc"); // Initial sort order
  const [sortBy, setSortBy] = useState("createdAt"); 
  const [filteredUsers, setFilteredUsers] = useState({}); 
  const [skinMode, setSkinMode] = useState(""); // Define the state for skin mode


  const searchKeys= ["firstName", "lastName", "email"];

  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");

  
  
  

  useEffect(() => {
    let isMounted = true; // to handle component unmount
  
    const initializeData = async () => {
      if(! userId) {
        navigate("/signin");
        return;
      }
  
      await checkIsUserMaster();
      if (isMounted) {
        fetchTenants();
      }
    };
  
    if (isMounted) {
      initializeData();
    }
  
    return () => {
      isMounted = false;
    };
  }, [userId, navigate, isUserMaster]);
  

  const fetchUsersFromTenant = async (tenantId) => {
    if(!userId) navigate("/signin");

    const response = await fetchService.fetchTenantUsers(userId, tenantId);


    if(!response.isError()){
      const data = response.data;
      let users = {}; 
          data.users.forEach(userModel => {
            users[userModel.userId] = {
              "userId": userModel.userId,
              "firstName": userModel.firstName,
              "middleName": userModel.middleName,
              "lastName": userModel.lastName,
              "email": userModel.email,
            };
          });

          setUserDict(users);
          setFilteredUsers(users);
          setIsError(false);
          setErrorMessage("");
    } 
    else{
      handleErrorResponse(response);
    }
  }

  const checkIsUserMaster = async () => {
    const response = await fetchService.checkMasterUser(userId);
    if(!response.isError()){
      setIsError(false);
      setErrorMessage("");

      const isUserMaster = response.data.isUserMaster;
      setIsUserMaster(isUserMaster);
    }
    else{
      handleErrorResponse(response);
    }
  }


  const fetchTenants = async () => {

    let response;
    if(isUserMaster){
      response = await fetchService.fetchTenantsOfMaster(userId);
    }
    else{
      response = await fetchService.fetchTenantOfUser(userId, userId);
    }



    if(!response.isError()){
      setIsError(false);
      setErrorMessage("");
      
      let tenantsData = [];
      if(isUserMaster){
        tenantsData = response.data.tenants;
      }
      else{
        tenantsData.push(response.data.tenant);
      }
      

      setTenants(tenantsData);
    }
    else{
      handleErrorResponse(response);
    }    
   
  }


  const handleErrorResponse = (response) => {

    if(response.status === FetchStatus.RoleNotFound){
      setIsError(true);
      setErrorMessage("You do not have a role defined for this tenant. Please contact your administrator.");
      setUserDict({});
      setFilteredUsers({});
    }

    else if(response.status === FetchStatus.AccessDenied){
      setIsError(true);
      setErrorMessage("You do not have the necessary access permissions for this request in this tenant. Please contact your administrator.");
      setUserDict({});
      setFilteredUsers({});
    }

    else if(response.status === FetchStatus.ServerException){
      setIsError(true);
      setErrorMessage("A server exception has occured while processing your request. Please try again later or contact your administrator.");
      setUserDict({});
      setFilteredUsers({});
      navigate("/error/503");
    }

    else if(response.status === FetchStatus.FetchError){
      console.log("Error fetching users from tenant, ", response.message);
    }

    else if(response.status === FetchStatus.ResourceNotFound){
      navigate("/error/404");
    }
  }

  const handleSkinModeChange = (skin) => {
    setSkinMode(skin);
  };

  const handleTenantSelect = (tenantId) => {
    console.log("selected tenant id: ", tenantId);
    setSelectedTenantId(tenantId);
    setSelectedTenantName(tenants.filter(tenant => tenant.tenantId === tenantId)[0].name);
    fetchUsersFromTenant(tenantId);
  };

 
  const handleSortOrderChange = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };
  
  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    if(event.key === "Enter"){
      handleProcessSearchQuery();
    }
  };

  const handleSearchKeySelect = (key) => {
    setSelectedSearchKey(key);
    
  };

  const handleProcessSearchQuery = () => {
    console.log("Searching for:", searchQuery, "with key:", selectedSearchKey || "firstName");
    let filtered = {};
    const searchKey = selectedSearchKey || "firstName"; // Use selectedSearchKey or default to "firstName"
    const lowerCaseQuery = searchQuery.toLowerCase();

    Object.keys(userDict).forEach(userId => {
        const user = userDict[userId];
        const fieldValue = user[searchKey] ? user[searchKey].toLowerCase() : ""; // Safely handle undefined values

        if (fieldValue.includes(lowerCaseQuery)) {
            filtered[userId] = user;
        }
    });

    setFilteredUsers(filtered);
};


  const goToUserProfile = (targetUserId) => {
    console.log("going to profile with user id: ", targetUserId);
    navigate("/profile", { state: { targetUserId : targetUserId}});
  };

  const handleRowClick = (user) => {
    console.log("clicked user: ", user);
    goToUserProfile(user.userId);
  }

  const users = [
    { "img": img6, "name": "Allan Rey Palban", "position": "Senior Business Analyst" },
    { "img": img7, "name": "Adrian Moniño", "position": "UI Developer" },
    // ... (rest of the users)
  ];

  return (
    <React.Fragment>
      <HeaderMobile />
      <Header onSkin={handleSkinModeChange}/>
      <div className="main p-4 p-lg-5">
        <Row>
          <Col>
            <h2 className="main-title">User List</h2>
          </Col>
        </Row>

        {isError && (
          <Row>
            <Col>
              <Alert variant="danger">{errorMessage}</Alert>
            </Col>
          </Row>
        )}

        <Row className="mb-3">
          {/* Tenant Selector Dropdown */}
          <Col md={2}>
            <DropdownButton
              id="tenant-dropdown"
              title={selectedTenantName || `Select Tenant`}
            >
              {tenants && tenants.length > 0 ? (
                tenants.map(tenant => {
                  return <Dropdown.Item key={tenant.tenantId} onClick={() => handleTenantSelect(tenant.tenantId)}>
                    {tenant.name}
                  </Dropdown.Item>
                })
              ) : (
                <Dropdown.Item>No tenants available</Dropdown.Item>
              )}
            </DropdownButton>
          </Col>

          {/* Sort Dropdown */}
          {/* <Col md={6}>
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
          </Col> */}

        </Row>

        <Row>
          <Col>
            <InputGroup
            >
              {/* Search Input */}
              <FormControl
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearch}
                onKeyDown={handleSearch}
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


        {/* <Row className="g-2 g-xxl-3 mt-3 mb-5">
          {Object.keys(filteredUsers).map((userId) => {
            const user = filteredUsers[userId];
            return (
              <Col sm="6" md="4" key={userId} onClick={() => goToUserProfile(userId)}>
                <Card className="card-people hover-tilt-effect">
                  <Card.Body style={{color: "#e2e5ec"}}>
                    <Avatar img={user.img} size="xl" />
                    <h6 className="mt-3">
                      {user.firstName} {user.middleName} {user.lastName}
                    </h6>
                    <p>{user.email}</p>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row> */}
        <Row className="mt-3">
          <Col md={12}> 
            <DynamicTable  dataDict={userDict} onRowClick={handleRowClick}/>  
          </Col> 
        </Row>
        

      </div>
      <Footer />
    </React.Fragment>
  );
  
  
  
}