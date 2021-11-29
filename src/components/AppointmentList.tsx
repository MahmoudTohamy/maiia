import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import CloseIcon from '@material-ui/icons/Close';
import EditIcon from '@material-ui/icons/Edit';
import Modal from '@material-ui/core/Modal';
import {
  getAppointments,
  appointmentsSelectors,
  deleteAppointment,
  updateAppointment,
} from 'store/appointments';
import { practitionersSelectors } from 'store/practitioners';
import { patientsSelectors } from 'store/patients';
import { getAvailabilities } from 'store/availabilities';
import { formatDateRange } from 'utils/date';
import config from 'config';
import Form from './Form';
import { Appointment } from '.prisma/client';
import SharedModal from './SharedModal';

const SERVER_API_ENDPOINT = config.get('SERVER_API_ENDPOING', '/api');
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    modal: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  }),
);
interface ModifiedAppointment {
  id: number;
  patientId: number;
  practitionerId: number;
  startDate: Date;
  endDate: Date;
  patientName: String;
  practitionerName: String;
}

interface modalObject {
  deleteModal: boolean;
  editModal: boolean;
  sharedModal: boolean;
}
const AppointmentList = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [isOpen, setOpen] = useState<modalObject>({
    deleteModal: false,
    editModal: false,
    sharedModal: false,
  });
  const [modalMsg, setModalMsg] = useState<string>();
  const [selectedAppointment, setAppointment] = useState<Appointment>();
  const [modifiedAppointments, setAppointments] = useState<ModifiedAppointment>(
    [],
  );
  const [
    modifiedAppointmentsClone,
    setAppointmentsClone,
  ] = useState<ModifiedAppointment>([]);
  const appointments = useSelector((state) =>
    appointmentsSelectors.selectAll(state.appointments),
  );
  const practitioners = useSelector((state) =>
    practitionersSelectors.selectAll(state.practitioners),
  );
  const patients = useSelector((state) =>
    patientsSelectors.selectAll(state.patients),
  );
  useEffect(() => {
    dispatch(getAppointments());
  }, []);
  useEffect(() => {
    // here I check if all the practitioners, patients, and appointments have data
    //  then I modify the appointments data to add the patient name and the practitioner name
    if (practitioners.length && patients.length && appointments.length) {
      let modifiedAppointments: ModifiedAppointment[] = appointments?.map(
        (appointment) => {
          let appointmentClone: ModifiedAppointment = { ...appointment };
          let selectedPatient = patients.find(
            (patient) => patient.id === appointment.patientId,
          );
          let selectedPractitioner = practitioners.find(
            (practitioner) => practitioner.id === appointment.practitionerId,
          );

          appointmentClone.patientName = `${selectedPatient?.firstName} ${selectedPatient?.lastName}`;
          appointmentClone.practitionerName = `${selectedPractitioner?.firstName} ${selectedPractitioner?.lastName}`;
          return appointmentClone;
        },
      );
      setAppointmentsClone(modifiedAppointments);
      setAppointments(modifiedAppointments);
    }
    if (appointments.length === 0) {
      setAppointments([]);
    }
  }, [appointments, patients, practitioners]);
  const deleteSelectedAppointment = async () => {
    // here i make the api call if the status is 200 then parse the response and dispatch it else I dispatch the error msg and set the modal msg
    let msg = '';
    try {
      const response = await fetch(
        `${SERVER_API_ENDPOINT}/appointments?id=${selectedAppointment.id}`,
        { method: 'DELETE' },
      );
      if (response.status === 200) {
        const parsedResponse = await response.json();
        dispatch(deleteAppointment(parsedResponse));

        msg = 'The appointment has been deleted';
      } else {
        msg = `An error has occurred  : ${response.statusText}`;
        dispatch(deleteAppointment(response.statusText));
      }
    } catch (error) {
      msg = `An error has occurred  : ${error}`;
      dispatch(deleteAppointment(error));
    }
    setModalMsg(msg);
    setOpen({ ...isOpen, deleteModal: false, sharedModal: true });
  };
  const toggleModal = (stateName: string) => {
    setOpen({ ...isOpen, [stateName]: !isOpen[stateName] });
  };
  const saveAppointmentData = async (
    appointmentData: Appointment,
    modalName: string,
  ) => {
    setAppointment(appointmentData);
    if (modalName === 'editModal') {
      let response = await dispatch(
        getAvailabilities(appointmentData.practitionerId),
      );
    }

    toggleModal(modalName);
  };
  const update = async (appointmentData) => {
    // here i make the api call if the status is 200 then parse the response and dispatch it else I dispatch the error msg and set the modal msg
    let msg = '';
    try {
      const response = await fetch(
        `${SERVER_API_ENDPOINT}/appointments?id=${selectedAppointment.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            ...appointmentData,
            id: selectedAppointment.id,
          }),
        },
      );
      if (response.status === 200) {
        const parsedResponse = await response.json();
        dispatch(updateAppointment(parsedResponse));

        msg = 'The appointment has been updated';
      } else {
        msg = `An error has occurred  : ${response.statusText}`;
        dispatch(updateAppointment(response.statusText));
      }
    } catch (error) {
      msg = `An error has occurred  : ${error}`;
      dispatch(updateAppointment(error));
    }
    setModalMsg(msg);
    setOpen({ ...isOpen, editModal: false, sharedModal: true });
  };
  const saveSearchResult = (searchValue: string) => {
    // here i check if the appointment patient or practitioner names has any of the search value
    setAppointments(
      modifiedAppointmentsClone.filter(
        (appointment) =>
          appointment.patientName
            .toLowerCase()
            .includes(searchValue.toLowerCase()) ||
          appointment.practitionerName
            .toLowerCase()
            .includes(searchValue.toLowerCase()),
      ),
    );
  };
  const renderDeleteModal = (appointment: Appointment) => {
    return (
      <Modal
        className={classes.modal}
        open={isOpen.deleteModal && appointment.id === selectedAppointment.id}
        onClose={() => toggleModal('deleteModal')}
      >
        <div className="appointment-list-container__row__delete-modal-conatiner">
          <CloseIcon
            className="appointment-list-container__row__delete-modal-conatiner__closeIcon"
            onClick={() => toggleModal('deleteModal')}
          />
          <span>Are you sure you want to delete this appointmnet ?</span>
          <div className="appointment-list-container__row__delete-modal-conatiner__btns-container">
            <button onClick={() => toggleModal('deleteModal')}>Cancele</button>
            <button onClick={() => deleteSelectedAppointment()}>Delete</button>
          </div>
        </div>
      </Modal>
    );
  };

  const renderEditModal = (appointment: Appointment) => {
    return (
      <Modal
        className={classes.modal}
        open={isOpen.editModal && appointment.id === selectedAppointment.id}
        onClose={() => toggleModal('editModal')}
      >
        <div className="appointment-list-container__row__edit-modal-conatiner">
          <CloseIcon
            className="appointment-list-container__row__edit-modal-conatiner__closeIcon"
            onClick={() => toggleModal('editModal')}
          />
          <Form
            submitAction={update}
            practitionerId={selectedAppointment?.practitionerId}
            patientId={selectedAppointment?.patientId}
            startDate={selectedAppointment?.startDate}
            endDate={selectedAppointment?.endDate}
            isRequired={false}
            submitText={'Update'}
          />
        </div>
      </Modal>
    );
  };
  return (
    <div className="appointment-list-container">
      {modifiedAppointmentsClone.length ? (
        <div className="appointment-list-container__search-container">
          <span>Search :</span>{' '}
          <input
            onChange={(event) => saveSearchResult(event.target.value)}
            placeholder="Search by practitioner or patient"
          />
        </div>
      ) : null}

      {modifiedAppointments?.map((appointment) => (
        <div key={appointment.id} className="appointment-list-container__row">
          <span className="appointment-list-container__row__practitionerAndPatientNames">
            <b>Practitioner :</b> {appointment.practitionerName}{' '}
          </span>
          <span className="appointment-list-container__row__practitionerAndPatientNames">
            {' '}
            <b>Patient :</b> {appointment.patientName}
          </span>
          <span className="appointment-list-container__row__date">
            <CalendarTodayIcon />{' '}
            {formatDateRange({
              from: new Date(appointment.startDate),
              to: new Date(appointment.endDate),
            })}
          </span>
          <DeleteOutlineIcon
            className="appointment-list-container__row__deleteIcon"
            onClick={() => saveAppointmentData(appointment, 'deleteModal')}
          />
          <EditIcon
            className="appointment-list-container__row__editIcon"
            onClick={() => saveAppointmentData(appointment, 'editModal')}
          />
          {renderEditModal(appointment)}
          {renderDeleteModal(appointment)}
        </div>
      ))}
      <SharedModal
        msg={modalMsg}
        toggleModal={toggleModal}
        stateName="sharedModal"
        isOpen={isOpen.sharedModal}
      />
    </div>
  );
};

export default AppointmentList;
