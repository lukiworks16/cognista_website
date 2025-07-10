# Google Sheets Integration Setup Guide

## Step 1: Create Google Apps Script

1. Go to [Google Apps Script](https://script.google.com/)
2. Click "New Project"
3. Replace the default code with the content from `google-apps-script.js`
4. Save the project with a name like "TechAcademy Form Handler"

## Step 2: Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com/)
2. Create a new spreadsheet
3. Name it "TechAcademy Form Submissions"
4. Copy the Sheet ID from the URL (the long string between `/d/` and `/edit`)
   - Example: `https://docs.google.com/spreadsheets/d/1ABC123DEF456GHI789JKL/edit`
   - Sheet ID: `1ABC123DEF456GHI789JKL`

## Step 3: Configure the Script

1. In your Google Apps Script project, replace `YOUR_SHEET_ID` with your actual Sheet ID
2. Test the script by running the `testScript()` function
3. Grant necessary permissions when prompted

## Step 4: Deploy as Web App

1. In Google Apps Script, click "Deploy" → "New deployment"
2. Choose type: "Web app"
3. Set execute as: "Me"
4. Set access: "Anyone"
5. Click "Deploy"
6. Copy the Web App URL

## Step 5: Update React Components

1. In `src/components/BookCallPopup.tsx`, replace `YOUR_SCRIPT_ID` in the `GOOGLE_SCRIPT_URL` with your actual web app URL
2. In `src/components/Hero.tsx`, replace `YOUR_SCRIPT_ID` in the `GOOGLE_SCRIPT_URL` with your actual web app URL
3. The URL should look like: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`

## Step 6: Test the Integration

1. Submit a test form through both the hero section and the "Book Call" popup
2. Check your Google Sheet to see if the data appears
3. Verify that confirmation emails are being sent

## Features Included

✅ **Unified Data Collection**: Both hero form and popup save to the same sheet
✅ **Source Tracking**: Identifies which form the submission came from
✅ **Automatic Sheet Creation**: Creates headers and formatting automatically
✅ **Data Validation**: Handles errors gracefully
✅ **Email Confirmation**: Sends different confirmation emails based on form source
✅ **Timestamp Tracking**: Records when each submission was made
✅ **Status Tracking**: Includes a status column for follow-up management
✅ **Conditional Formatting**: Color-codes status for easy management
✅ **Statistics Function**: Track submission metrics

## Sheet Columns

The Google Sheet will have these columns:
- **Timestamp**: When the form was submitted
- **Name**: User's full name
- **Email**: User's email address
- **Phone**: User's phone number
- **Course Interest**: Selected course
- **Preferred Time Slot**: Time preference (or "To be scheduled" for hero form)
- **Message**: Additional message from user
- **Source**: Which form was used (Hero Section Form / Book Free Call Popup)
- **Status**: Follow-up status (Pending/Contacted/Completed)

## Form Sources

The system tracks two different form sources:

### 1. Hero Section Form
- **Source**: "Hero Section Form"
- **Purpose**: Initial interest and career consultation request
- **Time Slot**: Automatically set to "To be scheduled"
- **Message**: Auto-generated message indicating hero section submission

### 2. Book Call Popup
- **Source**: "Book Free Call Popup"
- **Purpose**: Specific call booking with time preferences
- **Time Slot**: User-selected time preference
- **Message**: User-provided message (optional)

## Email Confirmations

Different confirmation emails are sent based on the form source:

- **Hero Form**: General career consultation confirmation
- **Book Call Popup**: Specific call booking confirmation with appointment details

## Security Notes

- The web app is deployed with "Anyone" access but only accepts POST requests
- No sensitive data is exposed in the client-side code
- All form data is validated before saving to the sheet
- Email addresses are validated before sending confirmations

## Management Features

### Status Tracking
Use the Status column to track follow-up progress:
- **Pending**: New submission, not yet contacted
- **Contacted**: Initial contact made
- **Completed**: Consultation completed or enrolled

### Conditional Formatting
The sheet automatically color-codes status values:
- **Pending**: Yellow background
- **Contacted**: Blue background  
- **Completed**: Green background

### Statistics
Use the `getSubmissionStats()` function in Google Apps Script to get:
- Total submissions
- Today's submissions
- This week's submissions
- Breakdown by form source

## Troubleshooting

**Common Issues:**
1. **Permission Denied**: Make sure you've granted all necessary permissions
2. **Sheet Not Found**: Verify the Sheet ID is correct
3. **CORS Errors**: These are normal when using `no-cors` mode with Google Apps Script
4. **Email Not Sending**: Check if Gmail API is enabled and you have email permissions
5. **Duplicate Headers**: If you see duplicate headers, delete the sheet and let it recreate

**Testing:**
- Use the `testScript()` function in Google Apps Script to verify everything works
- Check the execution log in Google Apps Script for any errors
- Test with real form submissions from both hero section and popup
- Use `cleanupTestData()` function to remove test entries

**Data Management:**
- Regularly review and update the Status column for proper follow-up
- Use filters to view submissions by source, date, or status
- Export data periodically for backup and analysis

## Advanced Features

### Custom Email Templates
Modify the `sendConfirmationEmail()` function to customize email content based on:
- Course interest
- User's background
- Time of submission

### Integration with CRM
The Google Sheet can be connected to CRM systems like:
- HubSpot
- Salesforce
- Pipedrive
- Zoho CRM

### Automated Follow-ups
Set up Google Apps Script triggers to:
- Send reminder emails
- Update status automatically
- Generate daily/weekly reports