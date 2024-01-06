import React from "react";
import { Link } from "react-router-dom";
import { Card, Col, Row, DropdownButton, Dropdown } from "react-bootstrap";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import Footer from "../layouts/Footer";
import HeaderMobile from "../layouts/HeaderMobile";
import Avatar from "../components/Avatar";

import img1 from "../assets/img/img1.jpg";
import img6 from "../assets/img/img6.jpg";
import img7 from "../assets/img/img7.jpg";
// ... (rest of the image imports)

export default function Users() {

  const [tenantRoles, setTenantRoles] = useState({});
  const [tenantNames, setTenantNames] = useState({});
  const [selectedTenantId, setSelectedTenantId] = useState(null);
  const [userDict, setUserDict] = useState({});
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");
  

  const fetchUsersFromTenant = async (tenantId) => {
    if(!userId) navigate("/pages/signin");

    console.log(`Fetching users from tenant with User ID: ${userId} & Tenant ID: ${tenantId} & Role: ${tenantRoles[tenantId]}`);

    await fetch("http://127.0.0.1:9000/api/fetch-users", {
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

          console.log("fetched users: ", userDict);
        } else if(data.status === "roleNotFound") {
          setIsError(true);
          setErrorMessage("role-not-found");
        }
        else if(data.status === 503){
          navigate("/pages/error-503");
        }
        else if(data.status === 505){
          navigate("/pages/error-505");
        }

      })
      .catch(error => {
        console.log("Error fetching users from tenant, ", error);
        navigate("/pages/error-503");
      });
  }

  const fetchTenantRoles = async () => {
     await fetch("http://127.0.0.1:9000/api/fetch-tenant-roles", {
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
              setErrorMessage("No role was found for your User ID. Please contact your administrator.");
            }
            if(data.status === 500){
              navigate("/pages/error-500");
            }
        })
        .catch(error => {
          console.error("Error fetching Tenant Roles from the server: ", error);
          navigate("/pages/error-503");
        });
  }

  const handleTenantSelect = (tenantId) => {
    setSelectedTenantId(tenantId);
    fetchUsersFromTenant(tenantId);
  };

  const goToUserProfile = async (targetUserId) => {
    const senderUserId = localStorage.getItem("userId"); 
    const tenantId = selectedTenantId; 
  
    const requestData = {
      senderUserId: senderUserId,
      targetUserId: targetUserId,
      tenantId: tenantId,
    };
  
    await fetch("http://127.0.0.1:9000/api/go-to-user-profile", {
      method: "post",
      body: JSON.stringify(requestData),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          navigate(`/pages/profile?userId=${targetUserId}`);
        } else {
        }
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  };

  useEffect(() => {
    if(! userId) navigate("/pages/signin");
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
      <div className="main p-4 p-lg-5">
        <Row className="g-5">
          <Col>
            <h2 className="main-title">User List</h2>
            <DropdownButton id="dropdown-basic-button" title="Select Tenant">
              {Object.entries(tenantRoles).map(([tenantId, role]) => (
                <Dropdown.Item key={tenantId} onClick={() => handleTenantSelect(tenantId)}>
                  {tenantNames[tenantId]}
                </Dropdown.Item>
              ))}
            </DropdownButton>
  
            <Row className="g-2 g-xxl-3 mb-5">
              {Object.values(userDict).map((user, index) => (
                <Col sm="6" md="4" key={index} onClick={() => goToUserProfile(user.userId)}>
                  <Card className="card-people">
                    <Card.Body>
                      <Avatar img={user.img} size="xl" />
                      <h6 className="mt-3">{user.firstName} {user.middleName} {user.lastName}</h6>
                      <p>{user.email}</p>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
        <Footer />
      </div>
    </React.Fragment>
  );
  
}