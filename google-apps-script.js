/*
 * =========================================================
 *  SETUP INSTRUCTIONS (2 minutes)
 * =========================================================
 *
 *  1. Go to https://script.google.com
 *  2. Click "New Project"
 *  3. Delete any default code and paste THIS ENTIRE FILE
 *  4. Click "Deploy" → "New deployment"
 *  5. Choose "Web app"
 *  6. Set "Execute as" = "Me"
 *  7. Set "Who has access" = "Anyone"
 *  8. Click "Deploy" and authorize
 *  9. Copy the Web App URL (looks like https://script.google.com/macros/s/xxxxx/exec)
 * 10. Paste that URL into js/intake.js where it says APPS_SCRIPT_URL
 *
 * =========================================================
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    var subject = '🚀 New Project Inquiry from ' + (data.client_name || 'Unknown');

    var body = '';
    body += '═══════════════════════════════════════\n';
    body += '  NEW PROJECT INQUIRY\n';
    body += '═══════════════════════════════════════\n\n';

    body += '── ABOUT THE CLIENT ──\n\n';
    body += '  Name:     ' + (data.client_name || 'N/A') + '\n';
    body += '  Email:    ' + (data.client_email || 'N/A') + '\n';
    body += '  Business: ' + (data.client_business || 'N/A') + '\n';
    body += '  Industry: ' + (data.client_industry || 'N/A') + '\n';

    body += '\n── THE CHALLENGE ──\n\n';
    body += '  Pain Point:\n  ' + (data.pain_point || 'N/A') + '\n\n';
    body += '  Current Tools: ' + (data.current_tools || 'N/A') + '\n';
    body += '  Tried Before: ' + (data.tried_before || 'N/A') + '\n';

    body += '\n── PROJECT VISION ──\n\n';
    body += '  Services: ' + (data.service_type || 'N/A') + '\n';
    body += '  Budget:   ' + (data.budget || 'N/A') + '\n';
    body += '  Timeline: ' + (data.timeline || 'N/A') + '\n';
    body += '  Details:  ' + (data.extra_details || 'N/A') + '\n';

    body += '\n═══════════════════════════════════════\n';
    body += '  Submitted: ' + new Date().toLocaleString() + '\n';
    body += '═══════════════════════════════════════\n';

    // Send to your email
    MailApp.sendEmail({
      to: 'psquare346@gmail.com',
      subject: subject,
      body: body,
      replyTo: data.client_email || ''
    });

    // Return success
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Required for CORS preflight
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ready' }))
    .setMimeType(ContentService.MimeType.JSON);
}
