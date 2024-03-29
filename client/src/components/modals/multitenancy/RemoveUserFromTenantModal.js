import React from "react";
import { Modal, Button, Form } from 'react-bootstrap';

const RemoveUserFromTenantModal = ({ show, handleClose, handleDeleteUser }) => {

  return (
    <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Deletion</Modal.Title>
          </Modal.Header>

          <Modal.Body>Are you sure you want to remove the selected user from this tenant?</Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteUser}>
              Delete
            </Button>
          </Modal.Footer>
    </Modal>
  );
};

export default RemoveUserFromTenantModal;
