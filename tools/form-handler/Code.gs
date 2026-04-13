/**
 * AT6ix Logistics — Lead Form Handler
 *
 * Deploy as a Google Apps Script Web App:
 *   Execute as: Me
 *   Who has access: Anyone (even anonymous)
 *
 * On each submission this script:
 *   1. Appends the lead to the Google Sheet below
 *   2. Sends an email notification to the recipient below
 */

var SHEET_ID   = '1HBDvdQPX23GF5LF360Q1mcA9O7KdxUC1ZtFrKfMZfa8';
var NOTIFY_EMAIL = 'inamdarglobalconnect@gmail.com';

var HEADERS = ['Timestamp', 'Full Name', 'Company', 'Phone', 'Email', 'Service Type', 'Message'];

function doGet(e) {
  try {
    var p = e.parameter;

    // ── Write to Sheet ──────────────────────────────────────────────────────
    var ss    = SpreadsheetApp.openById(SHEET_ID);
    var sheet = ss.getSheets()[0];

    // Add header row if this is the first submission
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length)
           .setFontWeight('bold')
           .setBackground('#B8112A')
           .setFontColor('#FFFFFF');
      sheet.setFrozenRows(1);
    }

    var ts = Utilities.formatDate(
      new Date(),
      'America/Toronto',
      'yyyy-MM-dd HH:mm:ss'
    );

    sheet.appendRow([
      ts,
      p.name    || '',
      p.company || '',
      p.phone   || '',
      p.email   || '',
      p.service || '',
      p.message || ''
    ]);

    // Auto-resize columns for readability
    sheet.autoResizeColumns(1, HEADERS.length);

    // ── Send Email Notification ─────────────────────────────────────────────
    var subject = '🚚 New Quote Request — AT6ix Logistics';
    var body = [
      'A new lead was submitted via the AT6ix Logistics website.',
      '',
      '──────────────────────────────',
      'Full Name : ' + (p.name    || '—'),
      'Company   : ' + (p.company || '—'),
      'Phone     : ' + (p.phone   || '—'),
      'Email     : ' + (p.email   || '—'),
      'Service   : ' + (p.service || '—'),
      '──────────────────────────────',
      'Message:',
      (p.message || '(no message provided)'),
      '',
      'Submitted : ' + ts + ' (Toronto)',
      '',
      'View all leads → https://docs.google.com/spreadsheets/d/' + SHEET_ID
    ].join('\n');

    MailApp.sendEmail(NOTIFY_EMAIL, subject, body);

    // ── Return success ──────────────────────────────────────────────────────
    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
