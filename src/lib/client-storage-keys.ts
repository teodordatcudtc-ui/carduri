/** Chei noi — rebrand Stampy (migrare automată din vechile chei stampio_*). */

export const REMEMBER_PASS_PREFIX = "stampy_pass_";
export const LEGACY_REMEMBER_PASS_PREFIX = "stampio_pass_";

export const PASS_CUSTOMER_PREFIX = "stampy_pass_customer_";
export const LEGACY_PASS_CUSTOMER_PREFIX = "stampio_pass_customer_";

export function rememberPassKey(slug: string, programId: string): string {
  return `${REMEMBER_PASS_PREFIX}${slug}_${programId}`;
}

export function rememberPassKeyLegacy(slug: string, programId: string): string {
  return `${LEGACY_REMEMBER_PASS_PREFIX}${slug}_${programId}`;
}

export function passCustomerNameKey(passId: string): string {
  return `${PASS_CUSTOMER_PREFIX}${passId}`;
}

export function passCustomerNameKeyLegacy(passId: string): string {
  return `${LEGACY_PASS_CUSTOMER_PREFIX}${passId}`;
}
