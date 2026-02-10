/**
 * Returns the profile picture URL, defaulting to the default avatar if none is set.
 */
export function getProfilePictureUrl(profilePictureUrl: string | null | undefined): string {
  return profilePictureUrl || "/default.avif";
}
