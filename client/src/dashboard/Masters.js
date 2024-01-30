import React from "react";
import { Search } from "react-bootstrap-icons";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import Footer from "../layouts/Footer";
import HeaderMobile from "../layouts/HeaderMobile";
import Header from "../layouts/Header";
import DynamicTable from "../components/tables/DynamicTable";
import { Link } from "react-router-dom";
import { Col, Table,Row, DropdownButton, Dropdown, Alert, FormControl, InputGroup, Button} from "react-bootstrap";
import "../scss/customStyle.scss";
const {FetchStatus} = require("../service/FetchService");
const fetchService = require("../service/FetchService");

export default function Masters() {
 
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
  const [userRole, setUserRole] = useState(""); 
  const [usersLastLogin, setUsersLastLogin] = useState({});
  const [masters, setMasters] = useState({});

  const searchKeys= ["firstName", "lastName", "email"];

  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");

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
const fetchAllMasters = async () => {
    const fetchResponse = await fetchService.fetchAllMasters();
    if (fetchResponse.status === FetchStatus.Success) {
        console.log(fetchResponse.data.masters)
        setMasters(fetchResponse.data.masters.map(master => ({
            email: master.email,
            SuperMaster: master.isSuperMaster,
           assignMaster: master.assignMaster,
           revokeMaster: master.revokeMaster,
           addTenant: master.addTenant,
           addMasterRole: master.addMasterRole,
           editMasterRole: master.editMasterRole,
           deleteMasterRole: master.deleteMasterRole,
           assignMasterRole: master.assignMasterRole,
           revokeMasterRole: master.revokeMasterRole
        })));
       
    } else {
        console.error(fetchResponse.message);
    }
};


  useEffect(() => {
    fetchAllMasters();
    fetchUsersLastLogin();
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
            <DynamicTable dataDict={masters} onRowClick={handleRowClick}/>  
          </Col> 
        </Row>
        <Row>
          <Col md={12}> 
            <DynamicTable dataDict={usersLastLogin} onRowClick={handleRowClick}/>  
          </Col> 
        </Row>
      </div>
      
      <Footer />
    </React.Fragment>
  );
  
  
  
}