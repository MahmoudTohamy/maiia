import React from 'react';
import Modal from '@material-ui/core/Modal';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    modal: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  }),
);

interface ModalProps {
  msg: string;
  toggleModal: (stateName: string) => void;
  stateName: string;
  isOpen: boolean;
}
export default function SharedModal({
  msg,
  toggleModal,
  stateName,
  isOpen,
}: ModalProps) {
  const classes = useStyles();
  return (
    <Modal
      className={classes.modal}
      open={isOpen}
      onClose={() => toggleModal(stateName)}
    >
      <div className="shared-modal-container">
        <CloseIcon
          className="shared-modal-container__closeIcon"
          onClick={() => toggleModal(stateName)}
        />
        <span>{msg}</span>
        <button
          onClick={() => toggleModal(stateName)}
          className="shared-modal-container__okBtn"
        >
          Ok
        </button>
      </div>
    </Modal>
  );
}
