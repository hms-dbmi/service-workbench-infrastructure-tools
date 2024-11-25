const AWS = require('aws-sdk');
const { notification } = require('./handler');

jest.mock("aws-sdk");
const publishMock = jest.fn();
AWS.SNS.prototype.publish = jest.fn().mockImplementation(params => ({
  promise: () => publishMock(params)
}));

const logger = {};

const testRecord = (uid, first, last, email, affiliation, piName, projectName, aaProjectName, aaProjectId, dataSources, createdAt) => ({
  dynamodb: {
    NewImage: {
      uid: { S: uid },
      email: { S: email },
      firstName: { S: first },
      lastName: { S: last },
      affiliation: { S: affiliation },
      piName: { S: piName },
      projectName: { S: projectName },
      aaProjectName: { S: aaProjectName },
      aaProjectId: { S: aaProjectId },
      dataSources: { SS: dataSources },
      createdAt: { S: createdAt }
    }
  }
});

process.env.TOPIC_ARN = 'arn:aws:sns:us-east-1:<account>:<topic>';
process.env.SUBJECT = 'Some SNS event subject';
 
describe('notification', () => {
  const user_1 = testRecord('123', 'test', 'tester', 'test@example.com', 'affiliation', 'pi', 'project', 'project1', 'proj1', ['source1', 'source2'], 'friday');
  const user_2 = testRecord('234', 'mock', 'mocker', 'mock@example.com', 'affiliation', 'pi', 'project', 'project2', 'proj2', ['source1', 'source2'], 'thursday');
  const records = { Records: [ user_1, user_2 ]};
  beforeEach(() => {
    // capture and print nothing
    logger.info = jest.spyOn(console, "log").mockImplementation(() => {});
    logger.error = jest.spyOn(console, "error").mockImplementation(() => {});
  });
  
  it('should return status 200 on success', async () => {
    publishMock.mockResolvedValueOnce();
    const response = await notification(records);
    expect(response.statusCode).toEqual(200);
  });
  it('should return status 500 on error', async () => {
    publishMock.mockRejectedValueOnce(new Error('Some SNS topic publishing error'));
    const response = await notification(records);
    expect(response.statusCode).toEqual(500);
  });
  it('should return a message on success', async () => {
    publishMock.mockResolvedValueOnce();
    const response = await notification(records);
    expect(response.body).toMatchSnapshot();
  });
  it('should return the error on failure', async () => {
    publishMock.mockRejectedValueOnce(new Error('Some SNS topic publishing error'));
    const response = await notification(records);
    expect(response.body).toMatchSnapshot();
  });
  it('should log the user ids that were registered', async () => {
    publishMock.mockResolvedValueOnce();
    await notification(records);
    expect(JSON.stringify(logger.info.mock.calls).includes('123, 234')).toBeTruthy();
  });
  it('should log success message', async () => {
    publishMock.mockResolvedValueOnce();
    await notification(records);
    expect(JSON.stringify(logger.info.mock.calls)).toMatchSnapshot();
  });
  it('should log error message on failure', async () => {
    publishMock.mockRejectedValueOnce(new Error('Some SNS topic publishing error'));
    await notification(records);
    expect(JSON.stringify(logger.error.mock.calls)).toMatchSnapshot();
  });
  it('should attempt to publish to the topic one time with all users', async () => {
    publishMock.mockResolvedValueOnce();
    await notification(records);
    expect(publishMock).toHaveBeenCalledTimes(1);
  });
  it('should attempt to publish to topic with correct parameters', async () => {
    publishMock.mockResolvedValueOnce();
    await notification(records);
    expect(publishMock.mock.calls).toMatchSnapshot();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
