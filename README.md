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
serverless deploy --stage <stage>
```

Create and/or update the config file for the stage you're deploying.
```shell
cp config.example.yml config.<stage>.yml
vi config.<stage>.yml
```

Test new lambda handler changes.
```shell
cd <lambda>
pnpm test
```

Deploy lambdas changes.
```shell
cd <lambda>
serverless deploy --stage <stage>
```