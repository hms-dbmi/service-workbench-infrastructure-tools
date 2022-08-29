const AWS = require('aws-sdk');
const { registration: reg } = require('../src/handler');

const putMock = jest.fn();

jest.mock("aws-sdk");
AWS.DynamoDB.DocumentClient.prototype.put.mockImplementation(params => ({ promise: () => putMock(params) }));

const logger = {};
const validateInputMock = jest.fn();
const uuidMock = jest.fn();

process.env.USER_TABLE = 'Users';
process.env.USER_REASON = 'Testing';
process.env.USER_POOL = 'some pool id';
process.env.IDP_NAME = 'Test IDP';

describe('registerUser', () => {
  let registerUser;
  const testData = {
    firstName: 'Test',
    lastName: 'Tester',
    email: 'test@email.com'
  };
  const testUuid = '12345';
  const validationError = ['Some validation error'];
  const validationSuccess = [];
  const databaseError = new Error('Some database error');
  
  beforeAll(() => {
    jest.useFakeTimers('modern');
    jest.setSystemTime(new Date(1466424490000));
  });
  beforeEach(() => {
    // capture and print nothing
    logger.info = jest.spyOn(console, 'log').mockImplementation(() => {});
    logger.error = jest.spyOn(console, 'error').mockImplementation(() => {});

    uuidMock.mockReturnValue(testUuid);
    registerUser = data => reg(data, validateInputMock, uuidMock);
  });

  it('should not throw an error', async () => {
    validateInputMock.mockReturnValue(validationSuccess);
    putMock.mockResolvedValueOnce();
    expect(() => registerUser(testData)).not.toThrowError();
  });
  it('should attempt to add user to the database with correct params', async () => {
    putMock.mockResolvedValueOnce();
    await registerUser(testData);
    expect(validateInputMock).toHaveBeenCalled();
    expect(putMock).toHaveBeenCalled();
    expect(putMock.mock.calls).toMatchSnapshot();
  });

  // it('should try to get the database parameters with the correct input arguments')

  // Status
  it('should return status 200 on success', async () => {
    validateInputMock.mockReturnValue(validationSuccess);
    putMock.mockResolvedValueOnce();
    const response = await registerUser(testData);
    expect(response.statusCode).toEqual(200);
  });
  it('should return status 400 on validation error', async () => {
    validateInputMock.mockReturnValue(validationError);
    const response = await registerUser(testData);
    expect(response.statusCode).toEqual(400);
  });
  it('should return status 500 on database error', async () => {
    validateInputMock.mockReturnValue(validationSuccess);
    putMock.mockRejectedValueOnce(databaseError);
    const response = await registerUser(testData);
    expect(response.statusCode).toEqual(500);
  });

  // Body
  it('should return a message on success', async () => {
    validateInputMock.mockReturnValue(validationSuccess);
    putMock.mockResolvedValueOnce();
    const response = await registerUser(testData);
    expect(response.body).toMatchSnapshot();
  });
  it('should return an error on validation failure', async () => {
    validateInputMock.mockReturnValue(validationError);
    const response = await registerUser(testData);
    expect(response.body).toMatchSnapshot();
  });
  it('should return an error on database failure', async () => {
    validateInputMock.mockReturnValue(validationSuccess);
    putMock.mockRejectedValueOnce(databaseError);
    const response = await registerUser(testData);
    expect(response.body).toMatchSnapshot();
  });

  // Logging
  it('should log the user id that was successfull created', async () => {
    validateInputMock.mockReturnValue(validationSuccess);
    putMock.mockResolvedValueOnce();
    await registerUser(testData);
    expect(JSON.stringify(logger.info.mock.calls).includes(testUuid)).toBeTruthy();
    expect(JSON.stringify(logger.info.mock.calls)).toMatchSnapshot();
  });
  it('should log error message on validation failure', async () => {
    validateInputMock.mockReturnValue(validationError);
    await registerUser(testData);
    expect(JSON.stringify(logger.error.mock.calls)).toMatchSnapshot();
  });
  it('should log error message on database failure', async () => {
    validateInputMock.mockReturnValue(validationSuccess);
    putMock.mockRejectedValueOnce(databaseError);
    await registerUser(testData);
    expect(JSON.stringify(logger.error.mock.calls)).toMatchSnapshot();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  afterAll(() => {
    jest.useRealTimers();
  });
});
