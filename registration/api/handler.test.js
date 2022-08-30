const AWS = require('aws-sdk');
const uuid = require('uuid');
const { registerUser } = require('./handler');

jest.mock('aws-sdk');
jest.mock('uuid');
const putMock = jest.fn();
const queryMock = jest.fn();

process.env.USER_TABLE = 'Users';
process.env.USER_REASON = 'Testing';
process.env.USER_POOL = 'some pool id';
process.env.IDP_NAME = 'Test IDP';

describe('registerUser', () => {
  const logger = {};
  const testEmail = 'test@email.com';
  const testEvent = {
    body: JSON.stringify({
      firstName: 'Test',
      lastName: 'Tester',
      email: testEmail
    })
  };
  const testUuid = '12345';
  const databaseError = new Error('Some database error');
  const userExists = { Count: 1 };
  const userUndefined = { Count: 0 };
  
  beforeAll(() => {
    jest.useFakeTimers('modern');
    jest.setSystemTime(new Date(1466424490000));
  });
  beforeEach(() => {
    AWS.DynamoDB.DocumentClient.prototype.put.mockImplementation(params => ({ promise: () => putMock(params) }));
    AWS.DynamoDB.DocumentClient.prototype.query.mockImplementation(params => ({ promise: () => queryMock(params) }));
    uuid.v4.mockReturnValue(testUuid);

    // capture and print nothing
    logger.info = jest.spyOn(console, 'log').mockImplementation(() => {});
    logger.error = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('user exists', () => {
    it('should attempt to query user with correct params', async () => {
      queryMock.mockResolvedValueOnce(userExists);
      await registerUser(testEvent);
      expect(queryMock).toHaveBeenCalled();
      expect(queryMock.mock.calls).toMatchSnapshot();
    });
    it('should not try to add the user', async () => {
      queryMock.mockResolvedValueOnce(userExists);
      expect(putMock).not.toHaveBeenCalled();
    });
    it('should return correct response', async () => {
      queryMock.mockResolvedValueOnce(userExists);
      const response = await registerUser(testEvent);
      expect(response).toMatchSnapshot();
    });
    it('should log an error message containing email', async () => {
      queryMock.mockResolvedValueOnce(userExists);
      await registerUser(testEvent);
      expect(JSON.stringify(logger.error.mock.calls)).toMatchSnapshot();
      expect(JSON.stringify(logger.error.mock.calls).includes(testEmail)).toBeTruthy();
    });
    it('should not throw an exception', async () => {
      queryMock.mockResolvedValueOnce(userExists);
      expect(registerUser(testEvent)).resolves.not.toThrow();
    });
    
    it('should return correct response on database error', async () => {
      queryMock.mockRejectedValueOnce(databaseError);
      const response = await registerUser(testEvent);
      expect(response).toMatchSnapshot();
    });
    it('should log error message on database error', async () => {
      queryMock.mockRejectedValueOnce(databaseError);
      await registerUser(testEvent);
      expect(JSON.stringify(logger.error.mock.calls)).toMatchSnapshot();
    });
    it('should not throw an exception on database error', async () => {
      queryMock.mockRejectedValueOnce(databaseError);
      expect(registerUser(testEvent)).resolves.not.toThrow();
    });
  });

  describe('user does not exist', () => {
    beforeEach(() => {
      queryMock.mockResolvedValueOnce(userUndefined);
    });
    it('should attempt to add user to the database with correct params', async () => {
      putMock.mockResolvedValueOnce();
      await registerUser(testEvent);
      console.log('DEBUG', putMock.mock.calls);
      expect(putMock).toHaveBeenCalled();
      expect(putMock.mock.calls).toMatchSnapshot();
    });
    it('should return correct response on success', async () => {
      putMock.mockResolvedValueOnce();
      const response = await registerUser(testEvent);
      expect(response).toMatchSnapshot();
    });
    it('should log the user id on success', async () => {
      putMock.mockResolvedValueOnce();
      await registerUser(testEvent);
      expect(JSON.stringify(logger.info.mock.calls)).toMatchSnapshot();
      expect(JSON.stringify(logger.info.mock.calls).includes(testUuid)).toBeTruthy();
    });
    it('should not throw an exception on success', async () => {
      putMock.mockResolvedValueOnce();
      expect(registerUser(testEvent)).resolves.not.toThrow();
    });

    it('should return correct response on database error', async () => {
      putMock.mockRejectedValueOnce(databaseError);
      const response = await registerUser(testEvent);
      expect(response).toMatchSnapshot();
    });
    it('should log error message on database error', async () => {
      putMock.mockRejectedValueOnce(databaseError);
      await registerUser(testEvent);
      expect(JSON.stringify(logger.error.mock.calls)).toMatchSnapshot();
    });
    it('should not throw an exception on database error', async () => {
      putMock.mockRejectedValueOnce(databaseError);
      expect(registerUser(testEvent)).resolves.not.toThrow();
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
  afterAll(() => {
    jest.useRealTimers();
  });
});
