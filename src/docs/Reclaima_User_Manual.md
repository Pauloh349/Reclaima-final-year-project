# Reclaima User Manual

**System Name:** Reclaima University Platform  
**Document Type:** User Manual  
**Version:** 1.0  
**Prepared For:** Reclaima Campus Community  
**Date:** April 27, 2026

---

## Table of Contents

1. [Introduction](#10-introduction)
2. [System Overview](#20-system-overview)
3. [Access Requirements](#30-access-requirements)
4. [Account Registration and Sign-In](#40-account-registration-and-sign-in)
5. [Using the Main Dashboard](#50-using-the-main-dashboard)
6. [Reporting a Lost Item](#60-reporting-a-lost-item)
7. [Reporting a Found Item](#70-reporting-a-found-item)
8. [Smart Matches](#80-smart-matches)
9. [Item Details](#90-item-details)
10. [Messages and Chat](#100-messages-and-chat)
11. [Profile and Account Settings](#110-profile-and-account-settings)
12. [Admin Features](#120-admin-features)
13. [Support, Help, and Information Pages](#130-support-help-and-information-pages)
14. [Troubleshooting](#140-troubleshooting)
15. [Glossary](#150-glossary)

---

## 1.0 Introduction

Reclaima is a campus lost and found platform designed to help students, staff, and administrators report misplaced items, list found items, compare reports automatically, and coordinate safe handovers through direct messaging.

This manual explains how to use every visible function in the current system build. It is written for end users and administrators, so it includes both the normal student/staff workflow and the admin control workflow.

### 1.1 Purpose of the System

The system is intended to:

- Help users report items they have lost.
- Help users report items they have found.
- Suggest possible item matches based on report details.
- Support safe communication between finders and owners.
- Give administrators tools to monitor, manage, and export platform data.

### 1.2 Who This Manual Is For

This manual is intended for:

- Students using the platform to recover personal items.
- Staff members using the platform to report or locate items.
- Campus administrators who manage users and reports.
- Support staff who need to understand the overall system flow.

### 1.3 How the System Is Organized

Reclaima is divided into several parts:

- Public pages for visitors.
- Authentication pages for account creation and sign-in.
- User dashboards and item reporting pages.
- Matching, messaging, and profile management tools.
- Admin pages for system oversight and moderation.

---

## 2.0 System Overview

The platform centers on a simple sequence:

1. A user creates an account or signs in.
2. The user reports a lost item or a found item.
3. The system compares reports and displays possible matches.
4. Users review match details and contact each other through chat.
5. The item is handed over safely and its status is updated.

The interface also includes support pages, policy pages, and an admin dashboard for oversight.

### 2.1 Main User Roles

- **Visitor:** Can view public information pages such as the welcome page, How It Works, Help Center, Privacy Policy, and Terms of Service.
- **Registered User:** Can access the dashboard, post reports, view matches, chat with other users, and update profile details.
- **Administrator:** Can access the admin dashboard, review users, change roles, lock or unlock accounts, add reports, and download exports.

### 2.2 Key Features

- Welcome and onboarding experience.
- Sign-up with email verification support.
- Sign-in and password recovery.
- Lost item reporting.
- Found item reporting.
- Campus zone selection and map guidance.
- Smart match recommendations.
- Item detail viewing.
- Messaging and notification handling.
- Profile editing and password updates.
- Admin monitoring, moderation, and reporting.

---

## 3.0 Access Requirements

To use the platform effectively, you need:

- A modern web browser.
- An internet connection.
- A valid university email address.
- A user account on Reclaima.

### 3.1 Browser and Device Notes

The system is web-based, so it can be accessed on desktop or mobile devices. The layout is responsive and adjusts to different screen sizes.

### 3.2 Account Requirements

Some pages are public, but most actions require an authenticated account:

- Reporting lost items.
- Reporting found items.
- Viewing smart matches.
- Opening item details.
- Using chat.
- Editing profile information.
- Accessing the admin dashboard.

### 3.3 Email Verification

If your account requires verification, you must confirm your email before continuing to the protected areas of the system.

### 3.4 Session Storage

The app stores the current authenticated user in browser storage and uses that information to keep the session active.

---

## 4.0 Account Registration and Sign-In

This section explains how to create an account, sign in, verify your email, and recover your password.

### 4.1 Opening the Platform

When you open Reclaima, you land on the welcome page.

The welcome page provides:

- A short description of the platform.
- A "Get Started" button for registration.
- A "Sign In" button for returning users.
- A "How it works" link for a full workflow summary.

### 4.2 Creating an Account

Use the sign-up page if you are new to the system.

#### Steps to Register

1. Open the welcome page.
2. Select **Get Started** or go to the sign-up page.
3. Enter your first name.
4. Enter your last name.
5. Enter your university email address.
6. Enter a password.
7. Confirm that you agree to the Terms of Service and Privacy Policy.
8. Confirm that you are not a robot.
9. Submit the form.

#### Sign-Up Validation Rules

- First name is required.
- Last name is required.
- Each name must be at least 2 characters.
- Names can only contain letters, spaces, apostrophes, and hyphens.
- Email must be valid.
- Password must be at least 8 characters.
- You must accept the terms and privacy policy.
- You must complete the human-check box.

#### What Happens After Sign-Up

Depending on the backend response:

- If the account is created immediately, the system stores your token and user profile and takes you to the dashboard.
- If email verification is required, you are taken to the verification page.

### 4.3 Signing In

Use the sign-in page if you already have an account.

#### Steps to Sign In

1. Open the sign-in page.
2. Enter your university email.
3. Enter your password.
4. Confirm the human-check box.
5. Select **Continue**.

#### Sign-In Rules

- Email is required and must be valid.
- Password is required and must be at least 8 characters.
- The human-check box must be selected.

#### What Happens After Sign-In

- Normal users are taken to the dashboard.
- Admin users are taken to the admin dashboard.
- If your email is not verified, the system sends you to the verification page.
- If your account is locked, you are redirected back to the sign-in page.

### 4.4 Admin Sign-In

Administrators use a separate sign-in page.

#### Steps to Sign In as Admin

1. Open the admin sign-in page.
2. Enter the admin email address.
3. Enter the admin password.
4. Confirm the human-check box.
5. Select **Continue**.

#### Admin Access Rules

- The account must have the admin role.
- Non-admin users cannot enter the admin dashboard.

### 4.5 Email Verification

If your account needs verification, the system shows the verification page.

#### Verification Page Features

- Shows the email address used for sign-up.
- Can verify an account using a token in the URL.
- Can resend the verification email.

#### Steps to Verify

1. Open the email verification link sent to your inbox.
2. If the link contains a token, the system verifies your account automatically.
3. If you need a new email, use the resend option.
4. After successful verification, sign in again.

### 4.6 Password Reset

The password reset page supports two flows:

- Requesting a reset link.
- Setting a new password using a reset token.

#### Requesting a Reset Link

1. Open the sign-in page.
2. Select the password reset link.
3. Enter your university email.
4. Submit the request.

If the account exists, the system sends a reset link.

#### Completing a Password Reset

1. Open the reset link from your email.
2. Enter a new password.
3. Confirm the new password.
4. Submit the form.

#### Reset Validation Rules

- Email must be valid in request mode.
- A reset token must exist in token mode.
- New password must be at least 8 characters.
- Password confirmation must match the new password.

---

## 5.0 Using the Main Dashboard

After sign-in, regular users are taken to the dashboard.

### 5.1 Dashboard Purpose

The dashboard is the central control panel for users. It summarizes reports and provides shortcuts to the most common tasks.

### 5.2 Dashboard Contents

The dashboard shows:

- A welcome message with your display name.
- Quick action buttons.
- Summary statistics.
- Recent activity.
- Navigation links for the rest of the app.

### 5.3 Quick Actions

The quick actions give direct access to:

- Report Lost Item.
- Report Found Item.
- Messages Inbox.
- Smart Matches.

### 5.4 Summary Statistics

The dashboard shows counts for:

- Lost reports.
- Found reports.
- Open cases.
- Possible matches.

These numbers are loaded from the backend and reflect your account activity.

### 5.5 Recent Activity

The recent activity panel shows recent reports linked to your account, including:

- Item image.
- Item title.
- Date reported.
- Location.
- Report type.

### 5.6 Dashboard Navigation

The main dashboard navigation typically includes:

- Dashboard.
- Smart Matches.
- Notifications.
- Profile menu.

---

## 6.0 Reporting a Lost Item

Lost item reporting is a two-step process.

### 6.1 Step 1 - Choose a Category

On the lost item page, you begin by selecting the category that best describes your missing item.

Available categories include:

- ID or Badge
- Phone
- Wallet
- Keys
- Laptop
- Other

### 6.2 Draft Saving

The first step supports draft saving.

When you choose a category and save the draft:

- The selected category is stored in session storage.
- Your name and email are prefilled if available.
- You can return later and continue the report.

### 6.3 Continuing to Step 2

Select **Continue** to move to the zone and details page.

### 6.4 Step 2 - Choose the Campus Zone

The second step asks where the item was last seen.

Available zones include:

- Main Library
- Hostels
- Cafeteria
- Science Complex

The zone page also includes:

- A searchable zone list.
- A campus map embed.
- Links to open directions or the full map.

### 6.5 Lost Item Details

On the second step, you enter:

- Item title.
- Specific location, if known.
- Description.
- Contact name.
- Contact email.
- Contact phone, if available.

### 6.6 Submission Rules

The system requires:

- A category from step 1.
- An item title.
- A selected campus zone.
- A contact email.

Optional fields may be left blank.

### 6.7 Submitting the Lost Report

1. Complete the required fields.
2. Review the summary panel.
3. Select **Submit Report**.

The report is sent to the backend and the draft is removed after success.

### 6.8 Lost Report Draft Controls

The lost reporting flow includes:

- Save Draft
- Back
- Cancel

These controls allow you to pause, revise, or abandon the report before submission.

---

## 7.0 Reporting a Found Item

Found item reporting is designed for people who locate an item and want to help return it.

### 7.1 Report Contents

The found item form includes:

- Item title.
- Category.
- Campus zone.
- Specific location.
- Description.
- Contact name.
- Contact email.
- Contact phone.

### 7.2 Category Choices

The found item categories are:

- ID or Badge
- Phone
- Wallet
- Keys
- Laptop
- Other

### 7.3 Zone Choices

The zone options are:

- Main Library
- Hostels
- Cafeteria
- Science Complex

### 7.4 Handover Method

You must select how the item should be handed over:

- Security Office
- Meet in Public

#### Security Office

Choose this option if the item should be left with campus security for safe release.

#### Meet in Public

Choose this option if you want to arrange a handover in a well-trafficked public campus location.

### 7.5 Optional Photo Section

The found item screen includes a photo upload area labeled as optional. It invites you to upload a clear image and shows supported file types and size guidance.

### 7.6 Safety Guidance

The screen also includes a safety note encouraging:

- Public handover points.
- Well-lit meeting locations.
- Security office use when unsure.

### 7.7 Submitting the Found Report

1. Fill in the required fields.
2. Choose a handover method.
3. Select **Submit Report**.

The system posts the item to the backend and then takes you toward matching results.

### 7.8 Buttons on the Found Screen

The interface includes:

- Back
- Save Draft
- Submit Report

Save Draft is shown in the interface as a control option, while submission is the main action in the current build.

---

## 8.0 Smart Matches

The Smart Matches page shows items that may correspond to your lost reports.

### 8.1 What Smart Matches Do

The system compares your lost reports against found items and displays possible matches.

### 8.2 Match Summary

At the top of the page, you will see:

- Total matches.
- Lost reports.
- Found candidates.

### 8.3 Match Gate

If you have not yet posted any lost items, the page explains that you must report a lost item before matches can appear.

### 8.4 Recommended Results

If matches exist, they are displayed as cards with:

- Item image.
- Title.
- Category.
- Location.
- Date.
- Match confidence.
- Status text.

### 8.5 Match Confidence

Each card shows a confidence percentage. Higher confidence indicates a stronger likely match.

### 8.6 Match Actions

Each match card includes:

- View Item
- Message Finder

The **Message Finder** action starts a conversation about the item.

### 8.7 Sorting and Loading

Matches are loaded from the server and shown in newest-first order.

If there are no results, the page shows a helpful message instead of a blank screen.

---

## 9.0 Item Details

Item details let you review a specific report in more depth.

### 9.1 Opening an Item

You open item details from a match or item link.

### 9.2 What the Details Page Shows

The page displays:

- Item photo.
- Item title.
- Category.
- Location.
- Date found or reported.
- Return method.
- Current status.
- Description.
- Reporter name or email.

### 9.3 Privacy Notice

The page includes a privacy-protected badge to show that the item information is handled carefully.

### 9.4 Ownership Verification Message

The details page reminds users that ownership is verified before release and that unique item details should be prepared for claims.

### 9.5 Item Actions

The item details screen includes:

- Start Claim
- Message Finder
- Mark as Returned

#### Start Claim

This button represents the start of a claim workflow.

#### Message Finder

This button is intended to begin contact with the finder.

#### Mark as Returned

This action updates the item status to returned once the item has been handed over.

### 9.6 Status Update Behavior

When you mark an item as returned:

- The system sends a status update request.
- The item status changes to returned.
- The page confirms the update.

---

## 10.0 Messages and Chat

Reclaima includes an inbox and a chat screen so users can coordinate item returns safely.

### 10.1 Messages Inbox

The messages page lists your active conversations.

#### Inbox Features

- Conversation list with item image.
- Item title.
- Location.
- Preview of the most recent message.
- Message timestamp.
- Unread notification count.

### 10.2 Opening a Conversation

Select a chat from the inbox to open the thread.

### 10.3 Chat Thread Screen

The chat page shows:

- The item being discussed.
- Conversation status.
- Messages exchanged between the two users.
- A message composer at the bottom.

### 10.4 Safety Banner

At the top of the chat area, the system displays a safety reminder to meet in public campus locations and verify items before exchange.

### 10.5 Sending Messages

To send a message:

1. Open the chat thread.
2. Type your message in the message box.
3. Press Enter or select the send button.

### 10.6 Message Behavior

- Your own messages appear on the right.
- The other person's messages appear on the left.
- Messages show a timestamp.

### 10.7 Notifications

The inbox and chat screens connect to live notification updates. When new messages arrive, the unread count can increase automatically.

### 10.8 Chat Menu Options

The chat header includes an options menu with items such as:

- View item details.
- Need support.
- Report user.
- Archive chat.

Some of these actions are shown as interface controls and may depend on backend support for full workflow completion.

### 10.9 Attachment Area

The message composer includes an attachment-style icon. This indicates the intended place for file or media support in the chat workflow.

---

## 11.0 Profile and Account Settings

The profile page is where users manage personal details, security settings, and their reported item history.

### 11.1 Profile Overview

The profile screen includes:

- Your name.
- Email address.
- Email verification status.
- Campus.
- A profile completion percentage.
- A snapshot of your account details.

### 11.2 Personal Details

You can edit:

- First name.
- Last name.
- Phone number.
- Campus.
- Email alert preference.

### 11.3 Saving Profile Changes

1. Open the profile page.
2. Edit the required fields.
3. Select **Save profile**.

The system validates the form and sends the update to your account record.

### 11.4 Resetting Unsaved Changes

The profile form includes controls to:

- Reset to the current saved values.
- Discard changes without saving.

### 11.5 Password Change

You can update your password from the profile page.

#### Password Change Fields

- Current password.
- New password.
- Confirm new password.

#### Password Rules

- Current password is required.
- New password must be at least 8 characters.
- Confirmation must match the new password.

#### Password Change Steps

1. Enter the current password.
2. Enter a new password.
3. Confirm the new password.
4. Select **Update password**.

### 11.6 Report History and Item Summary

The profile page also shows:

- Total reported items.
- Lost posts.
- Found posts.
- A list of recent reports.

### 11.7 Helpful Shortcuts

The profile page provides direct links to:

- Post a lost item.
- Post a found item.
- Open support.

### 11.8 Signing Out

Use the sign-out button to end your session on the current device.

When you sign out, the system clears stored session data and returns you to the sign-in page.

---

## 12.0 Admin Features

Administrators have access to a separate dashboard with platform control tools.

### 12.1 Admin Dashboard Purpose

The admin dashboard is used to:

- Review platform activity.
- Search users.
- Change user roles.
- Lock or unlock accounts.
- Add reports on behalf of the team.
- Download reports for compliance and auditing.

### 12.2 Admin Overview

The overview section displays:

- Registered users.
- Total reports.
- Open cases.
- Smart match totals.
- Item breakdowns by type and status.
- New users and new items over time.
- Recent reports.

### 12.3 User Search

Administrators can search for users by name or email.

#### Search Workflow

1. Enter a name or email in the search bar.
2. Select **Search**.
3. Review the matching accounts.

### 12.4 Role Management

For each user, the admin can choose between:

- User
- Admin

After selecting a role, choose **Update** to save the change.

### 12.5 Account Locking

Administrators can lock or unlock accounts.

#### Locking Steps

1. Open a user record in the admin user list.
2. Choose **Lock**.
3. Enter a brief reason when prompted.
4. Confirm the change.

#### Unlocking Steps

1. Open the same user record.
2. Choose **Unlock**.
3. Save the change.

Locked accounts are redirected away from protected pages.

### 12.6 Adding Items from Admin

The admin dashboard can open a quick-entry form to create lost or found items.

#### Admin Item Entry Fields

- Item type.
- Title.
- Category.
- Campus zone.
- Specific location.
- Description.
- Contact name.
- Contact email.
- Contact phone.
- Handover method.

#### Admin Item Creation Steps

1. Open the add item form.
2. Complete the fields.
3. Select whether the item is lost or found.
4. Choose the appropriate handover method.
5. Submit the report.

### 12.7 Downloading Reports

Administrators can export:

- Items reports.
- User reports.

#### Items Export Options

- All
- Lost
- Found

#### Date Ranges

- 30 days
- 90 days
- 180 days
- 365 days

#### User Export Formats

- CSV
- PDF

### 12.8 Admin Access Control

Only authenticated users with the admin role can access the admin dashboard. Non-admin users are redirected away from admin pages.

---

## 13.0 Support, Help, and Information Pages

The system includes public pages that explain the platform and provide guidance.

### 13.1 How It Works

The How It Works page explains the system in four steps:

1. Post a lost or found report.
2. Receive smart matches.
3. Chat and verify.
4. Return securely.

It also reminds users to verify ownership and use public handover points.

### 13.2 Help Center

The Help Center provides:

- Search bar for help topics.
- Reporting guidance.
- Matching guidance.
- Safe meetup guidance.
- Frequently asked questions.

#### Common FAQ Topics

- How to verify a match.
- Whether a report can be edited after posting.
- What to do if a user feels unsafe.

### 13.3 Privacy Policy

The Privacy Policy page explains:

- What information is collected.
- How it is used.
- When it is shared.
- What choices users have.

### 13.4 Terms of Service

The Terms of Service page explains:

- Community guidelines.
- Account responsibilities.
- Content ownership.
- Service availability.

### 13.5 Welcome Page Links

The welcome page includes quick links to:

- How It Works
- Privacy Policy
- Terms of Service
- Help Center

### 13.6 Not Found Page

If you go to a page that does not exist, the system shows a 404 page with a short error message.

---

## 14.0 Troubleshooting

This section lists common issues and how to handle them.

### 14.1 I Cannot Sign In

Check the following:

- Your email is correct.
- Your password is correct.
- The human-check box is selected.
- Your account is not locked.
- Your email has been verified if required.

### 14.2 I Did Not Receive a Verification Email

Try the following:

- Check your inbox and spam folder.
- Use the resend verification option.
- Confirm that you used the same email address during sign-up.

### 14.3 I Forgot My Password

Use the password reset page to request a reset link.

### 14.4 My Report Will Not Submit

Make sure you completed all required fields:

- Lost reports require category, title, zone, and contact email.
- Found reports require title, category, zone, and contact email.

### 14.5 I Do Not See Matches

Possible reasons:

- You have not submitted a lost report yet.
- There are no current found items that match your report.
- The system is still loading your data.

### 14.6 Chat Does Not Open

Check whether:

- You are signed in.
- The selected chat exists.
- Your browser allows live updates.

### 14.7 My Profile Update Failed

Make sure:

- First name and last name are filled in.
- Your phone number, if entered, is in a valid format.
- Your session has not expired.

### 14.8 I Was Redirected to Sign-In

This usually means one of the following:

- Your session expired.
- Your account is locked.
- You are not authorized for the page you tried to open.

### 14.9 The Page Shows No Data

This can happen if:

- The backend has no records yet.
- The network request failed.
- You are signed in with a different email than the one used for the reports.

---

## 15.0 Glossary

- **Account Locked:** A restricted account that cannot access protected pages until restored by an administrator.
- **Admin:** A user with elevated permissions to manage the platform.
- **Campus Zone:** A broad campus location such as the library, hostels, cafeteria, or science complex.
- **Confidence Score:** The percentage shown on a match card to indicate how likely the item is a match.
- **Finder:** The person who submitted a found item report.
- **Match:** A possible connection between a lost report and a found report.
- **Report:** An entry for a lost item or found item.
- **Session Storage:** Temporary browser storage used to keep a draft or session information during a visit.
- **Verification:** The process of confirming that an email address belongs to the account owner.

---

## 16.0 Closing Notes

Reclaima is built around a simple goal: help the campus community recover lost items safely and efficiently.

For best results:

- Enter clear and accurate details.
- Use the correct campus zone.
- Check smart matches regularly.
- Use the chat safely and respectfully.
- Keep your profile information current.
- Update item status after returns are completed.

If you want, I can also turn this into a polished PDF-style layout next, or add a cover page, screenshots, and branding so it matches a formal university manual even more closely.

