import React from "react";
import { Search } from "react-bootstrap-icons";
import {useEffect, useState} from "react";
import { Card, Nav, Modal,Form } from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import Footer from "../layouts/Footer";
import HeaderMobile from "../layouts/HeaderMobile";
import Header from "../layouts/Header";
import DynamicTable from "../components/tables/DynamicTable";
import { Link } from "react-router-dom";

import { Col, Table,Row, DropdownButton, Dropdown, Alert, FormControl, InputGroup, Button} from "react-bootstrap";
import "../scss/customStyle.scss";
import EditMasterRoleModal from "../components/modals/multitenancy/EditMasterRoleModal";
const {FetchStatus} = require("../service/FetchService");
const fetchService = require("../service/FetchService");

export default function Masters() {
 
  const [tenants, setTenants] = useState([]);
  const [isUserMaster, setIsUserMaster] = useState(false);
  const [isMastersLoaded, setIsMastersLoaded] = useState(false);
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
  const [userRole, setUserRole] = useState(""); 
  const [usersLastLogin, setUsersLastLogin] = useState({});
  const [masters, setMasters] = useState({});
  const [showEditMasterModal, setShowEditMasterModal] = useState(false);
  const [masterToEdit, setMasterToEdit] = useState(null);
  const [masterRoles, setMasterRoles] = useState([]); 
  const [activities, setActivities] = useState([]);
  const [userToEdit, setUserToEdit] = useState(null);
  const buttonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
  };
  const iconStyle = {
    marginRight: '8px', // Adjust the spacing as needed
  };
  const searchKeys= ["firstName", "lastName", "email"];

  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");
  const handleEditMasterInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setMasterToEdit(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
    }));
};
const handleEditMasterSubmit = async (event) => {
    event.preventDefault();
    const updateResponse = await fetchService.updateMaster(masterToEdit);
    if (updateResponse.status === FetchStatus.Success) {
        setMasters(prevMasters => prevMasters.map(master => 
            master.userId === masterToEdit.userId ? masterToEdit : master
        ));
        setShowEditMasterModal(false); // Close the modal after successful update
       
    } else {
        console.error("Failed to update master: ", updateResponse.message);
    }
    window.location.reload();
};


  const fetchMasterRoles = async () => {
    const fetchResponse = await fetchService.fetchMasterRoles();
    if (fetchResponse.status === FetchStatus.Success) {
        setMasterRoles(fetchResponse.data);
        console.log("master roles: ", fetchResponse.data)
    } else {
        console.error(fetchResponse.message);
    }
}
  const fetchUserRole = async () => {
    const response = await fetchService.fetchUserRoleName(userId); // Adjust this to match the actual function you have for fetching user role
    if (response && response.status === FetchStatus.Success) {
      return response.data; // Set the fetched role
    } else {
        console.error("Error fetching user role: ", response.message);
    }
};

const fetchUsersLastLogin = async () => {
    const fetchResponse = await fetchService.fetchAllUsersLastLogin();
    if (fetchResponse.status === FetchStatus.Success) {
        setUsersLastLogin(fetchResponse.data.usersLastLogin);
    } else {
        console.error(fetchResponse.message);
    }
};
const handleEditMaster = (e, userId) => {
    e.stopPropagation();
    console.log("Masters before finding:", masters);
    let foundMaster = null;
   
    // Check if 'masters' is an array
    if (Array.isArray(masters)) {
        foundMaster = masters.find(m => m.userId === userId);
    } 
    // Check if 'masters' is an object
    else if (masters && typeof masters === 'object') {
        Object.values(masters).forEach(master => {
            if (master.userId === userId) {
                foundMaster = master;
            }
        });
    }
    if (foundMaster) {
        setMasterToEdit(foundMaster);
        setShowEditMasterModal(true);
        console.log("Found master:", foundMaster);
    } else {
      console.log("masters are : ",masters)
        console.error("Master not found: ", userId); // Handle error (e.g., show alert)
    }
};

const handleDeleteMaster = (userId) => {
};

