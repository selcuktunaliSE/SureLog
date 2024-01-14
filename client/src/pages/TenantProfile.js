import React, { useState, useEffect } from "react";
import { Card, Col, Row, Nav,ListGroup,Modal,Button,Form } from "react-bootstrap";
import { useNavigate,Link ,useLocation } from "react-router-dom";
import Footer from "../layouts/Footer";
import HeaderMobile from "../layouts/HeaderMobile";
import Header from "../layouts/Header";
import "../scss/customStyle.scss";
import DynamicTable from "../components/DynamicTable";


const { FetchStatus } = require("../service/FetchService");
const fetchService = require("../service/FetchService");

export default function TenantProfile() {
  const [userData, setUserData] = useState(null);
  const [tenantData, setTenantData] = useState({});
  const [tenantUsers, setTenantUsers] = useState([]);
  const [tenantUsersDict, setTenantUsersDict] = useState({});
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showEditModal,setShowEditModal] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null);
  const [editingUser, setEditingUser] = useState(null); 
  const [newUserData,setNewUserData] = useState({
    fullName:"",
    email:"",
    password:"",
    roleName:""
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
  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setShowEditModal(false);
    setEditingUser(null); // Reset editing user after submission
  };
  
  const fetchTenantUsers = async () => {
    const response = await fetchService.fetchTenantUsers(userId, tenantId);
    console.log("API RESPONSE FOR TENANT USERS: ", response);

    if (!response.isError()) {
      console.log("response tenant users: ", response.data.users);
      setTenantUsers(response.data.users);
    } else {
      handleErrorResponse(response);
    } 
  };

  const fetchTenantProfile = async () => {
    const response = await fetchService.fetchTenantProfile(userId, tenantId);

    if (!response.isError()) {
      console.log("response data: ", response.data.tenant);
      setTenantData(response.data.tenant);
      console.log("tenant data: ", tenantData);
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
    console.log("tenant users: ", tenantUsers);
  
    setTenantUsersDict(
      addExtraInformationToTenantUsers(
        transformTenantUsersData(tenantUsers))
      );

  }, [tenantUsers]);
  
  const addExtraInformationToTenantUsers = (tenantUsersDict) => {
    const modifiedTenantUsersDict = Object.values(tenantData).map((user, index) => ({
      ...tenantUsersDict[index], 
      Edit: (
        <>
          <Button variant="outline-secondary" size="sm" onClick={() => handleEditUser(user.userId)} className="me-2">
            <i className="ri-edit-2-line" style={{ color: '#17a2b8' }}></i>
          </Button>
          <Button variant="outline-secondary" size="sm" onClick={() => {
            console.log("Delete Button Clicked for User ID:", user.userId);
            handleDeleteUser(user.userId);
          }} className="me-2">
            <i className="ri-delete-bin-line" style={{ color: '#dc3545' }}></i>
          </Button>
        </>
      )
    }));
    console.log("modified tenant users dict: ", modifiedTenantUsersDict);
    return modifiedTenantUsersDict;
  }
  

  const updatedTenantUsersDict  = tenantUsers.reduce((acc, user, index) => {
    acc[index] = {
      ...user,
      Edit: (
        <>
        <Button variant="outline-secondary" size="sm" onClick={() => handleEditUser(user.Id)} className="me-2">
          <i className="ri-edit-2-line" style={{ color: '#17a2b8' }}></i> {/* Adjust the color as needed */}
        </Button>
        <Button variant="outline-secondary" size="sm" onClick={() => {
        console.log("Delete Button Clicked for User ID:", user.Id);
        handleDeleteUser(user.Id);
      }} className="me-2">
        <i className="ri-delete-bin-line" style={{ color: '#dc3545' }}></i>
      </Button>
      </>
    )
  };
    return acc;
  }, {});
 

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


  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const offset = date.getTimezoneOffset() * 60000; 
    const localTime = new Date(date.getTime() - offset - 3* 3600000); // Minus 6 hours for UTC+3
  
    const day = localTime.getDate().toString().padStart(2, '0');
    const month = (localTime.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
    const year = localTime.getFullYear();
  
    return `${day}.${month}.${year}`;
  };
  
  const formatDateWithTime = (dateStr) => {
   
    const date = new Date(dateStr);
    const offset = date.getTimezoneOffset() * 60000; 
    const localTime = new Date(date.getTime() - offset - 3 * 3600000); 
  
    const day = localTime.getDate().toString().padStart(2, '0');
    const month = (localTime.getMonth() + 1).toString().padStart(2, '0'); 
    const year = localTime.getFullYear();
    const hours = localTime.getHours().toString().padStart(2, '0');
    const minutes = localTime.getMinutes().toString().padStart(2, '0');
  
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingUser(prevState => ({
      ...prevState,
      [name]: value
    }));
  };


  const tenantUsersDict = tenantUsers.reduce((acc, user, index) => {
    acc[index] = {
      ...user,
      Edit: (
        <>
        <Button variant="outline-secondary" size="sm" onClick={() => handleEditUser(user.Id)} className="me-2">
          <i className="ri-edit-2-line" style={{ color: '#17a2b8' }}></i> {/* Adjust the color as needed */}
        </Button>
        <Button variant="outline-secondary" size="sm" onClick={() => {
          setUserIdToDelete(user.Id);
          setShowConfirmationModal(true);
      }} className="me-2">
        <i className="ri-delete-bin-line" style={{ color: '#dc3545' }}></i>
        </Button>
      </>
    )
  };
    return acc;
  }, {});

  const handleEditUser = async(userId)=>  {
    try{
      console.log("Editing UserId : ",userId);
      const response = await fetchService.fetchUserProfile(userId,userId);
      if(response){
        console.log("Responsexxxx : ",response.data.user)
        setEditingUser(response.data.user);
        setShowEditModal(true);
      }
    
    }
   catch(error){

   }

  };
  
  const handleRowClick = (rowData) => {
    console.log("Row clicked:", rowData);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewUserData({ ...newUserData, [name]: value });
  };

  const handleCloseConfirmationModal = () => setShowConfirmationModal(false);
  const handleCloseShowEditModal = () => setShowEditModal(false);
  const handleShowAddUserModal = () => setShowAddUserModal(true);
  const handleCloseAddUserModal = () => setShowAddUserModal(false);
  const handleDeleteUser = async () => {
    if(userIdToDelete){
      console.log("Deleting user with ID : ",userIdToDelete);
    
    const response = await fetchService.deleteUserFromTenant(tenantId, userIdToDelete);
    if (response.status === "success") {
        console.log(response.message);
        window.location.reload();
    } else {
        console.error("Deleting from Tenants: ",response.message);
    }
    setShowConfirmationModal(false);
    setUserIdToDelete(null);
  }
  };

  
  const handleSubmitNewUser = async (event) => {
    event.preventDefault();
    if (newUserData.password !== newUserData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    const names = newUserData.fullName.split(" ");
    const firstName = names[0];
    const lastName = names.slice(1).join(" ");
    try {
      const response = await fetchService.registerUser({
        email: newUserData.email,
        password: newUserData.password,
        firstName: firstName,
        middleName: '', // Assuming you don't have a middleName input
        lastName: lastName,
        tenantId: tenantId,
        roleName: newUserData.roleName
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
  
    if (Array.isArray(data)) {
      data.forEach((item, index) => {
        transformedData[index] = {
          firstName: item.firstName,
          lastName: item.lastName,
          email: item.email,
          userId: item.userId, // Add any additional fields you need
        };
      });
    }

    console.log("transformed tenant data: ", transformedData);
  
    return transformedData;
  };

  return (
    <React.Fragment>
      <HeaderMobile />
      <Header /* ...props */ />
      
      <div className="main p-4 p-lg-5 mt-5">
      <div className="d-md-flex align-items-center justify-content-between mb-4">
          <div>
            <ol className="breadcrumb fs-sm mb-1">
              <li className="breadcrumb-item"><Link to="#">Dashboard</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Tenants</li>
              <li className="breadcrumb-item active" aria-current="page">Tenant Profile</li>
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
        
        
        <Row >
        <Col md={6} lg={6}>
    <Card className="card-one">
        <Card.Header>
            <Card.Title as="h6" >Tenant Information</Card.Title>
            <Nav className="nav-icon nav-icon-sm ms-auto">
                {/* Icons or links can be added here if needed */}
            </Nav>
        </Card.Header>
        <Card.Body className="p-3">
            {tenantData ? (
                <div> {/* Apply text-center here */}
                    <h5 className="card-value mb-1 ls--1">Name: {tenantData.name}</h5>
                    <hr />
                    <h5 className="card-value mb-1 ls--1">ID: {tenantData.tenantId}</h5>
                    <hr />
                    <h5 className="card-value mb-1 ls--1">User Count: {tenantData.userCount}</h5>
                    <hr />
                    <h5 className="card-value mb-1 ls--1">Created: {formatDate(tenantData.createdAt)}</h5>
                    <hr />
                    <h5 className="card-value mb-1 ls--1">Last Update: {formatDateWithTime(tenantData.updatedAt)}</h5>
                </div>
            ) : (
                <p>Loading tenant data...</p>
            )}
        </Card.Body>
     </Card>
          </Col>
          <Col md={6} lg={6}>
          <Card className="card-one">
        <Card.Header>
            <Card.Title as="h6" >Tenant Information</Card.Title>
            <Nav className="nav-icon nav-icon-sm ms-auto">
                {/* Icons or links can be added here if needed */}
            </Nav>
        </Card.Header>
        <Card.Body className="p-3">
            {tenantData ? (
                <div> {/* Apply text-center here */}
                    <h5 className="card-value mb-1 ls--1">Name: {tenantData.name}</h5>
                    <hr />
                    <h5 className="card-value mb-1 ls--1">ID: {tenantData.tenantId}</h5>
                    <hr />
                    <h5 className="card-value mb-1 ls--1">User Count: {tenantData.userCount}</h5>
                    <hr />
                    <h5 className="card-value mb-1 ls--1">Created: {formatDate(tenantData.createdAt)}</h5>
                    <hr />
                    <h5 className="card-value mb-1 ls--1">Last Update: {formatDateWithTime(tenantData.updatedAt)}</h5>
                </div>
            ) : (
                <p>Loading tenant data...</p>
            )}
        </Card.Body>
     </Card>
          </Col>
            
</Row>
<br></br>
        
        
        
        
       
        {/* DynamicTable for tenantUsers */}
       
        <Row className="justify-content-center">
          <Col md={8}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3>Users</h3>
              <Button 
              variant="primary" 
              onClick={handleShowAddUserModal} 
              style={buttonStyle}
              >
              <i className="ri-user-add-fill" style={iconStyle}></i>
              <span>Add User</span>
            </Button>
            </div>

            <DynamicTable dataDict={tenantUsersDict} onRowClick={handleRowClick} />
          
          </Col>
        </Row>
        <Modal show={showAddUserModal} onHide={handleCloseAddUserModal}>
          <Modal.Header closeButton>
            <Modal.Title>Add New User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmitNewUser}>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  autoComplete="off"
                  placeholder="User Name"
                  name="fullName"
                  value={newUserData.fullName}
                  onChange={handleInputChange}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  name="email"
                  value={newUserData.email}
                  onChange={handleInputChange}
                />
              </Form.Group>
            
              <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                name="password"
                value={newUserData.password}
                onChange={handleInputChange}
              />
              </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password(Confirm)</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm password"
                name="confirmPassword"
                value={newUserData.confirmPassword}
                onChange={handleInputChange}
              />
             </Form.Group>
         
              <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
                <Form.Select 
                  type="text"
                  name="roleName" 
                  value={newUserData.roleName} 
                  onChange={handleInputChange}
                >
                  <option value="Admin">Admin</option>
                  <option value="User">User</option>
                </Form.Select>
              </Form.Group>
              <div className="text-end">
              <Button variant="primary" type="submit">
                Save 
              </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
        <Modal show={showConfirmationModal} onHide={handleCloseConfirmationModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this user?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseConfirmationModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteUser}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showEditModal} onHide={handleCloseShowEditModal}>
  <Modal.Header closeButton>
    <Modal.Title>Edit User</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {editingUser && (
      <Form onSubmit={handleFormSubmit}>
        {/* Name */}
        <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control 
            type="text"
            name="name" // Ensure this matches the property in the editingUser object
           placeholder=  {`${editingUser.firstName || ''} ${editingUser.lastName || ''}`.trim()}
            value={editingUser.name || ''} // Use || '' to prevent controlled-uncontrolled warning
            onChange={handleEditInputChange}
          />
        </Form.Group>

        {/* Email */}
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control 
            type="email"
            name="email" // Ensure this matches the property in the editingUser object
            placeholder={editingUser.Email} 
            value={editingUser.email || ''}
            onChange={handleEditInputChange}
          />
        </Form.Group>

        {/* Password */}
        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control 
            type="text" 
            placeholder="Enter new password" 
            value={ '' || editingUser.password } 
            onChange={handleEditInputChange}
          />
        </Form.Group>
         {/* RoleName */}
             <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
                <Form.Select 
                  type="text"
                  name="rolename" 
                  onChange={handleEditInputChange}
                >
                  <option value="Admin">Admin</option>
                  <option value="User">User</option>
                </Form.Select>
              </Form.Group>

        <div className="text-end">
              <Button variant="primary" type="submit">
                Save 
              </Button>
              </div>
      </Form>
    )}
  </Modal.Body>
</Modal>
        <Footer />
      </div>
    </React.Fragment>
  );
}
