import { addAppointments, getAppointments } from 'store/appointments';
import config from 'config';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Form from './Form';
import { getpractitioners, practitionersSelectors } from 'store/practitioners';
import { getPatients, patientsSelectors } from 'store/patients';
import SharedModal from './SharedModal';
const SERVER_API_ENDPOINT = config.get('SERVER_API_ENDPOING', '/api');

const AppointmentForm = () => {
  const dispatch = useDispatch();
  const [isOpen, setOPen] = useState<boolean>();
  const [modalMsg, setModalMsg] = useState<string>();
  const toggleModal = () => {
    setOPen(!isOpen);
  };
  useEffect(() => {
    dispatch(getpractitioners());
    dispatch(getPatients());
  }, []);
  const bookAppointment = async (appointmentData) => {
    let msg = '';
    try {
      const response = await fetch(`${SERVER_API_ENDPOINT}/appointments`, {
        method: 'POST',
        body: JSON.stringify(appointmentData),
      });
      if (response.status === 200) {
        const parsedResponse = await response.json();
        msg = 'Appointment has been added';
        dispatch(addAppointments(parsedResponse));
      } else {
        msg = `An error has occurred  : ${response.statusText}`;
        dispatch(addAppointments(response.statusText));
      }
    } catch (error) {
      msg = `An error has occurred  : ${error}`;
      dispatch(addAppointments(error));
    }
    setModalMsg(msg);
    toggleModal();
  };

  return (
    <div className="appointment-form-container">
      <Form
        submitAction={bookAppointment}
        practitionerId={undefined}
        patientId={undefined}
        startDate=""
        endDate=""
        isRequired={true}
        submitText={'Submit'}
      />
      <SharedModal
        msg={modalMsg}
        toggleModal={toggleModal}
        stateName=""
        isOpen={isOpen}
      />
    </div>
  );
};

export default AppointmentForm;