const fetchActivities = async () => {
  const fetchResponse = await fetchService.getActivities();

  if (fetchResponse.status === FetchStatus.Success) {
    const formattedLogs = fetchResponse.data.logs.map(log => {
      // Create a date object from the log's timestamp
      const date = new Date(log.activityDate);
  
      // Define options for formatting the date and time separately
      const dateOptions = { year: 'numeric', month: 'numeric', day: 'numeric' };
      const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'UTC' };
  
      // Format the date and time separately
      const formattedDate = new Intl.DateTimeFormat('en-US', dateOptions).format(date);
      const formattedTime = new Intl.DateTimeFormat('en-US', timeOptions).format(date);
  
      // Combine the formatted date and time with a space instead of a comma
      const combinedDateTime = `${formattedDate} ${formattedTime}`;
  
      return {
          ...log,
          activityDate: combinedDateTime
      };
  });
  


    setActivities(formattedLogs);

    console.log("First log date (unformatted): ", fetchResponse.data.logs[0].activityDate);
    console.log("First log date (formatted): ", formattedLogs[0].activityDate);
    console.log("All logs (formatted): ", formattedLogs);
}
 else {
      console.error("Failed to fetch activities: ", fetchResponse.message);
      // Handle fetch error (e.g., set error message, show error alert, etc.)
  }
};

  const fetchAllMasters = async () => {
    console.log("We are in fetch all masters");
    const fetchResponse = await fetchService.fetchAllMasters();
    console.log("fetch response is : ",fetchResponse.data.master)
    
    if (fetchResponse.status === FetchStatus.Success) {
      setIsMastersLoaded(true);
      setMasters(fetchResponse.data.masters.map(master => ({
        Actions: (
            <>
              <Button variant="outline-secondary" size="sm" onClick={(e) => handleEditMaster(e, master.userId)} className="me-2">
                <i className="ri-edit-2-line" style={{ color: '#17a2b8' }}></i>
              </Button>
              <Button variant="outline-secondary" size="sm" onClick={(e) => handleDeleteMaster(e, master.userId)} className="me-2">
                <i className="ri-delete-bin-line" style={{ color: '#dc3545' }}></i>
              </Button>
            </>
          ),
        email: master.email,
        SuperMaster: master.isSuperMaster,
        assignMaster: master.assignMaster,
        revokeMaster: master.revokeMaster,
        addTenant: master.addTenant,
        addMasterRole: master.addMasterRole,
        editMasterRole: master.editMasterRole,
        deleteMasterRole: master.deleteMasterRole,
        assignMasterRole: master.assignMasterRole,
        revokeMasterRole: master.revokeMasterRole,
        userId: master.userId,
        masterId:master.masterId
       
      })));
    } else {
      console.error(fetchResponse.message);
    }
  };


  useEffect(() => {
    fetchAllMasters();
    fetchActivities();
    fetchUsersLastLogin();
    fetchMasterRoles();
    let isMounted = true; // to handle component unmount
    fetchUserRole();
    const initializeData = async () => {
      if(! userId) {
        navigate("/signin");
        return;
      }
    fetchUserRole().then(userRole => {
      setUserRole(userRole); 
  });

      await checkMasterUser();
      if (isMounted) {
        fetchTenants();
      };
     
      
    };
  
    if (isMounted) {
      initializeData();
    }
  
    return () => {
      isMounted = false;
    };
  }, [userId, navigate, isUserMaster,isMastersLoaded]);
  
 
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

  const checkMasterUser = async () => {
    const response = await fetchService.checkMasterUser(userId);

    if(response.isError()) handleErrorResponse(response);
    return ! response.isError();
  }
  

  const fetchTenants = async () => {

    let response;
    if(checkMasterUser){
      response = await fetchService.fetchTenantsOfMaster(userId);
    }
    else{
      response = await fetchService.fetchTenantOfUser(userId, userId);
    }



    if(!response.isError()){
      setIsError(false);
      setErrorMessage("");
      
      let tenantsData = [];
      if(checkMasterUser){
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
    if(!targetUserId) return;
    console.log("going to profile with user id: ", targetUserId);
    navigate("/profile", { state: { targetUserId : targetUserId}});
  };

  const handleRowClick = (user) => {
    console.log("clicked user: ", user);
    goToUserProfile(user.userId);
  }


  return (
    <React.Fragment>
      <HeaderMobile />
      <Header onSkin={handleSkinModeChange}/>
      <div className="main p-4 p-lg-5 mt-5">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <ol className="breadcrumb fs-sm mb-1">
              <li className="breadcrumb-item"><Link to="#">Masters</Link></li>
            </ol>
            <h4 className="main-title mb-0">Welcome to Masters Page</h4>
          </div>
        </div>
        <Row>
        <Col md={12}>
        <Card className="card-one">
        <Card.Header>
        <Card.Title as="h2" className="d-flex justify-content-between align-items-center w-100">
        <span>Masters</span>
        
        <div className="mx-2">
                      <Button
                        className="mx-2 "
                        variant="primary"
                        style={buttonStyle}
                      >
                        <i className="ri-user-star-fill" style={iconStyle}></i>
                        <span style={{ marginRight: '2.5px' }}> Add </span>
                    
                        <span> Master</span>
                      </Button>
                    </div>
        </Card.Title>
        </Card.Header>
        <Card.Body>
        <DynamicTable dataDict={masters} onRowClick={handleRowClick} />
        </Card.Body>
        </Card>
        </Col>
        </Row>
        <br></br>
        <Row>
        <Col md={12}>
        <Card className="card-one">
        <Card.Header>
        <Card.Title as="h2" className="d-flex justify-content-between align-items-center w-100">
        <span>Activities</span>
        <div className="d-flex justify-content-center align-items-center w-12">
        <div className="form-search me-auto">
        <input type="text" className="form-control" placeholder="Search Activity" />
        <i className="ri-search-line"></i>
      </div>
        </div>
        
        </Card.Title>
        </Card.Header>
        <Card.Body>
        <DynamicTable dataDict={activities} onRowClick={handleRowClick} />
        </Card.Body>
        </Card>
        </Col>
        </Row>
       
      </div>
      <EditMasterRoleModal
    show={showEditMasterModal}
    handleClose={() => setShowEditMasterModal(false)}
    roleData={masterToEdit || {}}
    handleInputChange={handleEditMasterInputChange}
    handleSubmit={handleEditMasterSubmit}
/>
 
      
      <Footer />
    </React.Fragment>
  );
  
  
  
}