const AWS = require('aws-sdk');
const { billingNotification } = require('./handler');
const { byUser, byEnv, none } = require('./handler.test.data');
jest.mock("aws-sdk");

const logger = {};

process.env.PROJECT = 'dev';
process.env.TOPIC_ARN = 'arn:aws:sns:us-east-1:000000000:swb-tools-billing-notification-dev-topic';
process.env.THRESHOLD = 1;
process.env.ENVIRONMENT = 'Dev';

const publishMock = jest.fn();
AWS.SNS.prototype.publish = jest.fn().mockImplementation(params => ({
  promise: () => publishMock(params)
}));

const getCostAndUsageMock = jest.fn();
AWS.CostExplorer.prototype.getCostAndUsage = jest.fn().mockImplementation(params => ({
  promise: () => getCostAndUsageMock(params)
}));

describe('billingNotification', () => {
  beforeEach(() => {
    // capture and print nothing
    logger.info = jest.spyOn(console, "log").mockImplementation(() => { });
    logger.error = jest.spyOn(console, "error").mockImplementation(() => { });
  });
  it('should return status 200 on success', async () => {
    getCostAndUsageMock.mockResolvedValueOnce(none);
    const response = await billingNotification();
    expect(response.statusCode).toEqual(200);
  });
  it('should return status 500 on cost explorer error', async () => {
    getCostAndUsageMock.mockRejectedValueOnce(new Error('Some SNS topic publishing error'));
    const response = await billingNotification();
    expect(response.statusCode).toEqual(500);
  });
  it('should return status 500 on sns topic publish error', async () => {
    publishMock.mockRejectedValueOnce(new Error('Some SNS topic publishing error'));
    const response = await billingNotification();
    expect(response.statusCode).toEqual(500);
  });
  it('should attempt to publish to topic with correct parameters', async () => {
    getCostAndUsageMock.mockResolvedValueOnce(byUser);
    getCostAndUsageMock.mockResolvedValueOnce(byEnv['user-1']);
    getCostAndUsageMock.mockResolvedValueOnce(byEnv['user-2']);
    getCostAndUsageMock.mockResolvedValueOnce(byEnv['user-6']);
    await billingNotification();
    expect(publishMock.mock.calls).toMatchSnapshot();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
});