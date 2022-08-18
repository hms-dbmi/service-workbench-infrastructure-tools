# service-workbench-infrastructure-tools
AWS lambda functions to extend SWB functionality


# Install
This repository uses Node version 16, pnpm, and serverless. Skip or use steps below as you need.
```shell
# Setup node version 16 using nvm and update npm
nvm install 16
npm install -g npm@latest
```

```shell
# Install, configure shell environment for, and update pnpm
npm install -g pnpm
pnpm setup
pnpm add -g pnpm
```

```shell
# Install serverless globally
pnpm add -g serverless
```

# Test & Deploy
Install package dependencies, recursively, to run the handler and tests.
```shell
pnpm -r install
```

Update your AWS credentials for deployments.
```shell
vi ~/.aws/config
vi ~/.aws/credentials
export AWS_PROFILE=<profile name>
```

Deploy lambda layers, if they have changes or don't already exist.
```shell
cd layers
serverless deploy
```

Create and/or update the config file for the stage you're deploying.
```shell
cp configs/example.yml configs/<stage>.yml
vi configs/<stage>.yml
```

Test new lambda handler changes.
```shell
# all lambdas
pnpm -r test

# specific lambda
cd <lambda> # Example: cd notifications/user
pnpm test
```

Deploy lambdas changes.
```shell
cd <lambda> # Example: cd notifications/user
serverless deploy --stage <stage>
```

# Lambdas
## User account creation - notification to user via SES
name: `swb-tools-user-notification-<stage>`

path: `notifications/user`

requires: lodash layer

Sends an email through SES to the user who's account has been marked as activated through the SWB ui.

### Notes: 
Because this stack did not originate the dynamodb table, it can not add a stream to the table post-deployment. The original stack must be updated to include a stream, or one must be added manually (which could be overwritten on future deployments).
```yaml
# yml file where table is created, like /main/solution/backend/config/infra/cloudformation.yml
Resources:
  # ...

  DbUsers:
    Type: AWS::DynamoDB::Table
    DependsOn: DbPasswords
    Properties:
      TableName: ${self:custom.settings.dbTableUsers}
      # ...

      # these 2 lines create a stream
      StreamSpecification:
        StreamViewType: NEW_AND_OLD_IMAGES

  # ...
```
Find the name of this stream, and add it to a config under `userTableStream`.

**SES Authentication to send email**

The only other things that are needed to send email are related to SES authentication and getting out of the sandbox.
- [Moving out of the Amazon SES sandbox](https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html)
- [Email authentication methods](https://docs.aws.amazon.com/ses/latest/dg/email-authentication-methods.html)
  - [Authenticating Email with DKIM](https://docs.aws.amazon.com/ses/latest/dg/send-email-authentication-dkim.html)
  - [Authenticating Email with SPF](https://docs.aws.amazon.com/ses/latest/dg/send-email-authentication-spf.html)
  - [Using a custom MAIL FROM domain](https://docs.aws.amazon.com/ses/latest/dg/mail-from.html)
- [Receive bounces and complaints with email feedback forwarding](https://docs.aws.amazon.com/ses/latest/dg/monitor-sending-activity-using-notifications-email.html)


## User account creation - notification to admins via SNS
name: `swb-tools-admin-notification-<stage>`

path: `notifications/admin`

requires: lodash layer

Creates an SNS topic and lambda to push notifications of new users who were created by the `_system_` user.


## User Registration API
name: `swb-tools-registration-api-<stage>`

path: `registration/api`

requires" the lodash, uuid, and ajv layers

Registers a new user through api gateway, adding them to the existing users database with pre-populated values for smooth user creation.
