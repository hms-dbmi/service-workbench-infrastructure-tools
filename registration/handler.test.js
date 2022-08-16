const AWS = require('aws-sdk');
const { registration } = require('./handler');

jest.mock("aws-sdk");
// const publishMock = jest.fn();
// AWS.SNS.prototype.publish = jest.fn().mockImplementation(params => ({
//   promise: () => publishMock(params)
// }));

const logger = {};

// const testRecord = (uid, first, last, email, createdAt, applyReason) => ({
//   dynamodb: {
//     NewImage: {
//       uid: { S: uid },
//       email: { S: email },
//       firstName: { S: first },
//       lastName: { S: last },
//       createdAt: { S: createdAt },
//       applyReason: { S: applyReason }
//     }
//   }
// });

process.env.USER_TABLE = 'arn:aws:dynamodb:<region>:<account>:table/some-table';
const testData = {
  firstName: 'Samantha',
  lastName: 'Piatt',
  email: 'samantha.piatt@childrens.harvard.edu'
};
// process.env.USER_TABLE = "some-table";
// console.log(validateInput({
//   something:'else',
//   // firstName: 'Samantha',
//   firstName: 'Samant/ha',
//   // lastName: 'Piatt',
//   email: 'samantha.piatt@chi;ldrens.harvard.edu'
// }));
// console.log(buildParams({ uid: '213432', firstName: 'Samantha', lastName: 'Piatt', email: 'samantha.piatt@childrens.harvard.edu' }));

 
describe('registration', () => {
  // const user_1 = testRecord('123', 'test', 'tester', 'test@example.com', 'friday', 'I want to test things!');
  // const user_2 = testRecord('234', 'mock', 'mocker', 'mock@example.com', 'thursday', 'Testing is my life');
  // const records = { Records: [ user_1, user_2 ]};
  beforeEach(() => {
    // capture and print nothing
    // logger.info = jest.spyOn(console, "log").mockImplementation(() => {});
    // logger.error = jest.spyOn(console, "error").mockImplementation(() => {});
  });
  
  it.skip('should return status 200 on success', async () => {
    publishMock.mockResolvedValueOnce();
    const response = await notification(records);
    expect(response.statusCode).toEqual(200);
  });
  it.skip('should return status 500 on error', async () => {
    publishMock.mockRejectedValueOnce(new Error('Some SNS topic publishing error'));
    const response = await notification(records);
    expect(response.statusCode).toEqual(500);
  });
  it.skip('should return a message on success', async () => {
    publishMock.mockResolvedValueOnce();
    const response = await notification(records);
    expect(response.body).toMatchSnapshot();
  });
  it.skip('should return the error on failure', async () => {
    publishMock.mockRejectedValueOnce(new Error('Some SNS topic publishing error'));
    const response = await notification(records);
    expect(response.body).toMatchSnapshot();
  });
  it.skip('should log the user ids that were registered', async () => {
    publishMock.mockResolvedValueOnce();
    await notification(records);
    expect(JSON.stringify(logger.info.mock.calls).includes('123, 234')).toBeTruthy();
  });
  it.skip('should log success message', async () => {
    publishMock.mockResolvedValueOnce();
    await notification(records);
    expect(JSON.stringify(logger.info.mock.calls)).toMatchSnapshot();
  });
  it.skip('should log error message on failure', async () => {
    publishMock.mockRejectedValueOnce(new Error('Some SNS topic publishing error'));
    await notification(records);
    expect(JSON.stringify(logger.error.mock.calls)).toMatchSnapshot();
  });
  it.skip('should attempt to publish to the topic one time with all users', async () => {
    publishMock.mockResolvedValueOnce();
    await notification(records);
    expect(publishMock).toHaveBeenCalledTimes(1);
  });
  it.skip('should attempt to publish to topic with correct parameters', async () => {
    publishMock.mockResolvedValueOnce();
    await notification(records);
    expect(publishMock.mock.calls).toMatchSnapshot();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
