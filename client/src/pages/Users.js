import React from "react";
import { Link } from "react-router-dom";
import { Card, Col, Row } from "react-bootstrap";
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
  const [userList, setUserList] = useState([]);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");


  const goToUserProfile = (username) => {
    console.log(`Redirect to ${username}'s profile`);
  };

  const fetchUsersFromTenant = (tenantId, role) => {
    
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
              console.log("data tenant roles: ", data.tenantRoles);
              let tenantRoles = [];
              data.tenantRoles.forEach(tenantRole => {
                tenantRoles.push({tenantId: tenantRole.tenantId, role: tenantRole.role });
              });
              setTenantRoles(tenantRoles);
              console.log("set tenant roles", tenantRoles);
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
          navigate("/pages/error-503");
        });
  }

  useEffect(() => {
    if(! userId) navigate("/pages/signin");
    fetchTenantRoles();
  }, []);

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

            <Row className="g-2 g-xxl-3 mb-5">
              {users.map((user, index) => (
                <Col sm="6" md="4" key={index}>
                  <Card className="card-people" onClick={() => goToUserProfile(user.name)}>
                    <Card.Body>
                      <Avatar img={user.img} size="xl" />
                      <h6 className="mt-3">{user.name}</h6>
                      <p>{user.position}</p>
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