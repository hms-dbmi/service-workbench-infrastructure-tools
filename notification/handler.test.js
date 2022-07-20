const AWS = require('aws-sdk');
const { activation } = require('./handler');

jest.mock("aws-sdk");
const sendEmailMock = jest.fn();
AWS.SES.prototype.sendTemplatedEmail = jest.fn().mockImplementation(params => ({
  promise: () => sendEmailMock(params)
}));

const logger = {};

const testRecord = (uid, first, last, email, at, by) => ({
  dynamodb: {
    NewImage: {
      uid: { S: uid },
      firstName: { S: first },
      lastName: { S: last },
      email: { S: email },
      updatedAt: { S: at },
      updatedBy: { S: by }
    }
  }
});

process.env.TEMPLATE = 'some-template-name';
process.env.FROM_EMAIL = 'some@email.com';
process.env.FROM_NAME = 'Someone';
 
describe('activation', () => {
  const user_1 = testRecord('1234', 'test', 'tester', 'test@example.com', 'friday', 'adminion');
  const user_2 = testRecord('2345', 'mock', 'mocker', 'mock@example.com', 'thursday', 'adminion');
  const user_error = testRecord('0000', 'error', 'mocker', 'error@example.com', 'saturday', 'adminion');
  const records = { Records: [ user_1, user_2 ]};
  beforeEach(() => {
    // capture and print nothing
    logger.info = jest.spyOn(console, "log").mockImplementation(() => {});
    logger.error = jest.spyOn(console, "error").mockImplementation(() => {});
  });
  it('should return status 200', async () => {
    sendEmailMock.mockResolvedValueOnce({ MessageId: '535' });
    sendEmailMock.mockResolvedValueOnce({ MessageId: '536' });
    const response = await activation(records);
    expect(response.statusCode).toEqual(200);
  });
  it('should return an empty body object on complete', async () => {
    sendEmailMock.mockResolvedValueOnce({ MessageId: '535' });
    sendEmailMock.mockResolvedValueOnce({ MessageId: '536' });
    const response = await activation(records);
    expect(response.body).toEqual({});
  });
  it('should log the user ids that were activated', async () => {
    sendEmailMock.mockResolvedValueOnce({ MessageId: '535' });
    sendEmailMock.mockResolvedValueOnce({ MessageId: '536' });
    await activation(records);
    expect(logger.info.mock.lastCall).toMatchSnapshot();
  });
  it('should attempt to send an email for each activated user', async () => {
    sendEmailMock.mockResolvedValueOnce({ MessageId: '535' });
    sendEmailMock.mockResolvedValueOnce({ MessageId: '536' });
    await activation(records);
    expect(sendEmailMock).toHaveBeenCalledTimes(2);
  });
  it('should attempt to send an email with correct parameters', async () => {
    sendEmailMock.mockResolvedValueOnce({ MessageId: '535' });
    sendEmailMock.mockResolvedValueOnce({ MessageId: '536' });
    await activation(records);
    expect(sendEmailMock.mock.calls).toMatchSnapshot();
  });
  it('should log any email send errors', async () => {
    sendEmailMock.mockResolvedValueOnce({ MessageId: '535' });
    sendEmailMock.mockRejectedValueOnce(new Error('Some error'));
    await activation(records);
    expect(logger.error.mock.lastCall).toMatchSnapshot();
  });
  it('should return an error message in body if any record send fails', async () => {
    const testRecords = { Records: [ user_error, user_1, user_2 ]};
    sendEmailMock.mockRejectedValueOnce(new Error('Some error'));
    sendEmailMock.mockResolvedValueOnce({ MessageId: '535' });
    sendEmailMock.mockResolvedValueOnce({ MessageId: '536' });
    const response = await activation(testRecords);
    expect(response.body).toMatchSnapshot();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
});
