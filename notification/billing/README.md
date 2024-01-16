# Notification when a user's cost exceeds given threshold, via SNS
- path: `notification/billing`
- lambda name: `swb-tools-billing-notification-<stage>`

Creates an SNS topic and lambda to push notifications of users who have accrued costs higher than the designated threshold for 30 days.

*Note:* This lambda should be launched on the account(s) where compute resources are being used. Currently, the lambda 
only supports one project. It could easily be extended to support an array if desired.
