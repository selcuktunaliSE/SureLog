import React from "react";
import {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { Link } from "react-router-dom";



export default function Signin() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [error, setError] = useState(null);
    const [textFieldColor, setTextFieldColor] = useState('');

    const navigate = useNavigate(); 

    useEffect(() => {
        fetch("/api/checkLoggedInStatus")
            .then((response) => response.json())
            .then((data) => {
                if(data.status === "success" && data.isLoggedIn)
                {
                    setIsLoggedIn(true);
                }
                console.log(data.status);
            })
            .catch((error) =>
            {
                console.error("Error checking logged in status: ", error);
            });
        }, []);

    if(isLoggedIn)
    {
        // TODO Implement already logged in page here
    }

    return (
        <div className="page-sign">
        <Card className="card-sign">
            <Card.Header>
            <Link to="/" className="header-logo mb-4">dashbyte</Link>
            <Card.Title>Sign In</Card.Title>
            <Card.Text>Welcome back! Please signin to continue.</Card.Text>
            </Card.Header>
            <Card.Body>
            <Form method="post" onSubmit={(e) => handleSubmit(e, navigate, setError, setTextFieldColor)}>
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
                Don't have an account? <Link to="/pages/signup">Create an Account</Link>
            </Card.Footer>
        </Card>
        </div>
    )

    
}

const handleSubmit = (event, navigate, setError, setTextFieldColor) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const formDataJson = {};

    formData.forEach((value, key) => {
        formDataJson[key] = value;
    });

    fetch("http://localhost:9000/api/authenticate-client", {
        method : 'post',
        body: JSON.stringify(formDataJson),
        headers: {
            'Content-Type' : 'application/json'
        },
    })
    .then((response) => response.json())
    .then((data) => {
        if(data.status === 'success')
        {
            navigate('/dashboard/finance');
        }

        if(data.status === 'invalidCredentials')
        {
            setError('Login failed, please check your credentials.')
            setTextFieldColor('red');
            navigate('/pages/signin');
        }
    })
    .catch((error) => {
        console.log("Error while authenticating client: ", error);
    });
}

