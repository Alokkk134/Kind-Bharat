// App-wide settings. Change values here, not scattered through the code.

export const SITE_NAME = "KindBharat";

/** Main tagline (chosen after looking at competitor taglines — see CLAUDE.md). */
export const TAGLINE = "Donate directly. See the proof.";
export const SUB_TAGLINE =
  "Donate directly to a verified NGO for a small, budgeted project — then see the photos and bills of exactly what your money bought. We never touch your money.";

export const SITE_DESCRIPTION =
  "KindBharat lists verified, budgeted social projects by Indian NGOs. Donors pay the NGO directly — the platform never handles money — and every project ends with proof.";

/** Days after deadline/funding an NGO has to submit proof before new projects are blocked (SPEC 4.3).
 *  Keep in sync with public.proof_grace_days() in the database. */
export const PROOF_GRACE_DAYS = 30;

export const CONTACT_EMAIL = "aalok.builds@gmail.com";

export const TIMEZONE = "Asia/Kolkata";
export const LOCALE = "en-IN";
