module.exports.userActivation = {
  templateName: 'UserActivationNotification',
  subject: 'Service Workbench for AIM-AHEAD Account Activated',
  body: `
    <p>Hi {{name}},</p>
    <p>Your SWB account has been activated.</p>
    <p>You can log in here: <a href="https://aim-ahead.net/swb">Service Workbench on AWS</a></p>
    <p>Please join this discussion group: <a href="https://connect.aim-ahead.net/group/public/2eB9558">AIM-AHEAD Service Workbench Discussion Group</a></p>
    <p>Questions regarding AIM-AHEAD Service Workbench may be directed to: <a href="https://helpdesk.aim-ahead.net/ticket/create/Service_Workbench">HelpDesk  -  Submit a Ticket</a></p>
  `
};