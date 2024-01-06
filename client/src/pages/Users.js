import React from "react";
import { Link } from "react-router-dom";
import { Card, Col, Row } from "react-bootstrap";
import Footer from "../layouts/Footer";
import HeaderMobile from "../layouts/HeaderMobile";
import Avatar from "../components/Avatar";

import img1 from "../assets/img/img1.jpg";
import img6 from "../assets/img/img6.jpg";
import img7 from "../assets/img/img7.jpg";
// ... (rest of the image imports)

export default function Users() {
  const goToUserProfile = (username) => {
    console.log(`Redirect to ${username}'s profile`);
  };

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