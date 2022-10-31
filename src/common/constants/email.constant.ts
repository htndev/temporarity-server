export const SIGNATURE = '<p>Your favorite fake backend service :)</p>';

export const EMAIL_INVITATION_TEMPLATE = `
  <div style="font-family: sans-serif; font-size: 14px; line-height: 1.5; color: #333;">
    <p>Hi, {{fullName}}</p>
    <p>You have been invited to join the workspace <a href="{{workspaceUrl}}">{{workspaceName}}</a>.</p>
  </div>
  <div style="margin-top: 20px;">
    <a href="{{acceptUrl}}" style="display: inline-block; padding: 10px 20px; background-color: #333; color: #fff; text-decoration: none; border-radius: 4px;">Accept invitation</a>
  </div>
  ${SIGNATURE}
`;
