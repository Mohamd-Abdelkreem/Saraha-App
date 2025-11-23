export const forgotPasswordTemplate = ({ firstName, otp = '12345' }) => {
  return `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset Request - Saraha</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f7fa; padding: 40px 0;">
              <tr>
                <td align="center">
                  <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); overflow: hidden;">
                    <!-- Header with gradient -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                          🔑 Password Reset Request
                        </h1>
                      </td>
                    </tr>
                    
                    <!-- Main content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <p style="margin: 0 0 20px; color: #2d3748; font-size: 18px; font-weight: 600;">
                          Hi ${firstName},
                        </p>
                        <p style="margin: 0 0 25px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                          We received a request to reset the password for your Saraha account. Please use the code below to set up a new password.
                        </p>
                        
                        <!-- OTP Box -->
                        <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                          <tr>
                            <td align="center">
                              <div style="background: linear-gradient(135deg, #f6f8fb 0%, #e9ecef 100%); border: 2px dashed #667eea; border-radius: 10px; padding: 25px; display: inline-block;">
                                <p style="margin: 0 0 10px; color: #4a5568; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                                  Your Reset Code
                                </p>
                                <p style="margin: 0; color: #667eea; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                    ${otp}
                                </p>
                              </div>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Info box -->
                        <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px 20px; border-radius: 4px; margin: 25px 0;">
                          <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.5;">
                            ⏰ <strong>Important:</strong> This reset code will expire in <strong>10 minutes</strong>. Please use it promptly to reset your password.
                          </p>
                        </div>
                        
                        <p style="margin: 25px 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                          If you did not request a password reset, you can safely ignore this email. Your password will not be changed.
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f7fafc; padding: 30px; border-top: 1px solid #e2e8f0;">
                        <p style="margin: 0 0 10px; color: #4a5568; font-size: 14px;">
                          Best regards,<br>
                          <strong style="color: #667eea;">The Saraha Team</strong>
                        </p>
                        <p style="margin: 20px 0 0; color: #a0aec0; font-size: 12px; line-height: 1.5;">
                          This is an automated message, please do not reply to this email. If you need assistance, please contact our support team.
                        </p>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Footer note -->
                  <p style="margin: 20px 0 0; color: #a0aec0; font-size: 12px; text-align: center;">
                    © ${new Date().getFullYear()} Saraha. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `;
};
