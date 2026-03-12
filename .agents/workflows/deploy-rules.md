---
description: Deploy Firestore security rules to the correct database
---

# Deploy Firestore Rules

> [!CAUTION]  
> This project uses a **named Firestore database** (`ai-studio-70c8c5da-c5bf-4142-92f4-54e9f392d9bd`), NOT the default `(default)` database.  
> The `firebase.json` is configured to target this database. Always verify the deploy output.

## Steps

// turbo-all

1. Verify firebase.json targets the correct database:
```bash
cat firebase.json | grep database
```
Expected: `"database": "ai-studio-70c8c5da-c5bf-4142-92f4-54e9f392d9bd"`

2. Deploy rules (no --project flag needed thanks to .firebaserc):
```bash
npx firebase deploy --only firestore:rules
```

3. Verify deploy output includes:
   - `cloud.firestore: rules file firestore.rules compiled successfully` (no errors, warnings are OK)
   - `firestore: released rules firestore.rules to cloud.firestore`
   - NO messages about `(default)` database

## Key Info
- **Project ID**: `gen-lang-client-0567816804`  
- **Database ID**: `ai-studio-70c8c5da-c5bf-4142-92f4-54e9f392d9bd`
- **Config file**: `firebase-applet-config.json` (has `firestoreDatabaseId`)
- **Auth helper functions**: `isAuthenticated()`, `isAdmin()`, `isOwner(userId)`, `isMember()`, `isAuthor()`
  - ⚠️ Do NOT use `isLoggedIn()` — it does not exist
