import React from "react";
import { Modal, Button, Form } from 'react-bootstrap';

const AddUserModal = ({ show, handleClose, handleInputChange, handleSubmit, tenantRoles }) => {

  return (
    <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Add New User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  autoComplete="off"
                  placeholder="User Name"
                  name="fullName"
                  onChange={handleInputChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  name="email"
                  onChange={handleInputChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter password"
                  name="password"
                  onChange={handleInputChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password(Confirm)</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Confirm password"
                  name="confirmPassword"
                  onChange={handleInputChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Select
                  type="text"
                  name="tenantRoleId"
                  onChange={handleInputChange}
                >
                  <option value="" disabled>
                    Select
                  </option>
                  {tenantRoles.map((tenantRole) => (
                    <option key={tenantRole.tenantRoleId} value={tenantRole.tenantRoleId}>
                      {tenantRole.roleName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <div className="text-end">
                <Button variant="primary" type="submit">
                  Save
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
  );
};

export default AddUserModal;
