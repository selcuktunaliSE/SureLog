import React from "react";
import { Modal, Button, Form } from 'react-bootstrap';

const EditMasterRoleModal = ({ show, handleClose, roleData, handleInputChange, handleSubmit }) => {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Master Role</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {Object.entries(roleData).map(([key, value]) => {
           if (typeof value === 'boolean') {
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

export default EditMasterRoleModal;
