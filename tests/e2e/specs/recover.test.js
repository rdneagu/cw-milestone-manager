// https://docs.cypress.io/api/introduction/api.html

describe('Account recovery', () => {
  it('copies the code into the recovery box', () => {
    cy.visit('/?recovery=e2e_test');
    cy.wait(2000);
    cy.get('input#code').should('have.value', 'e2e_test');
  });
});
