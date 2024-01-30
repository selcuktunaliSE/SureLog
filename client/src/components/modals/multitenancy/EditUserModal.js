import React from "react";
import { Modal, Button, Form } from 'react-bootstrap';

const EditUserModal = ({ show, handleClose, handleInputChange, handleSubmit, tenantRoles }) => {

  return (
    <Modal show={show} onHide={handleClose}>

          <Modal.Header closeButton>
            <Modal.Title>Edit User</Modal.Title>
          </Modal.Header>
          
          <Modal.Body>
              <Form onSubmit={handleSubmit}>
               {/* Name */}
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
               {/* Email */}
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email" // Ensure this matches the property in the editingUser object
                    placeholder="E-mail"
                    onChange={handleInputChange}
                  />
                </Form.Group>

                {/* Password */}
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="text"
                    name="password"
                    placeholder="Enter new password"
                    onChange={handleInputChange}
                  />
                </Form.Group>
                {/* RoleName */}
                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Select
                    name="roleName"
                    onChange={handleInputChange}
                  >
                   {tenantRoles.map((role) => (
                    <option key={role.tenantRoleId} value={role.roleName}>
                      {role.roleName}
                    </option>
                  ))}
                  </Form.Select>
                </Form.Group>

                <div className="text-end">
                  <Button variant="primary" type="submit" onClick={handleSubmit}>
                    Save
                  </Button>
                </div>

              </Form>
          </Modal.Body>
        </Modal>
  );
};

export default EditUserModal;
