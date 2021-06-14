// https://docs.cypress.io/api/introduction/api.html

describe('Account Registration', () => {
  it('opens the register form', () => {
    cy.visit('/');
    cy.get('.button.btn-show-register').click();
    cy.wait(1000);
    cy.get('#form-register').should('exist');
  });

  it('has the correct password type for the password fields in the register form', () => {
    cy.get('input#password').should('have.attr', 'type', 'password');
    cy.get('input#confirmPassword').should('have.attr', 'type', 'password');
  });

  const ts = Date.now();
  const username = `e2e${ts}`;
  const password = '123456';
  const email = `e2e${ts}@cy.com`;

  it('can type in the form fields', () => {
    cy.get('input#username').type(`${username}$`).should('have.value', `${username}$`);
    cy.get('input#password').type('123').should('have.value', '123');
    cy.get('input#confirmPassword').type('123456').should('have.value', '123456');
    cy.get('input#email').type('asd').should('have.value', 'asd');
    cy.get('input#confirmEmail').type('asd123').should('have.value', 'asd123');
  });

  it('has validation errors for all fields in register form', () => {
    cy.get('.button.btn-register').click();
    cy.get('.input-wrapper#input-username').find('.error').should('exist');
    cy.get('.input-wrapper#input-password').find('.error').should('exist');
    cy.get('.input-wrapper#input-confirmPassword').find('.error').should('exist');
    cy.get('.input-wrapper#input-email').find('.error').should('exist');
    cy.get('.input-wrapper#input-confirmEmail').find('.error').should('exist');
  });

  it('registers a new account', () => {
    cy.get('input#username').clear().type(username);
    cy.get('input#password').clear().type(password);
    cy.get('input#confirmPassword').clear().type(password);
    cy.get('input#email').clear().type(email);
    cy.get('input#confirmEmail').clear().type(email);
    cy.get('.button.btn-register').click();
    cy.wait(1000);
    cy.get('.notification').find('.message').should('contain', `Your account "${username}" has been created`);
  });

  it('opens the login form automatically', () => {
    cy.get('#form-login').should('exist');
  });

  it('login form password field is hiding the text', () => {
    cy.get('input#password').should('have.attr', 'type', 'password');
  });

  it('fills the login form', () => {
    cy.get('input#username').type(username).should('have.value', username);
    cy.get('input#password').type(password).should('have.value', password);
  });

  it('logs in with the fresh account', () => {
    cy.get('.button.btn-login').click();
    cy.wait(1000);
    cy.get('.notification').find('.message').should('contain', `You have been logged in as "${username}"`);
  });
});
