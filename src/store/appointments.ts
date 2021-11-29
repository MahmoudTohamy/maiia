import { Appointment } from '.prisma/client';
import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  current,
} from '@reduxjs/toolkit';
import config from 'config';

const SERVER_API_ENDPOINT = config.get('SERVER_API_ENDPOING', '/api');

export const getAppointments = createAsyncThunk('appointments', async () => {
  const response = await fetch(`${SERVER_API_ENDPOINT}/appointments`);
  const parsedResponse = await response.json();

  return parsedResponse as Appointment[];
});

const appointmentsAdapter = createEntityAdapter<Appointment>({
  sortComparer: (a, b) =>
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
});
export const appointmentsSelectors = appointmentsAdapter.getSelectors();

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState: appointmentsAdapter.getInitialState({
    loading: false,
    error: null,
  }),
  reducers: {
    // here in all reducers i  get clone of the state then check if the pauload has id then the status is success
    // and then update ,delete or add  the appointment by the data in the payload if not then save the error msg

    deleteAppointment(state, action) {
      let stateClone = { ...current(state) };
      if (action.payload.id) {
        stateClone.ids = stateClone.ids.filter(
          (id) => id !== action.payload.id,
        );

        let entities = { ...stateClone.entities };
        delete entities[action.payload.id];
        stateClone.entities = entities;

        return stateClone;
      } else {
        return { ...stateClone, error: action.payload };
      }
    },
    addAppointments(state, action) {
      let stateClone = { ...current(state) };
      if (action.payload.id) {
        stateClone.ids = [...stateClone.ids, action.payload.id];
        let entities = { ...stateClone.entities };
        entities = { ...entities, [action.payload.id]: action.payload };
        stateClone.entities = entities;

        return stateClone;
      } else {
        return { ...stateClone, error: action.payload };
      }
    },
    updateAppointment(state, action) {
      let stateClone = { ...current(state) };
      if (action.payload.id) {
        let entities = { ...stateClone.entities };
        entities = { ...entities, [action.payload.id]: action.payload };
        stateClone.entities = entities;

        return stateClone;
      } else {
        return { ...stateClone, error: action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAppointments.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAppointments.fulfilled, (state, action) => {
        appointmentsAdapter.setAll(state, action.payload);

        state.error = null;
        state.loading = false;
      })
      .addCase(getAppointments.rejected, (state, action) => {
        state.error = action.error;
        state.loading = false;
      });
  },
});
export const {
  deleteAppointment,
  addAppointments,
  updateAppointment,
} = appointmentsSlice.actions;
export default appointmentsSlice;
