import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from 'prisma/client';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'GET': {
      const appointments = await prisma.appointment.findMany();
      res.status(200).json(appointments);
      break;
    }
    case 'POST': {
      let { patientId, practitionerId, startDate, endDate } = JSON.parse(
        req.body,
      );
      const appointment = await prisma.appointment.create({
        data: {
          patientId: parseInt(patientId),
          practitionerId: parseInt(practitionerId),
          startDate: startDate,
          endDate: endDate,
        },
      });
      res.status(200).json(appointment);
      break;
    }
    case 'DELETE': {
      const deleteAppointment = await prisma.appointment.delete({
        where: {
          id: +req.query.id,
        },
      });
      res.status(200).json(deleteAppointment);
      break;
    }
    case 'PATCH': {
      let { patientId, practitionerId, startDate, endDate, id } = JSON.parse(
        req.body,
      );
      const updateAppointment = await prisma.appointment.update({
        where: {
          id: +req.query.id,
        },
        data: {
          patientId: parseInt(patientId),
          practitionerId: parseInt(practitionerId),
          id: parseInt(id),
          startDate: startDate,
          endDate: endDate,
        },
      });
      res.status(200).json(updateAppointment);
      break;
    }
  }
};
