import React from 'react';
import {useEffect, useState} from "react";
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignUpSuccess, setIsSignUpSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isWarning, setIsWarning] = useState(false);
  const [notifyMessage, setNotifyMessage] = useState("");

  const navigate = useNavigate(); 

  useEffect(() => {
    if (localStorage.getItem('userId')) {
      setIsLoggedIn(true);
      setIsWarning(true);
      setNotifyMessage('You are already logged in.');
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const formDataJson = {};

    formData.forEach((value, key) => {
      formDataJson[key] = value;
    });

    try {
      const response = await fetch('http://127.0.0.1:3000/api/registerUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataJson),
      }).then((response) => response.json())
      .then((data) => {
        console.log("Registration response data: ", data);
        if(data.status === "success"){
          localStorage.setItem("userId", data.userId);
          setIsError(false);
          setNotifyMessage("");
          setIsWarning(false);
          setIsLoggedIn(true);
          setIsSignUpSuccess(true);
        }

        if(data.status === "userExists"){
          setIsError(true);
          setIsWarning(false);
          setIsLoggedIn(false);
          setNotifyMessage("This email address is already registered.");
        }

        if(data.status === 500){
          navigate("/pages/error-500");
        }
      })


    } catch (error) {
      setIsError(true);
      setNotifyMessage('Could not reach server for registration request.');
      navigate("/pages/error-503");
    }
  };

  const handleSignOut = () => {
    if(! localStorage.getItem("userId")) return;
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    navigate("/pages/signin");
  };

  if(isSignUpSuccess){
    return (
      <div className="page-sign">
        <Card className="card-sign">
          <Card.Header>
            <Link to="/" className="header-logo mb-4">SureLog</Link>
            <Card.Title>Sign Up</Card.Title>
          </Card.Header>
          <Card.Body>
            <Card.Text style={{ color: 'green' }}>You have successfully registered. <Link to="/">Look around?</Link></Card.Text>
          </Card.Body>
        </Card>
      </div>
    );
  }

  if (isLoggedIn && ! isSignUpSuccess) {
    return (
      <div className="page-sign">
        <Card className="card-sign">
          <Card.Header>
            <Link to="/" className="header-logo mb-4">SureLog</Link>
            <Card.Title>Sign Up</Card.Title>
            <Card.Text style={{ color: 'red' }}>You are already logged in.</Card.Text>
          </Card.Header>
          <Card.Body>
            <div className="mb-3">
              <Link to="/">Return to Home</Link>
            </div>
            <Button variant="danger" className="btn-signout" onClick={handleSignOut}>
              Sign Out
            </Button>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-sign">
      <Card className="card-sign">
        <Card.Header>
          <Link to="/" className="header-logo mb-4">SureLog</Link>
          <Card.Title>Sign Up</Card.Title>
          <Card.Text>Welcome! Please enter your information to register.</Card.Text>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleRegisterSubmit}>
            <div className="mb-3">
              <Form.Label>Email address</Form.Label>
              <Form.Control type="email" name="email" placeholder="Enter your email address" />
            </div>
            <div className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" name="password" placeholder="Enter your password" />
            </div>
            <div className="mb-3">
              <Form.Label>First name</Form.Label>
              <Form.Control type="text" name="firstName" placeholder="Enter your first name" />
            </div>
            <div className="mb-3">
              <Form.Label>Middle name (Optional)</Form.Label>
              <Form.Control type="text" name="middleName" placeholder="Enter your middle name" />
            </div>
            <div className="mb-3">
              <Form.Label>Last name</Form.Label>
              <Form.Control type="text" name="lastName" placeholder="Enter your last name" />
            </div>

            {/* Conditional message with text color */}
            {isWarning && ! isError && (
              <div className="notify-message" style={{ color: 'orange' }}>
                {notifyMessage}
              </div>
            )}
  
            {isError && (
              <div className="notify-message" style={{ color: 'red' }}>
                {notifyMessage}
              </div>
            )}
  
            <Button type="submit" variant="primary" className="btn-sign">
              Create Account
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}