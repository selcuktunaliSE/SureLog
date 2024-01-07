import React from 'react';
import {useEffect, useState} from "react";
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { useFormik } from 'formik';
import * as Yup from 'yup';
const fetchConfig = require("../config/fetchConfig.json");

const {host, port} = fetchConfig;
const fetchAddress = `http://${host}:${port}`;

export default function Signup() {
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignUpSuccess, setIsSignUpSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isWarning, setIsWarning] = useState(false);
  const [notifyMessage, setNotifyMessage] = useState("");

  const navigate = useNavigate(); 

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters'),
    firstName: Yup.string()
      .required('First name is required'),
    lastName: Yup.string()
      .required('Last name is required'),
  }); 

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      firstName: '',
      middleName: '',
      lastName: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        let formData = {};
        Object.keys(values).forEach(valueKey => {
          formData[valueKey] = values[valueKey];
        });

        console.log("Form Data: ", formData);

        const response = await fetch(`${fetchAddress}/api/register-user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
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
        });

      } catch (error) {
        setIsError(true);
        setNotifyMessage('Could not reach server for registration request.');
        navigate("/pages/error-503");
        console.log("Error while signing up: ", error);
      }
    },
  });

  useEffect(() => {
    if (localStorage.getItem('userId')) {
      setIsLoggedIn(true);
      setIsWarning(true);
      setNotifyMessage('You are already logged in.');
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  /* const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const formDataJson = {};

    formData.forEach((value, key) => {
      formDataJson[key] = value;
    });

    try {
      const response = await fetch('http://127.0.0.1:9000/api/register-user', {
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
  }; */

  const handleSignOut = () => {
    if(! localStorage.getItem("userId")) return;
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    navigate("/signin");
  };

  const handleReturnToHome = () => {
    navigate("/");
  }

  if(isSignUpSuccess){
    return (
      <div className="page-sign">
        <Card className="card-sign">
          <Card.Header>
            <Link to="/" className="header-logo mb-4">SureLog</Link>
            <Card.Title>Sign Up</Card.Title>
          </Card.Header>
          <Card.Body>
            <Card.Text style={{ color: 'green' }}>You have successfully registered. </Card.Text>
            <Button variant="primary" className="btn-go-home mt-3" onClick={handleReturnToHome}>
              Return To Home
            </Button>
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
            <Button variant="primary" className="btn-go-home" onClick={handleReturnToHome}>
              Return To Home
            </Button>
            <Button variant="danger" className="btn-signout mt-3" onClick={handleSignOut}>
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
          <Form onSubmit={formik.handleSubmit}>
            <div className="mb-3">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter your email address"
                {...formik.getFieldProps('email')}
              />
              {formik.touched.email && formik.errors.email && (
                <div className="error-message">{formik.errors.email}</div>
              )}
            </div>
            <div className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Enter your password"
                {...formik.getFieldProps('password')}
              />
              {formik.touched.password && formik.errors.password && (
                <div className="error-message">{formik.errors.password}</div>
              )}
            </div>
            <div className="mb-3">
              <Form.Label>First name</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                placeholder="Enter your first name"
                {...formik.getFieldProps('firstName')}
              />
              {formik.touched.firstName && formik.errors.firstName && (
                <div className="error-message">{formik.errors.firstName}</div>
              )}
            </div>
            <div className="mb-3">
              <Form.Label>Middle name (Optional)</Form.Label>
              <Form.Control
                type="text"
                name="middleName"
                placeholder="Enter your middle name"
                {...formik.getFieldProps('middleName')}
              />
              {formik.touched.middleName && formik.errors.middleName && (
                <div className="error-message">{formik.errors.middleName}</div>
              )}
            </div>
            <div className="mb-3">
              <Form.Label>Last name</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                placeholder="Enter your last name"
                {...formik.getFieldProps('lastName')}
              />
              {formik.touched.lastName && formik.errors.lastName && (
                <div className="error-message">{formik.errors.lastName}</div>
              )}
            </div>
  
            {isWarning && !isError && (
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