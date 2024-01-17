import React, { useState, useEffect } from "react";
import { Button, Card, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import img1 from "../assets/img/img1.jpg";
import { useNavigate } from "react-router-dom";
const { FetchStatus } = require("../service/FetchService");
const fetchService = require("../service/FetchService");

export default function LockScreen() {
  const [qrCode, setQrCode] = useState('');
  const [token, setToken] = useState('');
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    handleGenerate();
  }, []);

  const handleGenerate = async () => {
    try {
      const response = await fetchService.fetchGenerateQRCode();
      console.log('handleGenerate response:', response);
      if (response) {
        setQrCode(response.qrCode);
        setSecret(response.secret);
      } else {
        console.error('Error fetching QR code:', response);
      }
    } catch (error) {
      console.error('Error fetching QR code:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetchService.fetchVerifyToken(token, secret);
      console.log("Response from handleSubmit is : ", response);
      if (response) {
        console.log("Token Response is : ", response);
        navigate('/');
        console.log('Token is valid.');
      } else {
        console.error('Token verification failed.');
      }
    } catch (error) {
      console.error('Error verifying token:', error);
    }
  };

  return (
    <div className="page-sign">
      <Card className="card-sign">
        <Card.Header className="d-flex flex-column align-items-center">
          <Link to="" className="header-logo mb-4">SureLog</Link>
        </Card.Header>
        <Card.Body>
          <Link to="" className="card-thumb">
            <img src={qrCode || img1} alt="QR Code or Default" />
          </Link>
          <div className="mb-4">
            <Form.Label className="d-flex justify-content-between">Token </Form.Label>
            <Form.Control
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>
          <Button variant="primary" className="btn-sign" onClick={handleSubmit}>Enter</Button>
        </Card.Body>
      </Card>
    </div>
  );
}
