/**
 * Google Wallet API — Loyalty passes (JWT flow).
 * Configure GOOGLE_WALLET_ISSUER_ID and GOOGLE_WALLET_SERVICE_ACCOUNT_JSON in .env.
 * IMPORTANT: GOOGLE_WALLET_ISSUER_ID must be the numeric Issuer ID (e.g. 33880000000123456789),
 * not the Merchant ID (BCR...). Find it in Pay & Wallet Console → Google Wallet API.
 * @see https://developers.google.com/wallet/retail/loyalty-cards/use-cases/jwt
 */

import jwt from "jsonwebtoken";

/** Fallback logo when merchant has none. Must be a public HTTPS URL that returns an image (no AccessDenied). */
const DEFAULT_LOGO = "https://placehold.co/256x256/ea751a/ffffff/png?text=S";

export type GoogleWalletPassData = {
  issuerId: string;
  /** Merchant-scoped, e.g. slug or merchant_id (alphanumeric, _, -) */
  classSuffix: string;
  /** Our barcode value, e.g. SP-ABC123 (alphanumeric, -, _) */
  objectSuffix: string;
  businessName: string;
  programName: string;
  logoUrl?: string | null;
  hexBackgroundColor?: string;
  /** Reward description shown on card */
  rewardDescription: string;
  stampsRequired: number;
  stampCount: number;
  rewardAvailable: boolean;
  accountName: string;
  accountId: string;
};

function toHexColor(c: string): string {
  const hex = c.replace(/^#/, "");
  if (hex.length === 6) return `#${hex}`;
  if (hex.length === 3)
    return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
  return "#ea751a";
}

function safeObjectSuffix(s: string): string {
  return s.replace(/[^a-zA-Z0-9_.-]/g, "_");
}

/**
 * Returns the "Add to Google Wallet" URL (JWT signed with service account).
 * Include both loyaltyClasses and loyaltyObjects in the JWT so the pass is created on first save.
 */
export function getAddToGoogleWalletUrl(
  data: GoogleWalletPassData,
  origins: string[]
): string | null {
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
  const keyJson = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_JSON;
  if (!issuerId || !keyJson) return null;

  let serviceAccount: { client_email: string; private_key: string };
  try {
    serviceAccount = JSON.parse(keyJson) as {
      client_email: string;
      private_key: string;
    };
  } catch {
    return null;
  }
  if (!serviceAccount.client_email || !serviceAccount.private_key) return null;

  const classId = `${issuerId}.${safeObjectSuffix(data.classSuffix)}`;
  const objectId = `${issuerId}.${safeObjectSuffix(data.objectSuffix)}`;
  const hexColor = data.hexBackgroundColor
    ? toHexColor(data.hexBackgroundColor)
    : "#ea751a";
  const rawLogo = data.logoUrl?.trim();
  const logoUri =
    rawLogo && (rawLogo.startsWith("http://") || rawLogo.startsWith("https://"))
      ? rawLogo
      : DEFAULT_LOGO;

  const loyaltyClass = {
    id: classId,
    issuerName: data.businessName.slice(0, 20),
    programName: data.programName.slice(0, 20),
    programLogo: {
      sourceUri: {
        uri: logoUri,
      },
      contentDescription: {
        defaultValue: { language: "en", value: data.businessName },
      },
    },
    reviewStatus: "UNDER_REVIEW",
    hexBackgroundColor: hexColor,
  };

  const loyaltyObject = {
    id: objectId,
    classId,
    state: "ACTIVE",
    accountName: data.accountName.slice(0, 20),
    accountId: data.accountId.slice(0, 20),
    barcode: {
      type: "QR_CODE",
      value: data.objectSuffix,
      alternateText: `${data.stampCount}/${data.stampsRequired}`,
    },
    loyaltyPoints: {
      label: "Stamps",
      balance: { int: data.stampCount },
    },
    textModulesData: [
      {
        header: "Reward",
        body: data.rewardDescription,
        id: "reward",
      },
      ...(data.rewardAvailable
        ? [
            {
              header: "Congratulations",
              body: "You earned a reward! Show this card at checkout.",
              id: "reward_available",
            },
          ]
        : []),
    ],
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    aud: "google",
    typ: "savetowallet",
    iat: now,
    origins: origins.length ? origins : ["http://localhost:3000"],
    payload: {
      loyaltyClasses: [loyaltyClass],
      loyaltyObjects: [loyaltyObject],
    },
  };

  try {
    const token = jwt.sign(payload, serviceAccount.private_key, {
      algorithm: "RS256",
    });
    return `https://pay.google.com/gp/v/save/${token}`;
  } catch {
    return null;
  }
}

/** Build the unsigned JWT payload for debugging (same structure we sign). */
export function getWalletPayloadForDebug(
  data: GoogleWalletPassData,
  origins: string[]
): Record<string, unknown> | null {
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
  if (!issuerId) return null;

  const classId = `${issuerId}.${safeObjectSuffix(data.classSuffix)}`;
  const objectId = `${issuerId}.${safeObjectSuffix(data.objectSuffix)}`;
  const hexColor = data.hexBackgroundColor
    ? toHexColor(data.hexBackgroundColor)
    : "#ea751a";
  const rawLogo = data.logoUrl?.trim();
  const logoUri =
    rawLogo && (rawLogo.startsWith("http://") || rawLogo.startsWith("https://"))
      ? rawLogo
      : DEFAULT_LOGO;

  const loyaltyClass = {
    id: classId,
    issuerName: data.businessName.slice(0, 20),
    programName: data.programName.slice(0, 20),
    programLogo: {
      sourceUri: { uri: logoUri },
      contentDescription: {
        defaultValue: { language: "en", value: data.businessName },
      },
    },
    reviewStatus: "UNDER_REVIEW",
    hexBackgroundColor: hexColor,
  };

  const loyaltyObject = {
    id: objectId,
    classId,
    state: "ACTIVE",
    accountName: data.accountName.slice(0, 20),
    accountId: data.accountId.slice(0, 20),
    barcode: {
      type: "QR_CODE",
      value: data.objectSuffix,
      alternateText: `${data.stampCount}/${data.stampsRequired}`,
    },
    loyaltyPoints: {
      label: "Stamps",
      balance: { int: data.stampCount },
    },
    textModulesData: [
      { header: "Reward", body: data.rewardDescription, id: "reward" },
      ...(data.rewardAvailable
        ? [
            {
              header: "Congratulations",
              body: "You earned a reward! Show this card at checkout.",
              id: "reward_available",
            },
          ]
        : []),
    ],
  };

  return {
    iss: "(service account email)",
    aud: "google",
    typ: "savetowallet",
    iat: Math.floor(Date.now() / 1000),
    origins: origins.length ? origins : ["http://localhost:3000"],
    payload: {
      loyaltyClasses: [loyaltyClass],
      loyaltyObjects: [loyaltyObject],
    },
  };
}

export async function updateGoogleWalletPass(
  _objectId: string,
  _updates: { stampCount?: number; rewardAvailable?: boolean }
): Promise<boolean> {
  const keyJson = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_JSON;
  if (!keyJson) return false;
  // TODO: PATCH https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject/{objectId}
  return false;
}
