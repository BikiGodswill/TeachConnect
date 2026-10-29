// Turns raw backend / auth / database messages into text a student or teacher can act on.
const RULES = [
  [/invalid login credentials/i, 'Email or password is incorrect. Please try again.'],
  [/email not confirmed/i, 'Please confirm your email first — check your inbox for the link.'],
  [/user already registered|already been registered/i, 'An account with this email already exists. Try logging in.'],
  [/password should be at least|weak password/i, 'Choose a stronger password (at least 8 characters).'],
  [/rate limit|too many requests/i, 'Too many attempts. Please wait a minute and try again.'],
  [/failed to fetch|networkerror|network request failed|load failed/i, 'Cannot reach the server. Check your internet connection and try again.'],
  [/jwt expired|not signed in|invalid jwt/i, 'Your session expired. Please log in again.'],
  [/teacher is not available at that time/i, 'That time slot was just taken. Please pick another time.'],
  [/lesson must be in the future/i, 'Please choose a time in the future.'],
  [/payment not confirmed/i, 'This lesson cannot start until payment is confirmed.'],
  [/insufficient available balance/i, 'You can only withdraw money that is already available.'],
  [/below minimum/i, 'That amount is below the minimum withdrawal.'],
  [/dispute window closed/i, 'The 24-hour window to report a problem has passed.'],
  [/nothing to review/i, 'This teacher is no longer waiting for review. Refresh the page.'],
  [/service role only|not an admin/i, 'The server is not set up for admin actions. Check SUPABASE_SERVICE_ROLE_KEY and that you are logged in as an admin.'],
  [/already resolved/i, 'This dispute was already resolved. Refresh the page.'],
  [/invalid refund/i, 'The refund cannot be more than the lesson price.'],
  [/duplicate key|already exists/i, 'That already exists.'],
  [/row-level security|permission denied|forbidden/i, "You don't have permission to do that."],
];

export function friendlyError(err, fallback = 'Something went wrong. Please try again.') {
  const msg = typeof err === 'string' ? err : err?.message || '';
  if (!msg) return fallback;
  for (const [re, text] of RULES) if (re.test(msg)) return text;
  // our own raise exception messages are already readable; hide anything that looks technical
  return /^[A-Z][^{}<>]{4,140}$/.test(msg) && !/pgrst|sql|relation|column|violates|syntax/i.test(msg) ? msg : fallback;
}
