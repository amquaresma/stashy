export const USERNAME_REGEX = /^[a-z0-9_.]+$/

export const USERNAME_MIN_LENGTH = 3
export const USERNAME_MAX_LENGTH = 30

export function isValidUsernameFormat(username) {
  if (!username) return false
  if (username.length < USERNAME_MIN_LENGTH) return false
  if (username.length > USERNAME_MAX_LENGTH) return false
  return USERNAME_REGEX.test(username)
}
