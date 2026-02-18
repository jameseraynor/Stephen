# 01 - Authentication

## Overview

Authentication flow using AWS Cognito with email/password login, Microsoft SSO, MFA verification, and first-login password change. This is the entry point for all users.

## Screens

- `/login` — LoginPage
- `/login/mfa` — MfaVerificationPage
- `/login/new-password` — NewPasswordPage

## User Stories

### US-01.1: Email/Password Login

**As a** user with a Cognito account,
**I want to** log in with my email and password,
**So that** I can access the application.

**Acceptance Criteria:**

- [ ] Login form with email and password fields
- [ ] Email field validates format before submission
- [ ] Password field has show/hide toggle
- [ ] "Sign In" button is disabled while fields are empty
- [ ] On success, redirect to `/` (Project Selection)
- [ ] On failure, show inline error message (e.g., "Incorrect email or password")
- [ ] After 5 failed attempts, show "Account locked" message (Cognito handles lockout)
- [ ] Loading spinner on submit button during authentication
- [ ] JWT tokens (id, access, refresh) stored securely in memory (not localStorage)

### US-01.2: Microsoft SSO Login

**As a** user with a Microsoft corporate account,
**I want to** log in via Microsoft SSO,
**So that** I can use my existing corporate credentials.

**Acceptance Criteria:**

- [ ] "Sign in with Microsoft" button below the email/password form
- [ ] Clicking redirects to Microsoft login page (Cognito hosted UI or redirect)
- [ ] On success, Cognito exchanges SAML assertion for JWT tokens
- [ ] User is redirected back to `/` (Project Selection)
- [ ] If user doesn't exist in Cognito, auto-provision with Viewer role
- [ ] On failure, show error message and return to login page

### US-01.3: MFA Verification

**As a** user with MFA enabled,
**I want to** enter my TOTP code after login,
**So that** my account is protected with a second factor.

**Acceptance Criteria:**

- [ ] After successful email/password, redirect to `/login/mfa` if MFA is enabled
- [ ] 6-digit numeric input with auto-focus and auto-advance between digits
- [ ] "Verify" button validates the TOTP code
- [ ] On success, redirect to `/` (Project Selection)
- [ ] On failure, show "Invalid code, please try again"
- [ ] "Use backup code" link for recovery codes
- [ ] 30-second countdown timer showing code validity window
- [ ] Admin users are required to have MFA enabled (enforced at Cognito level)

### US-01.4: First-Login Password Change

**As a** new user created by an Admin,
**I want to** set my own password on first login,
**So that** only I know my password.

**Acceptance Criteria:**

- [ ] When Cognito returns `NEW_PASSWORD_REQUIRED` challenge, redirect to `/login/new-password`
- [ ] Form with: new password, confirm password
- [ ] Password requirements displayed (min 12 chars, upper, lower, digit, symbol)
- [ ] Real-time validation showing which requirements are met
- [ ] Passwords must match
- [ ] On success, redirect to `/` (Project Selection)
- [ ] On failure, show specific error

### US-01.5: Session Management

**As an** authenticated user,
**I want** my session to persist while I'm active,
**So that** I don't have to log in repeatedly.

**Acceptance Criteria:**

- [ ] Access token auto-refreshes using refresh token before expiry
- [ ] If refresh token expires (30 days), redirect to `/login`
- [ ] "Sign Out" button in header clears all tokens and redirects to `/login`
- [ ] Closing browser tab does not log out (tokens in memory persist via refresh)
- [ ] Multiple tabs share the same session

### US-01.6: Forgot Password

**As a** user who forgot my password,
**I want to** reset it via email,
**So that** I can regain access to my account.

**Acceptance Criteria:**

- [ ] "Forgot password?" link on login page
- [ ] Enter email → Cognito sends reset code
- [ ] Enter code + new password → password is reset
- [ ] Redirect to login page with success message

## UI/UX Requirements

- Centered card layout on a clean background
- Company logo at the top of the login card
- Optimized for desktop (1920×1080)
- Tab order: email → password → sign in button
- Enter key submits the form
- Error messages are red, below the relevant field
- Loading states on all async actions

## Business Rules

| Rule             | Description                                       |
| ---------------- | ------------------------------------------------- |
| Password Policy  | Min 12 chars, uppercase, lowercase, digit, symbol |
| MFA              | Optional for PM/Viewer, required for Admin        |
| Account Creation | Admin-only (self-registration disabled)           |
| SSO Provider     | Microsoft Azure AD via SAML                       |
| Token Storage    | In-memory only (not localStorage/sessionStorage)  |
| Session Duration | Access token: 1 hour, Refresh token: 30 days      |
| Account Lockout  | After 5 failed attempts (Cognito default)         |

## API / Services Used

- AWS Amplify Auth: `signIn`, `confirmSignIn`, `signOut`, `fetchAuthSession`
- Cognito User Pool (configured via Amplify)
- No custom Lambda endpoints for auth

## Permissions

All auth screens are public (no auth required). After login, role is determined by Cognito groups.

## Dependencies

- AWS Cognito User Pool configured
- Microsoft Azure AD SAML integration (for SSO)
- AWS Amplify configured in frontend

## Edge Cases

- User tries to access protected route without auth → redirect to `/login` with return URL
- SSO user's email doesn't match any Cognito user → auto-provision with Viewer role
- MFA device lost → backup codes or Admin resets MFA
- Concurrent sessions from multiple devices → allowed (Cognito default)
- Token refresh fails mid-session → show "Session expired" modal, redirect to login
