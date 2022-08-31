# service-workbench-infrastructure-tools
AWS lambda functions designed to extend SWB functionality.

# Lambdas

- [Notification to user on account creation, via SES](notification/user)
  - path: `notification/user`
  - lambda name: `swb-tools-user-notification-<stage>`
  - requires: lodash layer
- [Notification to admin on user account creation, via SNS](notification/admin)
  - path: `notification/admin`
  - lambda name: `swb-tools-admin-notification-<stage>`
  - requires: lodash layer
- [User registration API](registration/api)
  - path: `registration/api`
  - lambda name: `swb-tools-registration-api-<stage>`
  - requires: the lodash, uuid, and ajv layers

# Install
This repository uses Node version 16, pnpm, and serverless. Skip or use steps below as you need.

Setup node version 16 using nvm and update npm
```shell
nvm install 16
npm install -g npm@latest
```

Install, configure shell environment for, and update pnpm
```shell
npm install -g pnpm
pnpm setup
pnpm add -g pnpm
```

Install serverless globally
```shell
pnpm add -g serverless
```

Install package dependencies, recursively, to run the handler and tests.
```shell
pnpm -r install
```

# Test & Deploy

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
