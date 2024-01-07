import React from "react";
import {useEffect, useState} from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
const fetchConfig = require("../config/fetchConfig.json");

const {host, port} = fetchConfig;
const fetchAddress = `http://${host}:${port}`;

export default function Signin() {

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [error, setError] = useState(null);
    const [textFieldColor, setTextFieldColor] = useState('');
    const [shouldFetchData, setShouldFetchData] = useState(true);

    const navigate = useNavigate(); 

    useEffect(() => {
        if(!shouldFetchData) return;

        // TODO Re-connect this to the server API once the CORS problems are solved
        /* fetch("http://127.0.0.1:9000/api/checkLoggedInStatus", {
            method: "post",
            credentials: "include",
            mode: "cors",
            headers: {
                "Content-Type": "text-xml",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "X-PINGOTHER, Content-Type",

            }
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data.isLoggedIn);
                if(data.status === "success" && data.isLoggedIn)
                {
                    setIsLoggedIn(true);
                }
                else
                {
                    setIsLoggedIn(false);
                }
                console.log(data.status);
            })
            .catch((error) =>
            {
                console.error("Error checking logged in status: ", error);
                setIsLoggedIn(false);
                setError("authentication-error");
            });
            setShouldFetchData(false); */

            if(localStorage.getItem("userId")){   
                setIsLoggedIn(true);
            }
            else{
                setIsLoggedIn(false);
            }
        }, [shouldFetchData]);


    const handleSwitchAccount = () => {
        if(! localStorage.getItem("userId")) return;
        localStorage.removeItem("userId");
        setIsLoggedIn(false);
        navigate("/signin"); 
        };
    
    const handleSignOut = () => {
        if(! localStorage.getItem("userId")) return;
        localStorage.removeItem("userId");
        setIsLoggedIn(false);
        navigate("/signin");
    };

    if(error === "authentication-error") {
        return (
            <div className="page-sign">
            <Card className="card-sign">
                <Card.Header>
                <Link to="/" className="header-logo mb-4">SureLog</Link>
                <Card.Title>Authentication Error</Card.Title>
                <Card.Text>Something went wrong with authentication. Please try again.</Card.Text>
                </Card.Header>
                <Card.Body>
                <p>Please click the button below to return to the login page:</p>
                <Button variant="primary" onClick={handleReturnToLogin(navigate, setError, setIsLoggedIn)}>Return to Login</Button>
                </Card.Body>
            </Card>
            </div>
        );
    }

    if(isLoggedIn) {
        return (
            <div className="page-sign">
              <Card className="card-sign">
                <Card.Header>
                  <Link to="/" className="header-logo mb-4">SureLog</Link>
                  <Card.Title className="text-warning mt-3">Already Logged In</Card.Title>
                </Card.Header>
                <Card.Body >
                  <p className="text-primary-light">Do you want to switch to another account or sign out?</p>
                  <Button variant="primary" onClick={handleSwitchAccount}>Switch Account</Button>
                  <Button variant="secondary" onClick={handleSignOut} className="button mt-3">Sign Out</Button>
          
                  <div className="text-center mt-3"> {/* Add text-center class here */}
                    <Link to="/">Return To Home</Link>
                  </div>
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
            <Card.Title>Sign In</Card.Title>
            <Card.Text>Welcome back! Please signin to continue.</Card.Text>
            </Card.Header>
            <Card.Body>
            <Form method="post" onSubmit={(e) => handleSubmit(fetchAddress, e, navigate, setError, setTextFieldColor)}>
                <div className="mb-4">
                <Form.Label >Email address</Form.Label>
                <Form.Control style={{borderColor: textFieldColor}} type="text" placeholder="Enter your email address" name="email"/>
                </div>
                <div className="mb-4">
                <Form.Label className="d-flex justify-content-between">Password <Link to="">Forgot password?</Link></Form.Label>
                <Form.Control style={{borderColor: textFieldColor}} type="password" placeholder="Enter your password" name="password"/>
                </div>

                {error && <p style={{ color: 'red' }}>{error}</p>}
                <Button type="submit" variant="primary" className="btn-sign">Sign In</Button>

                <div className="divider"><span>or sign in with</span></div>

                <Row className="gx-2">
                <Col><Button variant="" className="btn-facebook"><i className="ri-facebook-fill"></i> Facebook</Button></Col>
                <Col><Button variant="" className="btn-google"><i className="ri-google-fill"></i> Google</Button></Col>
                </Row>
            </Form>
            </Card.Body>
            <Card.Footer>
                Don't have an account? <Link to="/signup">Create an Account</Link>
            </Card.Footer>
        </Card>
        </div>
    )
}

const handleReturnToLogin = (navigate, setError, setIsLoggedIn) => {
    setError(null);
    setIsLoggedIn(false);
    navigate("/signin");
}

const handleSubmit = (fetchAddress, event, navigate, setError, setTextFieldColor) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const formDataJson = {};

    formData.forEach((value, key) => {
        formDataJson[key] = value;
    });

    fetch(`${fetchAddress}/api/authenticate-client`, {
        method : 'post',
        body: JSON.stringify(formDataJson),
        headers: {
            'Content-Type' : 'application/json'
        },
    })
    .then((response) => response.json())
    .then((data) => {
        console.log("authentication response data: ", data);    
        if(data.status === "success")
        {   
            console.log("authentication success");
            localStorage.setItem("userId", data.userId);
            navigate('/');
        }

        if(data.status === "invalidCredentials")
        {
            setError('Login failed, please check your credentials.')
            setTextFieldColor('red');
            navigate('/signin');
        }
    })
    .catch((error) => {
    	console.log("authentication error: ", error);
        navigate("/error/503");
    });
}

