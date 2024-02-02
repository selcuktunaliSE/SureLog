import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Col, Row, DropdownButton, Dropdown, Alert, FormControl, InputGroup, Button,Modal,Form, Card } from "react-bootstrap";
import {Search} from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import HeaderMobile from "../layouts/HeaderMobile";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import "../scss/customStyle.scss";

import DynamicTable from "../components/tables/DynamicTable";
import BarChartCard from "../components/graph_cards/BarChartCard";
import SingleStatisticCard from "../components/graph_cards/SingleStatisticCard";

import {formatDate, formatDateWithTime} from "../utility/DateFormatter";


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
  const [userRole, setUserRole] = useState(""); 
  const [tenantDict, setTenantDict] = useState({});
  const [numTenantsStatisticDataDict, setNumTenantsStatisticDataDict] = useState({});
  const [numEndUsersStatisticDataDict, setNumEndUsersStatisticDataDict] = useState({});
  const [numTenantAdminsStatisticDataDict, setNumTenantAdminsStatisticDataDict] = useState({});
  const [numMastersStatisticDataDict, setNumMastersStatisticDataDict] = useState({});
  const [numEndUsers, setNumEndUsers] = useState(0);
  const [numMasters, setNumMasters] = useState(0);
  const [numTenantAdmins, setNumTenantAdmins] = useState(0);
  const [editingTenantData, setEditingTenantData] = useState({
    name: '',
    tenantId: '',
  }); 
  const [tenantIdToDelete, setTenantIdToDelete] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showEditTenantModal, setShowEditTenantModal] = useState(false);
  const [showAddTenantModal, setShowAddTenantModal] = useState(false);
  const handleCloseConfirmationModal = () => setShowConfirmationModal(false);
  const handleCloseEditTenantModal = () => setShowEditTenantModal(false);
  const [newTenantData, setNewTenantData] = useState({
    name: '',
    // Add other fields if necessary
  });
  
  const currentSkin = (localStorage.getItem('skin-mode')) ? 'dark' : '';
  const handleEditingTenantInputChange = (event) => {
    const { name, value } = event.target;
    setEditingTenantData({ ...editingTenantData, [name]: value });
  };
  const fetchUserRole = async () => {
    const response = await fetchService.fetchUserRoleName(userId); // Adjust this to match the actual function you have for fetching user role
    if (response && response.status === FetchStatus.Success) {
      return response.data; // Set the fetched role
    } else {
        console.error("Error fetching user role: ", response.message);
    }
};
  const handleSubmitEditedTenant = async (event) => {
    event.preventDefault();
    const tenantId = editingTenantData.tenantId;
    const response = await fetchService.updateTenant(userId,tenantId ,editingTenantData);
    if (!response.error) {
      console.log("Tenant updated successfully: ", response.data);
      fetchTenants(); // Refresh tenant list
      handleCloseEditTenantModal(); // Close modal
    } else {
      console.error("Failed to update tenant: ", response.message);
    }
  };

  const searchKeys = ["name"];

  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
   
    if(! userId) {
        navigate("/signin");
        return;
    }
   
    fetchUserRole().then(userRole => {
      console.log("User role is: ", userRole);
      setUserRole(userRole); 
       // For restricted access to this page
      if(userRole === "User"){
      navigate("/error/403");
      }
      if (checkMasterUser()) {
          fetchTenants();
          fetchUserTypeCountDistributionData();
      }
  });
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
      "label": "Tenants",
      "last": {
      "color": "success",
      "amount": "2.3%"
      }
    });

    setNumEndUsersStatisticDataDict({
      "icon": "ri-group-line",
      "percent": {
      "color": "success",
      "amount": "+13.8%"
      },
      "value": numEndUsers,
      "label": "Users",
      "last": {
      "color": "success",
      "amount": "7.1%"
      }
    });

    setNumMastersStatisticDataDict({
      "icon": "ri-group-line",
      "percent": {
      "color": "success",
      "amount": "+13.8%"
      },
      "value": numMasters,
      "label": "Masters",
      "last": {
      "color": "success",
      "amount": "7.1%"
      }
    });

    setNumTenantAdminsStatisticDataDict({
      "icon": "ri-group-line",
      "percent": {
      "color": "success",
      "amount": "+13.8%"
      },
      "value": numTenantAdmins,
      "label": "Tenant Managers",
      "last": {
      "color": "success",
      "amount": "7.1%"
      }
    });

  }, [tenantDict, numEndUsers, numTenantAdmins, numMasters]);


  const fetchTenants = async () => {
    const response = await fetchService.fetchTenantsOfMaster(userId);
    if(!response.isError()){
      const data = response.data;
      const tenantsWithActions = data.tenants.map(tenant => ({
        Actions: (
          <>
            <Button variant="outline-secondary" size="sm" onClick={(e) => handleEditTenant(e, tenant.tenantId)} className="me-2">
              <i className="ri-edit-2-line" style={{ color: '#17a2b8' }}></i>
            </Button>
            <Button variant="outline-secondary" size="sm" onClick={(e) => handleDeleteTenant(e, tenant.tenantId)} className="me-2">
              <i className="ri-delete-bin-line" style={{ color: '#dc3545' }}></i>
            </Button>
          </>
        ),
        ...tenant,
        createdAt: formatDateWithTime(tenant.createdAt),
        updatedAt: formatDateWithTime(tenant.updatedAt),        
      }));      
  
      setTenantDict(tenantsWithActions);
      setFilteredTenants(tenantsWithActions);
      setIsError(false);
      setErrorMessage("");
    }
    else{
      handleErrorResponse(response);
    }
  };
  
  const handleEditTenant = (event,tenantId) => {
    event.stopPropagation();
    console.log("Edit tenant with ID: ", tenantId);
    setEditingTenantData({ tenantId: tenantId });
    setShowEditTenantModal(true);
  };
  
  const handleDeleteTenant = (event,tenantId) => {
    event.stopPropagation();
    setShowConfirmationModal(true); 
    console.log("Delete tenant with ID: ", tenantId);
    setTenantIdToDelete(tenantId); 

  };
   

  const fetchUserTypeCountDistributionData = async () => {
    const response = await fetchService.fetchUserTypeCountDistributionData(userId);
    
    if(! response.isError()){
      const percentages = response.data.userTypeCountDistributionData.percentages;
      const counts = response.data.userTypeCountDistributionData.counts;

      setNumEndUsers(counts.endUsers);
      setNumMasters(counts.masters);
      setNumTenantAdmins(counts.tenantAdmins);

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
const handleShowAddTenantModal = () => setShowAddTenantModal(true);
const handleCloseAddTenantModal = () => setShowAddTenantModal(false);

const handleNewTenantInputChange = (event) => {
  const { name, value } = event.target;
  setNewTenantData({ ...newTenantData, [name]: value });
};

const handleSubmitNewTenant = async (event) => {
  event.preventDefault();
  const response = await fetchService.addTenant(userId, newTenantData);
  if (!response.error) {
    console.log("Tenant added successfully: ", response.data);
    fetchTenants();
    handleCloseAddTenantModal();
  } else {
    console.error("Failed to add tenant: ", response.message);
  }
};

  const handleSkinModeChange = (skin) => {
    setSkinMode(skin);
    
  };

  const performDeleteTenant = async () => {
    try {
        const response = await fetchService.deleteTenant(userId, tenantIdToDelete);
        
        if (response.status === 200) {
            alert('Tenant deleted successfully!');
            // Refresh the tenants list after successful deletion
            fetchTenants();
        } else {
           
        }
    } catch (error) {
        console.error('Error deleting tenant: ', error);
        alert('An error occurred while deleting the tenant.');
    } finally {
        setShowConfirmationModal(false);
        window.location.reload();
    }
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
  const addTenant = async (tenantData) => {
    try {
      const response = await fetchService.addTenant(localStorage.getItem("userId"), tenantData);
      if (!response.isError()) {
        alert("Tenant added successfully!");
        // Refresh tenants list or navigate as needed
      } else {
        // Handle errors
        alert("Failed to add tenant: " + response.message);
      }
    } catch (error) {
      console.error("Error adding tenant: ", error);
    }
  };
  
 

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
              <li className="breadcrumb-item"><Link to="#">Services</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Tenants</li>
            </ol>
            <h4 className="main-title mb-0">Welcome to Tenants</h4>
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
                <Card className="card-one">
                  <Card.Header>
                    <Card.Title as="h4">
                      <span>All Tenants</span>
                    </Card.Title>
                  </Card.Header>

                  <Card.Body>
                    <InputGroup
                      >
                      {/* Search Input */}
                      <FormControl
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={handleSearch}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleProcessSearchQuery();
                          }
                        }}
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
                      <div className="mx-2 text-muted"></div> {/* 'veya' yazısı ekleyin */}
                          <Button variant="outline-success" onClick={handleShowAddTenantModal}>
                          Add Tenant
                          </Button>
                  
                    </InputGroup>  

                    <div className="cursor-pointer mt-3">
                      <DynamicTable dataDict={filteredTenants} onRowClick={handleRowClick}/>
                    </div>

                  </Card.Body>
                </Card>
              </Col>
            </Row>
            
            <Row className="mt-3">
              <Col md={12}>
                
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
                  <Row className="mb-3">
                    <Col md={6}>
                      <SingleStatisticCard dataDict={numTenantsStatisticDataDict}/>
                    </Col>
                    
                    <Col md={6}>
                      <SingleStatisticCard dataDict={numEndUsersStatisticDataDict}/>
                    </Col>

                  </Row>

                  <Row className="">
                    <Col md={6}>
                      <SingleStatisticCard dataDict={numTenantAdminsStatisticDataDict}/>
                    </Col>
                    
                    <Col md={6}>
                      <SingleStatisticCard dataDict={numMastersStatisticDataDict}/>
                    </Col>
                  </Row>

                </div>
              </Col>
              <Col xl="5">
              
              </Col>
            </Row>  

          </Col>
        </Row>
        <Modal show={showAddTenantModal} onHide={handleCloseAddTenantModal}>
  <Modal.Header closeButton>
    <Modal.Title>Add New Tenant</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form onSubmit={handleSubmitNewTenant}>
      <Form.Group className="mb-3">
        <Form.Label>Tenant Name</Form.Label>
        <Form.Control
          type="text"
          name="name"
          placeholder="Enter Tenant Name"
          value={newTenantData.name}
          onChange={handleNewTenantInputChange}
          required
        />
      </Form.Group>
      {/* Add more fields if necessary */}
      <div className="text-end">
        <Button variant="primary" type="submit">
          Add Tenant
        </Button>
      </div>
    </Form>
  </Modal.Body>
</Modal>
<Modal show = {showEditTenantModal} onHide = {handleCloseEditTenantModal}>
  <Modal.Header closeButton>
    <Modal.Title>Edit Tenant</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form onSubmit={handleSubmitEditedTenant}>
      <Form.Group className="mb-3">
        <Form.Label>Tenant Name</Form.Label>
        <Form.Control
          type="text"
          name="name"
          placeholder="Enter New Name"
          value= {editingTenantData.name}
          onChange={handleEditingTenantInputChange}
          required
        />
      </Form.Group>
      {/* Add more fields if necessary */}
      <div className="text-end">
        <Button variant="primary" type="submit">
          Edit Tenant
        </Button>
      </div>
    </Form>
  </Modal.Body>
</Modal>
<Modal show={showConfirmationModal} onHide={handleCloseConfirmationModal}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Deletion</Modal.Title>
          </Modal.Header>
          <Modal.Body>Are you sure you want to delete this tenant?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseConfirmationModal}>
              Cancel
            </Button>
            <Button variant="danger" onClick={performDeleteTenant}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>

      </div>
      <Footer />
    </React.Fragment>
  );
}