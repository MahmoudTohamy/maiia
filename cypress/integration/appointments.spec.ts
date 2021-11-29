describe('Appointment page', () => {
  before(() => {
    cy.visit('/appointments');
  });
  it('can see the form', () => {
    cy.pick('form').should('be.visible');
  });

  it('Test GET Patients API', () => {
    cy.request('api/patients')
      .should((response) => {
        expect(response.status).to.be.eq(200);
      })
      .its('body')
      .each((value) =>
        expect(value).to.have.all.keys(
          'id',
          'firstName',
          'lastName',
          'birthDate',
        ),
      );
  });
  it('Test GET Practitioner API', () => {
    cy.request('api/practitioners')
      .should((response) => {
        expect(response.status).to.be.eq(200);
      })
      .its('body')
      .each((value) =>
        expect(value).to.have.all.keys(
          'id',
          'firstName',
          'lastName',
          'speciality',
        ),
      );
  });
  it('Test GET Availability API', () => {
    cy.request('api/availabilities?practitionerId=59')
      .should((response) => {
        expect(response.status).to.be.eq(200);
      })
      .its('body')
      .each((value) =>
        expect(value).to.have.all.keys(
          'id',
          'practitionerId',
          'startDate',
          'endDate',
        ),
      );
  });
  it('Test GET Appointments API', () => {
    cy.request('api/appointments')
      .should((response) => {
        expect(response.status).to.be.eq(200);
      })
      .its('body')
      .each((value) =>
        expect(value).to.have.all.keys(
          'id',
          'practitionerId',
          'patientId',
          'startDate',
          'endDate',
        ),
      );
  });
  it('Test POST ,PATCH and DELETE Appointment API', () => {
    cy.request(
      'POST',
      'api/appointments',
      JSON.stringify({
        patientId: 224,
        practitionerId: 60,
        startDate: '2022-06-01T03:45:00.000Z',
        endDate: '2022-06-01T04:00:00.000Z',
      }),
    ).then((response) => {
      let appointmentId = response.body.id;
      expect(response.status).to.be.eq(200);
      expect(response.body).to.have.keys(
        'id',
        'practitionerId',
        'patientId',
        'startDate',
        'endDate',
      );
      cy.request(
        'PATCH',
        `api/appointments?id=${response.body.id}`,
        JSON.stringify({
          patientId: response.body.patientId,
          practitionerId: response.body.practitionerId,
          startDate: response.body.startDate,
          endDate: response.body.endDate,
          id: response.body.id,
        }),
      ).should((response) => {
        expect(response.status).to.be.eq(200);
      });
      cy.request('DELETE', `api/appointments?id=${appointmentId}`).should(
        (response) => {
          expect(response.status).to.be.eq(200);
        },
      );
    });
  });
});
