import React, { useState } from "react";
import { Button, Card, Col, Container, Form, Nav, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import pageSvg from "../assets/svg/forgot_password.svg";
const fetchConfig = require("../config/fetchConfig.json");
const {host, port} = fetchConfig;
const fetchAddress = `http://${host}:${port}`;
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [resetStatus, setResetStatus] = useState(null);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleReset = async () => {
    try {
      const response = await fetch(`${fetchAddress}/api/send-password-reset-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();

      if (response.ok) {
        // Password reset initiated successfully
        setResetStatus({ success: true, message: result.message });
      } else {
        // Password reset initiation failed
        setResetStatus({ success: false, message: result.message });
      }
    } catch (error) {
      console.error("Error initiating password reset:", error);
      setResetStatus({ success: false, message: "Error initiating password reset" });
    }
  };

  return (
    <div className="page-auth">
      <div className="header">
        <Container>
          <Link to="/" className="header-logo">
            SureLog
          </Link>
          <Nav className="nav-icon">
            <Nav.Link href="">
              <i className="ri-twitter-fill"></i>
            </Nav.Link>
            <Nav.Link href="">
              <i className="ri-github-fill"></i>
            </Nav.Link>
            <Nav.Link href="">
              <i className="ri-dribbble-line"></i>
            </Nav.Link>
          </Nav>
        </Container>
      </div>

      <div className="content">
        <Container>
          <Card className="card-auth">
            <Card.Body className="text-center">
              <div className="mb-5">
                <object
                  type="image/svg+xml"
                  data={pageSvg}
                  className="w-50"
                  aria-label="svg image"
                ></object>
              </div>
              <Card.Title>Reset your password</Card.Title>
              <Card.Text className="mb-5">
                Enter your username or email address, and we will send you a link to reset your
                password.
              </Card.Text>

              <Form>
                <Row className="g-2">
                  <Col sm="8">
                    <Form.Control
                      type="text"
                      placeholder="Enter email address"
                      value={email}
                      onChange={handleEmailChange}
                    />
                  </Col>
                  <Col sm="4">
                    <Button variant="primary" onClick={handleReset}>
                      Reset
                    </Button>
                  </Col>
                </Row>
              </Form>

              {resetStatus && (
                <div className={`mt-3 ${resetStatus.success ? "text-success" : "text-danger"}`}>
                  {resetStatus.message}
                </div>
              )}
            </Card.Body>
          </Card>
        </Container>
      </div>
    </div>
  );
}
