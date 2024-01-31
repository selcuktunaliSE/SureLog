import React from "react";
import { Modal, Button, Form } from 'react-bootstrap';

const AddTenantRoleModal = ({ show, handleClose, handleInputChange, handleSubmit }) => {
  const permissions = ["removeUserFromTenant",
                       "editTenant",
                        "deleteTenant",
                         "addTenantRole",
                          "editTenantRole",
                           "deleteTenantRole",
                            "assignTenantRole",
                             "revokeTenantRole",
                              "viewTenantUsers"];

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Role</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {/* roleName text input */}
          <Form.Group className="mb-3">
            <Form.Label>Role Name</Form.Label>
            <Form.Control 
              type="text"
              name="roleName" 
              placeholder="Role Name"
              onChange={handleInputChange}s
            />
          </Form.Group>

          {/* Checkboxes for boolean parameters */}
          {permissions.map(permission => {
              return (
                <Form.Group className="mb-3" key={permission}>
                  <Form.Check 
                    type="checkbox"
                    label={permission}
                    name={permission}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              );
          })}

          {/* Submit button */}
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

export default AddTenantRoleModal;
