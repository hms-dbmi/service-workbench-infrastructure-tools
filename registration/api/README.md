# User registration API
- path: `registration/api`
- lambda name: `swb-tools-registration-api-<stage>`
- requires: uuid layer

Registers a new user, adding them to the existing users database with pre-populated values for smooth user creation.

Includes WAF bot protection and DDos limiting for unauthenticated api endpoint.

Uses API gateway mapping to validate request body against json schema.


## Resources
- [Working with models and mapping templates](https://docs.aws.amazon.com/apigateway/latest/developerguide/models-mappings.html)
- [AWS Docs: AWS::WAFv2::WebACL](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-wafv2-webacl.html)
- [AWS WAF Bot Control](https://docs.aws.amazon.com/waf/latest/developerguide/waf-bot-control.html)