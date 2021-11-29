describe('Timeslots page', () => {
  before(() => {
    cy.visit('/timeslots');
  });

  it('can see the intro section', () => {
    cy.pick('intro').should('be.visible');
  });

  it('can see the time slot list', () => {
    cy.pick('timeslot-list').should('be.visible');
    cy.pick('timeslot-list').get('.timeslot-item').should('have.length', 30);
  });
  it('Test GET time slots API', () => {
    cy.request('api/timeslots')
      .should((response) => {
        expect(response.status).to.be.eq(200);
      })
      .its('body')
      .each((value) =>
        expect(value).to.have.all.keys(
          'id',
          'practitionerId',
          'endDate',
          'startDate',
        ),
      );
  });
});
