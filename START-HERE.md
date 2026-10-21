# General Assembly — start here

This is a separate attendance website for your GitHub repository. It uses the approved red design and supports phone, tablet and desktop widths. No Apps Script or npm build is needed.

## 1. Prepare your new Google spreadsheet

Create two tabs with these EXACT names. Row 1 contains headers; student data starts on row 2. Avoid merged cells.

ALL RECORDS:
A: Student ID | B: Student name | C: Course | D: Year level

ATTENDANCE:
A: Date and time | B: Student ID | C: Student name | D: Course | E: Year level

Format student ID columns as Plain text, and use IDs like 2021-07-00227. Keep one student per ID in ALL RECORDS. Course choices come from unique nonempty values in column C. Keep at least one course in ALL RECORDS before using manual attendance.

Keep the spreadsheet private. The Google account connecting the attendance station must own it or have Editor access. Students enter IDs at that connected station; they do not each need to sign in.

## 2. Edit config.js

The existing Fellowship API key and OAuth client ID have already been copied into this new config file. They are browser credentials; never add an OAuth client secret or service-account private key.

Replace PASTE_YOUR_NEW_SPREADSHEET_ID_HERE with your new spreadsheet ID.
For a URL such as:
https://docs.google.com/spreadsheets/d/ABC123xyz/edit
The ID is ABC123xyz. Use only the ID, not the complete URL.

Leave recordsSheet and attendanceSheet unchanged unless your tab names differ.

## 3. Add your logo

Replace the included placeholder logo.png with your real logo, using the exact lowercase name logo.png. The placeholder is not an official school logo.

## 4. Upload to a NEW GitHub repository

1. Unzip this package.
2. Create a new repository, for example general-assembly-attendance. Do not overwrite Fellowship.
3. Use Add file → Upload files.
4. Upload index.html, style.css, script.js, config.js and logo.png directly to the repository root. START-HERE.md may also be uploaded.
5. Commit the files.
6. In repository Settings → Pages, choose Deploy from a branch, select main and /(root), then Save. If this interface changes, use GitHub Pages' branch deployment option.
7. Wait for GitHub Pages to display your live address. It usually looks like https://YOUR-USERNAME.github.io/general-assembly-attendance/.

Open the live HTTPS website, not index.html by double-clicking it on your computer.

## 5. Check your existing Google Cloud project

Open https://console.cloud.google.com/ and select your existing Fellowship project.

- Ensure Google Sheets API is enabled.
- Open the existing OAuth Web application client (Google Auth Platform → Clients, or APIs & Services → Credentials).
- Under Authorized JavaScript origins, add your website's ORIGIN, such as https://YOUR-USERNAME.github.io. Do not include /general-assembly-attendance/ here. If Fellowship uses the same username.github.io origin and it is already listed, no new origin is needed. Preserve existing entries.
- For your existing API key, use Websites/HTTP referrer restrictions and allow https://YOUR-USERNAME.github.io/* if not already allowed. Restrict its API access to Google Sheets API. Preserve the Fellowship website's allowed entry.
- If the OAuth app is in Testing, ensure the organizer's Google account is an allowed test user under Audience/Test users. If an organizational app only permits internal accounts, use an allowed account or an appropriately configured external OAuth client.
- The Google consent screen can still show the old Fellowship app name if you reuse its client. For independent branding/settings without affecting Fellowship, create a separate OAuth web client/project and put its credentials into config.js instead.

So: you can reuse the API key and OAuth client ID. Changing the spreadsheet ID is the required code change, but website restrictions, allowed origins and account access must also match the new deployment.

## 6. Try it

1. Open the live website in Chrome or Safari.
2. Tap Connect Google; choose the organizer account with Editor access and allow the requested Sheets permission.
3. Type a real ID from ALL RECORDS. Dashes appear automatically. Tap Record attendance or press Enter.
4. Confirm the student's name appears and a new A:E row is in ATTENDANCE.
5. Enter the same ID again. It should say already recorded without creating another row.
6. Enter an unknown complete ID. Use the manual attendance button, fill the name, select a course and submit.
7. Manual entries go into ATTENDANCE only; they do not modify ALL RECORDS. Their year level is recorded as 4.
8. Test on your tablet and phone before the event.

## How this version behaves

- One check-in per student ID for the entire ATTENDANCE tab. It does not record time-out.
- Total present is the count of unique IDs in ATTENDANCE, including existing entries. It is not restricted to today.
- The timestamp is Philippine time in the requested style (e.g. 9/9/2026 - 3:00 pm).
- The clock uses the device clock; set the device's date/time correctly.
- Records load when Google connects. Reconnect after updating ALL RECORDS during an event.
- The counter refreshes every minute and before each new entry.
- Duplicate checking reads the sheet before writing. Simultaneous submissions of the SAME ID on multiple devices can still race. Use one attendance station if strict duplicate exclusion is required; a server-side lock is needed for guaranteed multi-station exclusion.
- Google authorization tokens stay in memory, not local storage. Reconnect after refresh or session expiry. Disconnect clears this app's session but does not sign you out of Google itself.
- Internet is required; the app does not claim success until Google confirms a write. If a network error happens during saving, check the sheet before retrying.
- For a separate future assembly, use a fresh spreadsheet or a different attendance tab in config.js; preserve the previous event's records.

## Common problems

- origin_mismatch / origin not allowed: check the OAuth JavaScript origin against the exact live site origin.
- API key blocked: check website restrictions and Google Sheets API restrictions.
- Permission denied / 403: check the signed-in account has Editor access and Google Sheets API is enabled.
- Unable to parse range: check ALL RECORDS and ATTENDANCE spelling.
- Sign-in popup does not open: allow popups for the live site and use a regular Chrome/Safari tab rather than an embedded social-app browser.
- Blank course dropdown: fill column C in ALL RECORDS, then reconnect.

Official references:
https://developers.google.com/identity/oauth2/web/guides/use-token-model
https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow
https://docs.cloud.google.com/docs/authentication/api-keys

Validation: JavaScript syntax and a simulated Google integration passed (authorization callback, ID formatting, lookup, five-column append, duplicate checking, manual entry and disconnect). Responsive CSS is included, but visual browser testing was unavailable in the build environment. Actual Google authorization requires your new sheet ID and deployed website settings.
