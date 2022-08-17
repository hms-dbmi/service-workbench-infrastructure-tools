const { validateInput } = require('../validation');

describe('validateInput', () => {
  const testData = {
    firstName: 'Test',
    lastName: 'Tester',
    email: 'test@example.com'
  };
  it('should return no errors on valid user data', () => {
    const response = validateInput(testData);
    expect(response.length).toEqual(0);
  });
  it('should return validation errors on invalid user data', () => {
    const response = validateInput({
      ...testData,
      firstName: 'Test////',
      email: 'bad @email.com'
    });
    expect(response.length).toEqual(2);
  });
  it('should not throw an error', () => {
    let response;
    expect(() => response = validateInput({
      ...testData,
      ['firstName']: undefined
    })).not.toThrowError();
    expect(response.length).toEqual(1);
  });
});