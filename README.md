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
This repository uses Node version 16, pnpm, and serverless.


- Setup node version 16 using nvm and update npm. ***Optional***
  ```shell
  nvm install 16
  npm install -g npm@latest
  ```


- Install pnpm, configure shell environment, and update.

  > **Note:** PNPM is used as the main package manager and it's referenced in some of the serverless files. If you want to change this to a different package manager, you'll have to remove all  the pnpm lock files and replace references to pnpm locally. It is reccomended to not change the package manager for the individual lambda layers from NPM, as this could result in unusual behavior for package imports.

  ```shell
  npm install -g pnpm
  pnpm setup
  pnpm add -g pnpm
  ```

# Setup

- Update your AWS credentials for deployments.
  ```shell
  vi ~/.aws/config
  vi ~/.aws/credentials
  export AWS_PROFILE=<profile name>
  ```

- Deploy lambda layers, if there are changes or they don't already exist.
  ```shell
  cd layers
  pnpm install
  pnpm sls deploy
  ```

- Create and/or update the config file for the stage you're deploying.
  ```shell
  cp configs/example.yml configs/<stage>.yml
  vi configs/<stage>.yml
  ```

# Test & Deploy
Move into the folder for the lambda you'd like to work with. Example, `cd notification/admin`.

Run unit tests on new lambda handler changes.
```shell
pnpm test
```

Test lambda locally with serverless emulation. (See [serverless invoke local documentation](https://www.serverless.com/framework/docs/providers/aws/cli-reference/invoke-local) for more specific instructions.)
```shell
pnpm sls invoke local --stage <stage> --function AccountRegistrationNotification --data '{"body":"{\"firstName\":\"Test\",\"lastName\":\"Tester\",\"email\":\"test@email.com\"}"}'
```

Preview serverless AWS cloudformation artifacts. Using the package command will package the stack as it does for deployment, without deploying it. You can find the package/artifacts by looking into the `.serverless` folder.
```shell
pnpm sls package --stage <stage>
```

To troubleshoot serverless parameter and variable resolution, run the print command.
```shell
pnpm sls print --stage <stage>
```

Deploy lambdas changes.
```shell
pnpm sls deploy --stage <stage>
```
