const { getUserParams } = require('../db');

process.env.USER_TABLE = 'some-table';
process.env.USER_REASON = 'testing fun';
process.env.USER_POOL = 'some-user-pool-id';
process.env.IDP_NAME = 'Authorizer';

describe('getUserParams', () => {
  const testData = {
    uid: '12345',
    firstName: 'Test',
    lastName: 'Tester',
    email: 'test@email.com',
    createdAt: '2022-08-17T16:28:33.316Z'
  };

  it('should not throw an error', () => {
    expect(() => getUserParams(testData)).not.toThrowError();
  });

  it('should return correctly formatted object for dynamodb insertion', () => {
    const params = getUserParams(testData);
    expect(params).toMatchSnapshot();
  });
});