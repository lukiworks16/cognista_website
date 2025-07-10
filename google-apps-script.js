/**
 * Google Apps Script for handling form submissions to Google Sheets
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com/
 * 2. Create a new project
 * 3. Replace the default code with this script
 * 4. Create a new Google Sheet and copy its ID
 * 5. Replace 'YOUR_SHEET_ID' with your actual sheet ID
 * 6. Deploy as web app with execute permissions for "Anyone"
 * 7. Copy the web app URL and update it in both BookCallPopup.tsx and Hero.tsx
 */

// Replace with your Google Sheet ID
const SHEET_ID = 'YOUR_SHEET_ID';
const SHEET_NAME = 'Form Submissions';

function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Get or create the spreadsheet
    const sheet = getOrCreateSheet();
    
    // Prepare the row data
    const rowData = [
      new Date(data.timestamp),
      data.name,
      data.email,
      data.phone,
      data.course,
      data.timeSlot || 'To be scheduled',
      data.message || '',
      data.source,
      'Pending' // Status column
    ];
    
    // Add the data to the sheet
    sheet.appendRow(rowData);
    
    // Send confirmation email (optional)
    sendConfirmationEmail(data);
    
    return ContentService
      .createTextOutput(JSON.stringify({success: true, message: 'Data saved successfully'}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error:', error);
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput('Google Apps Script is working!')
    .setMimeType(ContentService.MimeType.TEXT);
}

function getOrCreateSheet() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      // Create the sheet if it doesn't exist
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      
      // Add headers
      const headers = [
        'Timestamp',
        'Name',
        'Email',
        'Phone',
        'Course Interest',
        'Preferred Time Slot',
        'Message',
        'Source',
        'Status'
      ];
      
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // Format the header row
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('white');
      headerRange.setFontWeight('bold');
      
      // Set column widths
      sheet.setColumnWidth(1, 150); // Timestamp
      sheet.setColumnWidth(2, 150); // Name
      sheet.setColumnWidth(3, 200); // Email
      sheet.setColumnWidth(4, 120); // Phone
      sheet.setColumnWidth(5, 150); // Course
      sheet.setColumnWidth(6, 150); // Time Slot
      sheet.setColumnWidth(7, 250); // Message
      sheet.setColumnWidth(8, 150); // Source
      sheet.setColumnWidth(9, 100); // Status
      
      // Add conditional formatting for status column
      const statusRange = sheet.getRange(2, 9, 1000, 1);
      const pendingRule = SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo('Pending')
        .setBackground('#fff3cd')
        .setFontColor('#856404')
        .setRanges([statusRange])
        .build();
      
      const completedRule = SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo('Completed')
        .setBackground('#d4edda')
        .setFontColor('#155724')
        .setRanges([statusRange])
        .build();
      
      const contactedRule = SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo('Contacted')
        .setBackground('#d1ecf1')
        .setFontColor('#0c5460')
        .setRanges([statusRange])
        .build();
      
      sheet.setConditionalFormatRules([pendingRule, completedRule, contactedRule]);
    }
    
    return sheet;
  } catch (error) {
    console.error('Error accessing sheet:', error);
    throw new Error('Could not access Google Sheet. Please check the SHEET_ID.');
  }
}

function sendConfirmationEmail(data) {
  try {
    const subject = 'Career Consultation Request Confirmation - TechAcademy';
    
    // Different email content based on source
    let body;
    if (data.source === 'Hero Section Form') {
      body = `
Dear ${data.name},

Thank you for your interest in TechAcademy's career programs!

We've received your request for a career consultation with the following details:
• Name: ${data.name}
• Email: ${data.email}
• Phone: ${data.phone}
• Course Interest: ${data.course}

What happens next?
1. Our career counselor will review your information
2. You'll receive a call within 24 hours to discuss your career goals
3. We'll provide personalized course recommendations based on your background
4. You'll get a customized learning roadmap to achieve your career objectives

Our expert counselors have helped thousands of professionals successfully transition into high-paying tech careers. We're excited to help you take the next step!

If you have any immediate questions, feel free to reply to this email or call us at +91-9876543210.

Best regards,
TechAcademy Career Team

---
Transform your career with industry-focused programs in AI, Data Science, and Full Stack Development.
      `;
    } else {
      body = `
Dear ${data.name},

Thank you for booking a free career consultation with TechAcademy!

Here are your booking details:
• Name: ${data.name}
• Email: ${data.email}
• Phone: ${data.phone}
• Course Interest: ${data.course}
• Preferred Time: ${data.timeSlot}
• Message: ${data.message || 'None'}

What happens next?
1. Our career counselor will review your information
2. You'll receive a call within 24 hours to confirm your appointment
3. We'll discuss your career goals and recommend the best learning path
4. You'll get detailed information about our placement assistance program

If you have any questions, feel free to reply to this email or call us at +91-9876543210.

Best regards,
TechAcademy Team

---
This is an automated confirmation email.
      `;
    }
    
    MailApp.sendEmail(data.email, subject, body);
    console.log('Confirmation email sent to:', data.email);
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw error here as the main functionality should still work
  }
}

// Function to get submission statistics
function getSubmissionStats() {
  try {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return {
        total: 0,
        today: 0,
        thisWeek: 0,
        bySource: {}
      };
    }
    
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    let todayCount = 0;
    let weekCount = 0;
    const sourceCount = {};
    
    // Skip header row
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const timestamp = new Date(row[0]);
      const source = row[7];
      
      // Count by date
      if (timestamp.toDateString() === today.toDateString()) {
        todayCount++;
      }
      if (timestamp >= weekAgo) {
        weekCount++;
      }
      
      // Count by source
      sourceCount[source] = (sourceCount[source] || 0) + 1;
    }
    
    return {
      total: data.length - 1,
      today: todayCount,
      thisWeek: weekCount,
      bySource: sourceCount
    };
  } catch (error) {
    console.error('Error getting stats:', error);
    return null;
  }
}

// Test function to verify the script works
function testScript() {
  const testData = {
    timestamp: new Date().toISOString(),
    name: 'Test User',
    email: 'test@example.com',
    phone: '+91-9876543210',
    course: 'Master in AI',
    timeSlot: '10:00 AM - 11:00 AM',
    message: 'This is a test submission',
    source: 'Test'
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = doPost(mockEvent);
  console.log('Test result:', result.getContent());
  
  // Test stats function
  const stats = getSubmissionStats();
  console.log('Submission stats:', stats);
}

// Function to clean up old test data (optional)
function cleanupTestData() {
  try {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    
    // Find and delete test rows
    for (let i = data.length - 1; i >= 1; i--) {
      if (data[i][7] === 'Test') { // Source column
        sheet.deleteRow(i + 1);
      }
    }
    
    console.log('Test data cleaned up');
  } catch (error) {
    console.error('Error cleaning up test data:', error);
  }
}