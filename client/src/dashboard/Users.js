import React from "react";
import { Link } from "react-router-dom";
import { Card, Col, Row, DropdownButton, Dropdown, Alert, FormControl, InputGroup, Button} from "react-bootstrap";
import { Search } from "react-bootstrap-icons";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import Footer from "../layouts/Footer";
import HeaderMobile from "../layouts/HeaderMobile";
import Header from "../layouts/Header";
import Avatar from "../components/Avatar";
import "../scss/customStyle.scss";
import img6 from "../assets/img/img6.jpg";
import img7 from "../assets/img/img7.jpg";

const fetchConfig = require("../config/fetchConfig.json");

const {host, port} = fetchConfig;
const fetchAddress = `http://${host}:${port}`;

// ... (rest of the image imports)

export default function Users() {
 

  const [tenantRoles, setTenantRoles] = useState({});
  const [tenantNames, setTenantNames] = useState({});
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


  const fetchUsersFromTenant = async (tenantId) => {
    if(!userId) navigate("/signin");

    console.log(`Fetching users from tenant with User ID: ${userId} & Tenant ID: ${tenantId} & Role: ${tenantRoles[tenantId]}`);

    await fetch(`${fetchAddress}/api/fetch-users`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId, 
        tenantId: tenantId,
        roleName: tenantRoles[tenantId],
      })
    }).then((response) => response.json())
      .then((data) => {
        if(data.status === "success"){
          let users = {};
          data.users.forEach(userModel => {
            console.log(userModel);
            users[userModel.userId] = {
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

          console.log("fetched users: ", userDict);
        } else if(data.status === "roleNotFound" || data.status === 505) {
          setIsError(true);
          setErrorMessage("You do not have a role defined for this tenant. Please contact your administrator.");
          setUserDict({});
          setFilteredUsers({});
        }else if(data.status === "accessDenied"){
          setIsError(true);
          setErrorMessage("You do not have the necessary access permissions for this request in this tenant. Please contact your administrator.");
          setUserDict({});
          setFilteredUsers({});
        }
        else if(data.status === 503){
          setIsError(true);
          setErrorMessage("A server exception has occured while processing your request. Please try again later or contact your administrator.");
          setUserDict({});
          setFilteredUsers({});
        }

      })
      .catch(error => {
        console.log("Error fetching users from tenant, ", error);
        navigate("/error/503");
      });
  }

  const fetchTenantRoles = async () => {
     await fetch(`${fetchAddress}/api/fetch-tenant-roles`, {
        method: "post",
        body: JSON.stringify({
          "userId": userId
        }),
        headers: {
          "Content-Type": "application/json",
        }
    }).then((response) => response.json())
        .then((data) => {
            if(data.status === "success"){
              setIsError(false);
              setErrorMessage("");
              let tenantRoles = {};
              let tenantNames= {};

              data.tenantRoles.forEach(tenantRole => {
                tenantRoles[tenantRole.tenantId] = tenantRole.roleName;
              });


              Object.keys(data.tenantNames).forEach(tenantId => {
                tenantNames[tenantId] = data.tenantNames[tenantId];
              }); 

              setTenantNames(tenantNames);
              setTenantRoles(tenantRoles);

              console.log("tenant names: ", data.tenantNames);
              console.log("Tenant roles: ", tenantRoles);
            }
            if(data.status === 404){
              setIsError(true);
              setErrorMessage("You are not registered to any tenants. Please contact your administrator.");
          }
            if(data.status === 500){
              navigate("/error/500");
            }
        })
        .catch(error => { 
          console.error("Error fetching Tenant Roles from the server: ", error);
          navigate("/error/503");
        });
  }

  const handleSkinModeChange = (skin) => {
    setSkinMode(skin);
    // You can add any other logic you need here for handling skin mode changes
  };

  const handleTenantSelect = (tenantId) => {
    setSelectedTenantId(tenantId);
    setSelectedTenantName(tenantNames[tenantId]);
    fetchUsersFromTenant(tenantId);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
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


  const goToUserProfile = async (targetUserId) => {
    const senderUserId = localStorage.getItem("userId"); 
    const tenantId = selectedTenantId; 
  
    const requestData = {
      senderUserId: senderUserId,
      targetUserId: targetUserId,
      tenantId: tenantId,
    };
  
    await fetch(`${fetchAddress}/api/go-to-user-profile`, {
      method: "post",
      body: JSON.stringify(requestData),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          navigate(`/profile?userId=${targetUserId}`);
        } else {
        }
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  };

  useEffect(() => {
    if(! userId) navigate("/signin");
    fetchTenantRoles();
  }, [userId, navigate]);

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
              title={ selectedTenantName || `Select Tenant`}
            >
              {Object.entries(tenantRoles).map(([tenantId, role]) => (
                <Dropdown.Item key={tenantId} onClick={() => handleTenantSelect(tenantId)}>
                  {tenantNames[tenantId]}
                </Dropdown.Item>
              ))}
            </DropdownButton>
          </Col>

          {/* Sort Dropdown */}
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
        <Row className="g-2 g-xxl-3 mt-3 mb-5">
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
        </Row>
      </div>
      <Footer />
    </React.Fragment>
  );
  
  
  
}