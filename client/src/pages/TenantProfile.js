import React, { useState, useEffect } from "react";
import { Card, Col, Row, Nav, Modal, Button, Form } from "react-bootstrap";
import { useNavigate, Link, useLocation } from "react-router-dom";
import HeaderMobile from "../layouts/HeaderMobile";
import Header from "../layouts/Header";
import "../scss/customStyle.scss";
import DynamicTable from "../components/tables/DynamicTable";
import EditTenantRoleModal from "../components/modals/multitenancy/EditTenantRoleModal";
import EditUserModal from "../components/modals/multitenancy/EditUserModal";
import AddUserModal from "../components/modals/multitenancy/AddUserModal";
import EditTenantModal from "../components/modals/multitenancy/EditTenantModal";
import DeleteUserModal from "../components/modals/multitenancy/RemoveUserFromTenantModal";

const { FetchStatus } = require("../service/FetchService");
const fetchService = require("../service/FetchService");
const DateFormatter = require("../utility/DateFormatter");

export default function TenantProfile() {
  const [tenantRoles, setTenantRoles] = useState([]);
  const [tenantRolesDict, setTenantRolesDict] = useState({});
  const [tenantData, setTenantData] = useState({});
  const [tenantUsers, setTenantUsers] = useState([]);
  const [tenantUsersDict, setTenantUsersDict] = useState({});
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddTenantRoleModal, setShowAddTenantRoleModal] = useState(false);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [showUserEditModal, setShowUserEditModal] = useState(false);
  const [showEditTenantRoleModal, setShowEditTenantRoleModal] = useState(false);
  const [showEditTenantModal, setShowEditTenantModal] = useState(false);
  const [tenantToEdit, setTenantToEdit] = useState({ name: '', description: '' });
  const [userIdToDelete, setUserIdToDelete] = useState(null);
  const [tenantRoleIdToDelete, setTenantRoleIdToDelete] = useState(null);
  const [userToEdit, setUserToEdit] = useState(null);
  const [tenantRoleToEdit, setTenantRoleToEdit] = useState({roleName: ''});
  const [selectedTenantRoleName, setSelectedTenantRoleName] = useState("");
  const [userRoleToEdit, setUserRoleToEdit] = useState("");
  const [newUserData, setNewUserData] = useState({
    fullName: "",
    email: "",
    password: "",
    roleName:"",
  });
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem("userId");
  const tenantId = location.state?.tenantId;
  const buttonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
  };
  const iconStyle = {
    marginRight: '8px', // Adjust the spacing as needed
  };

  const fetchTenantUsers = async () => {
    const userResponse = await fetchService.fetchTenantUsers(userId, tenantId);
  
    if (!userResponse.isError()) {
      const usersWithRoles = await Promise.all(userResponse.data.users.map(async (user) => {
        const roleResponse = await fetchService.fetchUserRole(tenantId, user.userId);
        return {
          ...user,
          roleName: roleResponse.isError() ? 'Role not found' : roleResponse.data.roleName
        };
      }));
      setTenantUsers(usersWithRoles);
    } else {
      handleErrorResponse(userResponse);
    }
  };

  const fetchTenantRoles = async () => {
    if (!userId || !tenantData || !tenantData.tenantId) {
      console.log("failed to fetch tenant roles due to missing information");
      return;
    }
    const response = await fetchService.fetchTenantRolesOfTenant(userId, tenantData.tenantId);

    if (!response.isError()) {
      setTenantRoles(response.data.tenantRoles);
    }
    else {
      handleErrorResponse(response);
    }
  }

  const fetchTenantProfile = async () => {
    const response = await fetchService.fetchTenantProfile(userId, tenantId);

    if (!response.isError()) {
      setTenantData(response.data.tenant);
    } else {
      handleErrorResponse(response);
    }
  };
 
  useEffect(() => {
    if (!userId) {
      navigate("/signin");
      return;
    }
    if (!tenantId) {
      navigate("/dashboard/tenants");
      return;
    }
    if (!tenantData) {
      navigate("/error/404");
    }

    fetchTenantProfile();
    fetchTenantUsers();

  }, [location.state, navigate, tenantId, userId]);

  useEffect(() => {
    
    setTenantUsersDict(
      addUtilityModalsToTenantUsersDict(
        transformTenantUsersData(tenantUsers))
    );

  }, [tenantUsers]);

  useEffect(() => {
    setTenantRolesDict(
      addUtilityModalsToTenantRolesDict(
        tenantRoles
      )
    );
  }, [tenantRoles]);

  useEffect(() => {
    fetchTenantRoles();
  }, [tenantData]);



  const addUtilityModalsToTenantUsersDict = (tenantUsersDict) => {
    const modifiedTenantUsersDict = Object.values(tenantUsersDict).map((user, index) => ({
      "": (
        <>
          <Button variant="outline-secondary" size="sm" onClick={(e) => handleEditUser(e, user.userId)} className="me-2">
            <i className="ri-edit-2-line" style={{ color: '#17a2b8' }}></i>
          </Button>
          <Button variant="outline-secondary" size="sm" onClick={(e) => {
            e.stopPropagation();
            setUserIdToDelete(user.userId);
            setShowDeleteUserModal(true);

          }} className="me-2">
            <i className="ri-delete-bin-line" style={{ color: '#dc3545' }}></i>
          </Button>
        </>
      ),
      ...tenantUsersDict[index]
    }));
    return modifiedTenantUsersDict;
  } 

  const addUtilityModalsToTenantRolesDict = (tenantRolesDict) => {
    const modifiedTenantRolesDict = Object.values(tenantRolesDict).map((tenantRole, index) => ({
      "": (
        <>
          <Button variant="outline-secondary" size="sm" onClick={(e) => handleEditTenantRole(e, tenantRole.tenantRoleId)} className="me-2">
            <i className="ri-edit-2-line" style={{ color: '#17a2b8' }}></i>
          </Button>
          <Button variant="outline-secondary" size="sm" onClick={(e) => {
            e.stopPropagation();
            setTenantRoleIdToDelete(tenantRole.tenantRoleId);
            setShowDeleteUserModal(true);
          }} className="me-2">
            <i className="ri-delete-bin-line" style={{ color: '#dc3545' }}></i>
          </Button>
        </>
      ),
      ...tenantRolesDict[index]
    }));
    return modifiedTenantRolesDict;
  } 


  const handleErrorResponse = (response) => {
    if (response.status === FetchStatus.AccessDenied) {
      navigate("/error/505");
    } else if (response.status === FetchStatus.TenantNotFound) {
      navigate("/error/404");
    } else if (response.status === FetchStatus.ServerException) {
      navigate("/error/500");
    } else if (response.status === FetchStatus.FetchError) {
      console.log("Error while fetching tenant profile: ", response.message);
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setShowUserEditModal(false);
    setUserToEdit(null); // Reset editing user after submission
  };

  const handleEditTenantInputChange = (event) => {
    const { name, value } = event.target;
    setTenantToEdit({ ...tenantToEdit, [name]: value });
  };

  const handleEditTenantRoleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    if (type === 'checkbox') {
      setTenantRoleToEdit(prevState => ({
        ...prevState,
        [name]: checked
      }));
    } else {
      setTenantRoleToEdit(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };
  

  const handleEditUserInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "roleName") {
      setUserRoleToEdit(value);
    }
    else if(name === "fullName"){
      const names = value.split(" ");
      const firstName = names[0];
      const middleName = names.length > 2 ? names.slice(1, -1).join(' ') : "";
      const lastName = names[names.length - 1];
      console.log(`names: fn:${firstName} mn:${middleName} ln:${lastName}`);
      setUserToEdit(prevState => ({
        ...prevState,
        firstName: firstName,
        middleName: middleName,
        lastName: lastName,
      }));
    }
    else {
      setUserToEdit(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const handleEditTenantSubmit = async (event) => {
    event.preventDefault();
    const updatedTenantData = {
      name:tenantToEdit.name
    }
    const response = await fetchService.updateTenant(userId, tenantId, updatedTenantData);
    if (response.status === FetchStatus.Success) {
      console.log('Tenant updated successfully:', response.data);
      setTenantData(response.data);
      setShowEditTenantModal(false);
      fetchTenantProfile();
      fetchTenantUsers();
    } else {
      window.location.reload();
      console.error('Error updating tenant:', response.message);
    }
  };

  const handleEditTenantRoleSubmit = async (event) => {
    event.preventDefault();
    const response = await fetchService.updateTenantRole(userId, tenantRoleToEdit.tenantRoleId, tenantRoleToEdit);
    if (!response.isError()) {
      console.log('Tenant role updated successfully:', response.data);
      setShowEditTenantModal(false);
      window.location.reload();
      fetchTenantRoles();
    } else {
      handleErrorResponse(response);
    }
  }
  

  const handleEditUser = async (e, userId) => {
    e.stopPropagation();
    const response = await fetchService.fetchUserProfile(userId, userId);
    
    if (! response.isError()) {
      setUserToEdit(response.data.user);
      setUserRoleToEdit(response.data.user.roleName)
      setShowUserEditModal(true);
    }
    else{
      handleErrorResponse(response);
    }
  };

  const handleEditTenantRole = async (e, tenantRoleId) => {
    e.stopPropagation();
    const selectedRole = tenantRoles.find(tenantRole => tenantRole.tenantRoleId === tenantRoleId);
    if (selectedRole) {
      setTenantRoleToEdit(selectedRole);
      setShowEditTenantRoleModal(true);
    }
  }

  const goToUserProfile = (targetUserId) => {
    if(!targetUserId) return;
    console.log("going to profile with user id: ", targetUserId);
    navigate("/profile", { state: { targetUserId : targetUserId}});
  };

  const handleUserRowClick = (rowData) => {
    goToUserProfile(rowData?.userId);
  };

  const handleRoleRowClick = (rowData) => {
    
  };

  const handleEditUserSubmit = async (event) => {
    event.preventDefault();
  
    // Construct updatedUserData with correct property names as expected by backend
    const updatedUserData = {
      ...userToEdit,
      roleName: userRoleToEdit, // change to the correct property name if it's not `roleName`
    };
  
    // Send the update request
    const response = await fetchService.updateUser(userId, userToEdit.userId, updatedUserData);
    
    if (response.status === FetchStatus.Success) {
      console.log("Response successfully received: ", response);
      setShowUserEditModal(false);
      fetchTenantUsers();
    } else {
      console.error('Error updating user:', response.message,'Response:', response);
    }
  };

  const handleAddUserInputChange = (event) => {
    const { name, value } = event.target;
    setNewUserData({ ...newUserData, [name]: value });
    console.log("new user data: ", { ...newUserData, [name]: value });
    if (name === "tenantRoleId") setSelectedTenantRoleName(event.target.value);
  };

  const handleCloseDeleteUserModal = () => setShowDeleteUserModal(false);
  const handleCloseUserEditModal = () => setShowUserEditModal(false);
  const handleShowAddUserModal = () => setShowAddUserModal(true);
  const handleCloseAddUserModal = () => setShowAddUserModal(false);
  const handleShowEditTenantModal = () => setShowEditTenantModal(true);
  const handleCloseEditTenantModal = () => setShowEditTenantModal(false);
  const handleCloseEditTenantRoleModal = () => setShowEditTenantRoleModal(false);

  

  const handleDeleteUser = async () => {
    if (userIdToDelete) {
      console.log("Deleting user with ID : ", userIdToDelete);

      const response = await fetchService.removeUserFromTenant(userId, tenantId, userIdToDelete);

      if (!response.isError()) {
        window.location.reload();
      }
      else {
        console.error("ERROR Deleting from Tenants: ", response.message);
        handleErrorResponse(response);
      }

      setShowDeleteUserModal(false);
      setUserIdToDelete(null);
    }
  };

  const handleSubmitNewUser = async (event) => {
    event.preventDefault();
    if (newUserData.password !== newUserData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (!newUserData.tenantRoleId || newUserData.tenantRoleId === 0) {
      alert('Select a Tenant Role');
      return;
    }
    const names = newUserData.fullName.split(" ");
    const firstName = names[0];
    const middleName = names.length > 2 ? names.slice(1, -1).join(' ') : "";
    const lastName = names[names.length - 1];

    try {
      const response = await fetchService.registerUser({
        email: newUserData.email,
        password: newUserData.password,
        firstName: firstName,
        middleName: middleName,
        lastName: lastName,
        tenantId: tenantId,
        tenantRoleId: newUserData.tenantRoleId
      });

      if (response.status === "success") {
        console.log("User registered successfully: ", response);
        handleCloseAddUserModal();
        window.location.reload();
      } else {
        console.log("User registration failed: ", response.message);
        // Handle user exists or other errors
      }
    } catch (error) {
      console.error("Registration Error: ", error);
      // Handle network or server errors
    }

    handleCloseAddUserModal();
  };

  const transformTenantUsersData = (data) => {
    const transformedData = {};

    if (data && Array.isArray(data)) {
      data.forEach((item, index) => {
        transformedData[index] = {
          firstName: item.firstName,
          lastName: item.lastName,
          email: item.email,
          userId: item.userId,
          roleName:item.roleName
        };
      });
    }

    return transformedData;
  };

  return (
    <React.Fragment>
      <HeaderMobile />
      <Header /* ...props */ />

      <div className="main p-4 p-lg-5 mt-5">
        <div className="d-md-flex align-items-center justify-content-between mb-3">
          <div>
            <ol className="breadcrumb fs-sm mb-1">
              <li className="breadcrumb-item active">Dashboard</li>
              <li className="breadcrumb-item active" aria-current="page">Tenants</li>
              <li className="breadcrumb-item active" aria-current="page"><Link to="#"> Tenant Profile </Link> </li>
            </ol>
            <h4 className="main-title mb-0">Welcome to Tenant Profile</h4>
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

        <Row className="mb-3">
          <Col md={12} lg={12}>
            <Card className="card-one">
              <Card.Header>
                <Card.Title as="h6" className="d-flex align-items-center justify-content-between w-100">
                    <span>
                        {tenantData.name}
                    </span>
                      
                    <div className="d-flex justify-content-center align-items-center ms-3 w-10">
                      <Button
                        className="w-100 d-flex justify-content-start align-items-center"
                        variant="outline-info"
                        onClick={handleShowEditTenantModal}
                        style={buttonStyle}
                      >
                        <i className="ri-pencil-fill" style={iconStyle}></i>
                        <span className="ms-3">Edit</span>
                      </Button>
                    </div>

                </Card.Title>

                <Nav className="nav-icon nav-icon-sm ms-auto">
                  {/* Icons or links can be added here if needed */}
                </Nav>
              </Card.Header>
              <Card.Body className="p-3">

                {tenantData ? (
                  <Row className="tenant-info">

                    <Col md={3} sm={3}>
                      <Card>
                        <Card.Header>
                          <Card.Title as="h6" className="card-value centered-card-value">
                            ID
                          </Card.Title>
                        </Card.Header>
                        <Card.Body className="card-value centered-card-value">
                          <i class="ri-hashtag"></i> {tenantData.tenantId}
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col md={3} sm={3}>
                      <Card>
                        <Card.Header>
                          <Card.Title as="h6" className="card-value centered-card-value">
                            User Count
                          </Card.Title>
                        </Card.Header>
                        <Card.Body className="card-value centered-card-value">
                          <i class="ri-group-line"></i> {tenantData.userCount}
                        </Card.Body>
                      </Card>

                    </Col>

                    <Col md={3} sm={3}>
                      <Card>
                        <Card.Header>
                          <Card.Title as="h6" className="card-value centered-card-value">
                            Created Date
                          </Card.Title>
                        </Card.Header>
                        <Card.Body className="card-value centered-card-value">
                          <i class="ri-calendar-check-line"></i> {DateFormatter.formatDate(tenantData.createdAt)}
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col md={3} sm={3}>
                      <Card>
                        <Card.Header>
                          <Card.Title as="h6" className="card-value centered-card-value">
                            Last Update
                          </Card.Title>
                        </Card.Header>
                        <Card.Body className="card-value centered-card-value">
                          <i class="ri-refresh-line"></i> {DateFormatter.formatDateWithTime(tenantData.updatedAt)}
                        </Card.Body>
                      </Card>
                    </Col>

                  </Row>
                ) : (
                  <p>Loading tenant data...</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* DynamicTable for Tenant Users */}

        <Row>
          <Col md={12}>
            <Card className="card-one">
              <Card.Header>
                <Card.Title as="h2" className="d-flex justify-content-between align-items-center w-100">
                  <span>Users</span>
                  <div className="d-flex justify-content-center align-items-center w-10">
                      <Button
                        className="w-100 d-flex justify-content-start align-items-center"
                        variant="primary"
                        onClick={handleShowAddUserModal}
                        style={buttonStyle}
                      >
                        <i className="ri-user-add-fill" style={iconStyle}></i>
                        <span>Add User</span>
                      </Button>
                    </div>
                </Card.Title>
              </Card.Header>
              
              <Card.Body>
                <DynamicTable dataDict={tenantUsersDict} onRowClick={handleUserRowClick} />
              </Card.Body>
              
            </Card>
          </Col>
        </Row>
        

        {/* DynamicTable for Tenant Roles */}

        <Row className="mt-3">
          <Col md={12}>
            <Card className="card-one">
              <Card.Header>
                <Card.Title as="h2" className=" d-flex justify-content-between align-items-center w-100">
                  <span>Roles</span>
                  <div className="d-flex justify-content-center align-items-center w-10">
                      <Button
                        className="w-100 d-flex justify-content-start align-items-center"
                        variant="primary"
                        onClick={handleShowAddUserModal}
                        style={buttonStyle}
                      >
                        <i className="ri-user-add-fill" style={iconStyle}></i>
                        <span>Add Role</span>
                      </Button>
                    </div>
                </Card.Title>
              </Card.Header>
              
              <Card.Body>
                <DynamicTable dataDict={tenantRolesDict} onRowClick={handleRoleRowClick} />
              </Card.Body>
              
            </Card>
          </Col>
        </Row>


        {/* MODALS */}

        <AddUserModal 
          show={showAddUserModal}
          handleClose={handleCloseAddUserModal}
          handleInputChange={handleAddUserInputChange}
          handleSubmit={handleSubmitNewUser}
          tenantRoles={tenantRoles}
        />

        <DeleteUserModal
          show={showDeleteUserModal}
          handleClose={handleCloseDeleteUserModal}
          handleDeleteUser={handleDeleteUser}
        />

        <EditUserModal
          show={showUserEditModal}
          handleClose={handleCloseUserEditModal}
          userData={userToEdit}
          handleInputChange={handleEditUserInputChange}
          handleSubmit={handleEditUserSubmit}
          tenantRoles={tenantRoles}
        />
        
        <EditTenantModal 
          show={showEditTenantModal}
          handleClose={handleCloseEditTenantModal}
          handleInputChange={handleEditTenantInputChange}
          handleSubmit ={handleEditTenantSubmit}
          tenantData ={tenantToEdit}  
        />

        <EditTenantRoleModal 
          show = {showEditTenantRoleModal}
          handleClose = {handleCloseEditTenantRoleModal}
          roleData = {tenantRoleToEdit}
          handleInputChange = {handleEditTenantRoleInputChange}
          handleSubmit = {handleEditTenantRoleSubmit}/>
      </div>


    </React.Fragment>
  );
}
