# Notification to user on account creation, via SES
- path: `notification/user`
- lambda name: `swb-tools-user-notification-<stage>`
- requires: lodash layer

Sends an email through SES to the user who's account has been marked as activated through the SWB ui.

## Notes: 
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


## SES Resources
The only other things that are needed to send email are related to SES authentication and getting out of the sandbox.
- [Moving out of the Amazon SES sandbox](https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html)
- [Email authentication methods](https://docs.aws.amazon.com/ses/latest/dg/email-authentication-methods.html)
  - [Authenticating Email with DKIM](https://docs.aws.amazon.com/ses/latest/dg/send-email-authentication-dkim.html)
  - [Authenticating Email with SPF](https://docs.aws.amazon.com/ses/latest/dg/send-email-authentication-spf.html)
  - [Using a custom MAIL FROM domain](https://docs.aws.amazon.com/ses/latest/dg/mail-from.html)
- [Receive bounces and complaints with email feedback forwarding](https://docs.aws.amazon.com/ses/latest/dg/monitor-sending-activity-using-notifications-email.html)