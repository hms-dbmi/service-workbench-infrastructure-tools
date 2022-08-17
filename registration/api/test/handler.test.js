const AWS = require('aws-sdk');
const { registration: reg } = require('../src/handler');

jest.mock("aws-sdk");
const putItemMock = jest.fn();
AWS.DynamoDB.prototype.putItem = jest.fn().mockImplementation(params => ({
  promise: () => putItemMock(params)
}));

const logger = {};
const validateInputMock = jest.fn();
const getUserParamsMock = jest.fn();
const uuidMock = jest.fn();

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
    getUserParamsMock.mockImplementation(x => ({ 'getUserParams': x }));
    registerUser = data => reg(data, validateInputMock, getUserParamsMock, uuidMock);
  });

  it('should not throw an error', async () => {
    validateInputMock.mockReturnValue(validationSuccess);
    putItemMock.mockResolvedValueOnce();
    expect(() => registerUser(testData)).not.toThrowError();
  });
  it('should attempt to add user to the database with correct params', async () => {
    putItemMock.mockResolvedValueOnce();
    await registerUser(testData);
    expect(validateInputMock).toHaveBeenCalled();
    expect(getUserParamsMock).toHaveBeenCalled();
    expect(putItemMock).toHaveBeenCalled();
    expect(putItemMock.mock.calls).toMatchSnapshot();
  });

  // it('should try to get the database parameters with the correct input arguments')

  // Status
  it('should return status 200 on success', async () => {
    validateInputMock.mockReturnValue(validationSuccess);
    putItemMock.mockResolvedValueOnce();
    const response = await registerUser(testData);
    expect(response.statusCode).toEqual(200);
  });
  it('should return status 400 on validation error', async () => {
    // logger.info = jest.spyOn(console, 'log');
    validateInputMock.mockReturnValue(validationError);
    const response = await registerUser(testData);
    expect(response.statusCode).toEqual(400);
  });
  it('should return status 500 on database error', async () => {
    validateInputMock.mockReturnValue(validationSuccess);
    putItemMock.mockRejectedValueOnce(databaseError);
    const response = await registerUser(testData);
    expect(response.statusCode).toEqual(500);
  });

  // Body
  it('should return a message on success', async () => {
    validateInputMock.mockReturnValue(validationSuccess);
    putItemMock.mockResolvedValueOnce();
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
    putItemMock.mockRejectedValueOnce(databaseError);
    const response = await registerUser(testData);
    expect(response.body).toMatchSnapshot();
  });

  // Logging
  it('should log the user id that was successfull created', async () => {
    validateInputMock.mockReturnValue(validationSuccess);
    putItemMock.mockResolvedValueOnce();
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
    putItemMock.mockRejectedValueOnce(databaseError);
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
