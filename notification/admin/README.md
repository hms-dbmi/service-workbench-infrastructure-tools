# Notification to admin on user account creation, via SNS
- path: `notification/admin`
- lambda name: `swb-tools-admin-notification-<stage>`
- requires: lodash layer

Creates an SNS topic and lambda to push notifications of new users who were created by the `_system_` user.
