import { Appointment, Patient, Practitioner } from '.prisma/client';
import { useEffect, useState } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { useDispatch, useSelector } from 'react-redux';
import { getpractitioners, practitionersSelectors } from 'store/practitioners';
import { getPatients, patientsSelectors } from 'store/patients';
import { formatDateRange } from 'utils/date';
import {
  getAvailabilities,
  availabilitiesSelectors,
} from 'store/availabilities';
import { withStyles } from '@material-ui/core/styles';
interface IFormInput {
  patientId: number;
  practitionerId: number;
  appointment: Appointment;
}
interface AppointmentData {
  patientId: number;
  practitionerId: number;
  startDate: Date;
  endDate: Date;
}
const StyledSelect = withStyles({
  root: {
    borderRadius: 3,
    height: 33,
    padding: '0 30px',
    border: '1px solid #ddd',
    minWidth: '150px',
    paddingTop: '15px',
  },
})(Select);

type numberOrUndefined = number | undefined;
type appointmentOrUndefined = Appointment | undefined;
interface FormProps {
  submitAction: (AppointmentData) => void;
  practitionerId: numberOrUndefined;
  patientId: numberOrUndefined;
  startDate: Date | string;
  endDate: Date | string;
  isRequired: boolean;
  submitText: string;
}
const Form = ({
  submitAction,
  practitionerId,
  patientId,
  startDate,
  endDate,
  isRequired,
  submitText,
}: FormProps) => {
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    control,
    reset,
    getValues,
  } = useForm<IFormInput>({
    defaultValues: {
      patientId: undefined,
      practitionerId: undefined,
      appointment: undefined,
    },
  });
  const [
    selectedPractitionerId,
    setPractitionerId,
  ] = useState<numberOrUndefined>(practitionerId);
  const [selectedPatientId, setPatientId] = useState<numberOrUndefined>(
    patientId,
  );
  const [
    selectedAppointment,
    setAppointment,
  ] = useState<appointmentOrUndefined>(undefined);
  const practitioners = useSelector((state) =>
    practitionersSelectors.selectAll(state.practitioners),
  );
  const patients = useSelector((state) =>
    patientsSelectors.selectAll(state.patients),
  );
  const availabilities = useSelector((state) =>
    availabilitiesSelectors.selectAll(state.availabilities),
  );

  useEffect(() => {
    if (practitionerId && patientId) {
      let selectedAppointmentData = availabilities.find(
        (singleAppointment) => singleAppointment.startDate == startDate,
      );

      setAppointment(selectedAppointmentData);
    }
  }, []);
  const getSelectedPatient = (patient: Patient) => {
    setPatientId(patient.id);
  };
  const getSelectedAppointment = (appointment: Appointment) => {
    setAppointment(appointment);
  };
  const getSelectedPractitioner = (practitioner: Practitioner) => {
    // here i save the practitioner id then reset the appointment value in the form and get the Availability of this practitioner
    setPractitionerId(practitioner.id);
    reset({ ...getValues(), appointment: null });
    dispatch(getAvailabilities(practitioner.id));
  };

  const prepareTimeFormat = (appointment: Appointment): String => {
    return formatDateRange({
      from: new Date(appointment.startDate),
      to: new Date(appointment.endDate),
    });
  };
  const submit: SubmitHandler<IFormInput> = () => {
    let data: AppointmentData = {
      patientId: selectedPatientId,
      practitionerId: selectedPractitionerId,
      startDate: selectedAppointment.startDate,
      endDate: selectedAppointment.endDate,
    };
    setPractitionerId(undefined);
    setPatientId(undefined);
    setAppointment(undefined);
    reset();
    submitAction(data);
  };
  const renderControllerSelect = (
    label: String,
    name: String,
    options: any,
    value: Number,
    handleChange: Function,
  ) => {
    return (
      <>
        <label>{label}</label>
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <StyledSelect
              label="practitioner"
              value={value ? value : null}
              {...register(name, {
                required: true,
              })}
              className="appointment-form-container__select-container"
            >
              {options.map((option) => (
                <MenuItem
                  key={option.id}
                  value={option.id}
                  onClick={() => handleChange(option)}
                >
                  {name === 'appointment'
                    ? prepareTimeFormat(option)
                    : `${option.firstName} ${option.lastName}`}
                </MenuItem>
              ))}
            </StyledSelect>
          )}
        />
      </>
    );
  };

  return (
    <form onSubmit={handleSubmit(submit)} datacy="form">
      {renderControllerSelect(
        'Practitioner',
        'practitionerId',
        practitioners,
        selectedPractitionerId,
        getSelectedPractitioner,
      )}
      {renderControllerSelect(
        'Patient',
        'patientId',
        patients,
        selectedPatientId,
        getSelectedPatient,
      )}
      {availabilities.length && selectedPractitionerId ? (
        <>
          {renderControllerSelect(
            'Appointment',
            'appointment',
            availabilities,
            selectedAppointment?.id,
            getSelectedAppointment,
          )}
        </>
      ) : null}
      <input type="submit" value={submitText} />
    </form>
  );
};

export default Form;
