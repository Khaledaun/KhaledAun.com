# Verification and Security Documentation

This document explains how to run verification checks on the project and documents the security architecture.

## Authentication System

### Supabase Auth
The application uses **Supabase Auth** as the primary authentication system:

- **JWT Token Validation**: All admin API routes require valid Supabase JWT tokens
- **Role-Based Access**: User roles are stored in JWT metadata (`user_metadata.role` or `app_metadata.role`)
- **Server-Side Utilities**: `requireAdmin()` function validates tokens and extracts user roles
- **No NextAuth**: Previously considered authentication solutions have been removed in favor of Supabase Auth

### Supported Roles
- **admin**: Full access to all resources
- **editor**: Can create and update content, but cannot delete
- **ops**: Can read operational data like leads
- **user**: Default role with limited access

## Row Level Security (RLS) Model

### Database Security
The application implements Row Level Security policies on Supabase/PostgreSQL:

#### Post Table Policies
- **Admins**: Can perform any action (CREATE, READ, UPDATE, DELETE)
- **Editors**: Can create and update posts, but cannot delete them
- **Authenticated Users**: Can only read posts with status `PUBLISHED`
- **Anonymous Users**: Can only read posts with status `PUBLISHED`

#### Lead Table Policies
- **Admins & Ops**: Can read all leads
- **Admins Only**: Can create, update, and delete leads
- **Other Roles**: No access to leads

### API Data Security
- All admin API routes are protected with JWT validation
- Role extraction happens server-side using Supabase client
- Database queries are automatically filtered by RLS policies
- Failed authentication returns appropriate HTTP status codes (401/403)

## Verification Commands

Run these commands to verify the project setup: