import React from "react";
import { Modal, Button, Form } from 'react-bootstrap';

const EditTenantRoleModal = ({ show, handleClose, roleData, handleInputChange, handleSubmit }) => {

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
              placeholder="Enter Role Name"
              value={roleData.roleName}
              onChange={handleInputChange}
            />
          </Form.Group>

          {/* Checkboxes for boolean parameters */}
          {Object.entries(roleData).map(([key, value]) => {
            if (key !== 'roleName' && key !== "tenantId" && key !== "tenantRoleId") {
              return (
                <Form.Group className="mb-3" key={key}>
                  <Form.Check 
                    type="checkbox"
                    label={key}
                    name={key}
                    checked={value}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              );
            }
            return null;
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

export default EditTenantRoleModal;
