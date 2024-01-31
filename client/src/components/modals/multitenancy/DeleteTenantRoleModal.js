import React from "react";
import { Modal, Button, Form } from 'react-bootstrap';

const DeleteTenantRoleModal = ({ show, handleClose, handleDeleteTenantRole }) => {

  return (
    <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Deletion</Modal.Title>
          </Modal.Header>

          <Modal.Body>Are you sure you want to delete this tenant role?</Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteTenantRole}>
              Delete
            </Button>
          </Modal.Footer>
    </Modal>
  );
};

export default DeleteTenantRoleModal;
