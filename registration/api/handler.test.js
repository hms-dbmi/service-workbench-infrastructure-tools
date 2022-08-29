const AWS = require('aws-sdk');
const uuid = require('uuid');
const { registerUser } = require('./handler');

const putMock = jest.fn();
jest.mock("aws-sdk");
AWS.DynamoDB.DocumentClient.prototype.put.mockImplementation(params => ({ promise: () => putMock(params) }));

jest.mock('uuid/v4');

const logger = {};
const cbMock = jest.fn();

process.env.USER_TABLE = 'Users';
process.env.USER_REASON = 'Testing';
process.env.USER_POOL = 'some pool id';
process.env.IDP_NAME = 'Test IDP';

describe('registerUser', () => {
  const testEvent = {
    body: JSON.stringify({
      firstName: 'Test',
      lastName: 'Tester',
      email: 'test@email.com'
    })
  };
  const testUuid = '12345';
  const databaseError = new Error('Some database error');
  
  beforeAll(() => {
    jest.useFakeTimers('modern');
    jest.setSystemTime(new Date(1466424490000));
  });
  beforeEach(() => {
    // capture and print nothing
    logger.info = jest.spyOn(console, 'log').mockImplementation(() => {});
    logger.error = jest.spyOn(console, 'error').mockImplementation(() => {});

    uuid.mockReturnValue(testUuid);
    // uuidMock = jest.spyOn(uuid, 'v4').mockReturnValue(testUuid);

    cbMock.mockImplementation((error, response) => ({ error, response }));
  });

  it('should not throw an error', async () => {
    putMock.mockResolvedValueOnce();
    expect(registerUser(testEvent)).resolves.not.toThrow();
  });
  it('should attempt to add user to the database with correct params', async () => {
    putMock.mockResolvedValueOnce();
    await registerUser(testEvent);
    expect(putMock).toHaveBeenCalled();
    expect(putMock.mock.calls).toMatchSnapshot();
  });

  it('should return status 200 on success', async () => {
    putMock.mockResolvedValueOnce();
    const response = await registerUser(testEvent);
    expect(response.statusCode).toEqual(200);
  });
  it('should return a message on success', async () => {
    putMock.mockResolvedValueOnce();
    const response = await registerUser(testEvent);
    expect(response.body).toMatchSnapshot();
  });
  it('should throw an error on db error', async () => {
    putMock.mockRejectedValueOnce(databaseError);
    expect(registerUser(testEvent)).rejects.toThrow();
  });

  // Logging
  it('should log the user id that was successfull created', async () => {
    putMock.mockResolvedValueOnce();
    await registerUser(testEvent);
    expect(JSON.stringify(logger.info.mock.calls).includes(testUuid)).toBeTruthy();
    expect(JSON.stringify(logger.info.mock.calls)).toMatchSnapshot();
  });
  it('should log error message on database failure', async () => {
    putMock.mockRejectedValueOnce(databaseError);
    try { await registerUser(testEvent); }
    catch (e) {}
    expect(JSON.stringify(logger.error.mock.calls)).toMatchSnapshot();
  });

  // it('should try to get the database parameters with the correct input arguments')

  afterEach(() => {
    jest.clearAllMocks();
  });
  afterAll(() => {
    jest.useRealTimers();
  });
});
