const { mockClient } = require('aws-sdk-client-mock');
const { CostExplorer, GetCostAndUsageCommand } = require('@aws-sdk/client-cost-explorer');
const { SNS, PublishCommand } = require('@aws-sdk/client-sns');

const { billingNotification } = require('./handler');
const { byUser, byEnv, none } = require('./handler.test.data');

process.env.PROJECT = 'dev';
process.env.TOPIC_ARN = 'arn:aws:sns:us-east-1:000000000:swb-tools-billing-notification-dev-topic';
process.env.THRESHOLD = 1;
process.env.ENVIRONMENT = 'Dev';

const logger = {};
const snsMock = mockClient(SNS);
const ceMock = mockClient(CostExplorer);

describe('billingNotification', () => {
  beforeEach(() => {
    // capture and print nothing
    logger.info = jest.spyOn(console, "log").mockImplementation(() => { });
    logger.error = jest.spyOn(console, "error").mockImplementation(() => { });
    snsMock.reset();
    ceMock.reset();
  });
  it('should return status 200 on success', async () => {
    ceMock.on(GetCostAndUsageCommand).resolves(none);
    const response = await billingNotification();
    expect(response.statusCode).toEqual(200);
  });
  it('should return status 500 on cost explorer error', async () => {
    ceMock.on(GetCostAndUsageCommand).rejects('Some cost explorer error');
    const response = await billingNotification();
    expect(response.statusCode).toEqual(500);
  });
  it('should return status 500 on sns topic publish error', async () => {
    snsMock.on(PublishCommand).rejects('Some SNS topic publishing emrror');
    const response = await billingNotification();
    expect(response.statusCode).toEqual(500);
  });
  it('should attempt to publish to topic with correct parameters', async () => {
    ceMock.on(GetCostAndUsageCommand)
      .resolvesOnce(byUser)
      .resolvesOnce(byEnv['user-1'])
      .resolvesOnce(byEnv['user-2'])
      .resolvesOnce(byEnv['user-6']);
    await billingNotification();
    expect(snsMock.call(0).args[0].input).toMatchSnapshot();
  });
});