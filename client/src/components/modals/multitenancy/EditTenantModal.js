import React from "react";
import { Modal, Button, Form } from 'react-bootstrap';

const EditTenantModal = ({ show, handleClose, handleInputChange, handleSubmit, tenantData }) => {

  return (
    <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Tenant</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Tenant Name</Form.Label>
                <Form.Control 
                  type="text"
                  name="name" 
                  placeholder="Enter Tenant Name"
                  value={tenantData.name}
                  onChange={handleInputChange}
                />
              </Form.Group>
              
              <div className="text-end">
            
                <Button variant="primary" type="submit">
                  Save Changes
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
  );
};

export default EditTenantModal;
