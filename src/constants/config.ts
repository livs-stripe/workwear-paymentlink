// Replace with your Vercel deployment URL
export const API_BASE_URL = 'https://your-project.vercel.app';

// Set to true for local testing against the Terminal simulator (no physical
// Tap to Pay hardware/entitlement required). Set to false for the live demo.
// This is intended to be a one-line toggle — no rebuild logic depends on it.
export const SIMULATOR_MODE = false;

// Currency used for all charges in this demo.
export const CURRENCY = 'aud';

// Vercel Deployment Protection bypass.
// If your Vercel team enforces Deployment Protection (SSO) and it can't be
// disabled, generate a "Protection Bypass for Automation" secret in
// Vercel → Settings → Deployment Protection, and paste it here. The app sends
// it as the `x-vercel-protection-bypass` header so requests skip the SSO wall.
// Leave as an empty string if protection is disabled.
export const VERCEL_PROTECTION_BYPASS = '';
