import React, { useState, useEffect } from "react";
import { Card, Col, Row, ListGroup,Modal,Button,Form } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import Footer from "../layouts/Footer";
import HeaderMobile from "../layouts/HeaderMobile";
import Header from "../layouts/Header";
import "../scss/customStyle.scss";
import DynamicTable from "../components/DynamicTable";
const { FetchStatus } = require("../service/FetchService");
const fetchService = require("../service/FetchService");
export default function TenantProfile() {
  const [tenantData, setTenantData] = useState({});
  const [tenantUsers, setTenantUsers] = useState([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
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
  

  const fetchTenantUsers = async () => {
    const response = await fetchService.fetchUsersFromTenant(tenantId);
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
      setTenantData(response.data.tenant);
    } else {
      handleErrorResponse(response);
    }
  };

  useEffect(() => {
    console.log(tenantUsers);
    if (!userId) {
      navigate("/signin");
      return;
    }
    if (!tenantId) {
      navigate("/dashboard/tenants");
      return;
    }

    fetchTenantProfile();
    fetchTenantUsers();
  }, [location.state, navigate, tenantId, userId]);

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
  


  const tenantUsersDict = tenantUsers.reduce((acc, user, index) => {
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

  const handleEditUser = (userId) => {
    console.log("Edit user:", userId);
    // Here you can implement the logic to edit the user
    // It might involve opening a modal with user details, for example
  };
  
  const handleRowClick = (rowData) => {
    console.log("Row clicked:", rowData);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewUserData({ ...newUserData, [name]: value });
  };


  const handleShowAddUserModal = () => setShowAddUserModal(true);
  const handleCloseAddUserModal = () => setShowAddUserModal(false);
  const handleDeleteUser = async (userId) => {
    console.log("Deleting user with ID:", userId);
    const response = await fetchService.deleteUserFromTenant(tenantId, userId);
    if (response.status === "success") {
        // User successfully deleted
        console.log(response.message);
        window.location.reload();
    } else {
        console.error("Deleting from Tenants: ",response.message);
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

  return (
    <React.Fragment>
      <HeaderMobile />
      <Header /* ...props */ />
      <div className="main p-4 p-lg-5 mt-5">
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="mb-5 text-center">
              <Card.Body style={{ color: "#e2e5ec" }}>
                {tenantData ? (
                  <>
                    <h5>{tenantData.name}</h5>
                    <ListGroup className="list-group-flush mt-3">
                      <ListGroup.Item>
                        <strong>Tenant ID:</strong> {tenantData.tenantId}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>User Count:</strong> {tenantData.userCount}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Created:</strong> {formatDate(tenantData.createdAt)}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Last Update:</strong> {formatDateWithTime(tenantData.updatedAt)}
                      </ListGroup.Item>
                    </ListGroup>
                  </>
                ) : (
                  <p>Loading tenant data...</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

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
        <Footer />
      </div>
    </React.Fragment>
  );
}
