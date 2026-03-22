/**
 * Google Wallet API — Loyalty passes (JWT flow).
 * Configure GOOGLE_WALLET_ISSUER_ID and GOOGLE_WALLET_SERVICE_ACCOUNT_JSON in .env.
 * IMPORTANT: GOOGLE_WALLET_ISSUER_ID must be the numeric Issuer ID (e.g. 33880000000123456789),
 * not the Merchant ID (BCR...). Find it in Pay & Wallet Console → Google Wallet API.
 * @see https://developers.google.com/wallet/retail/loyalty-cards/use-cases/jwt
 */

import jwt from "jsonwebtoken";
import { buildStampHeroImageUrl } from "@/lib/wallet/stamp-hero-url";

/** Fallback logo when merchant has none. Must be a public HTTPS URL that returns an image (no AccessDenied). */
const DEFAULT_LOGO = "https://placehold.co/256x256/ea751a/ffffff/png?text=S";

export type GoogleWalletPassData = {
  issuerId: string;
  /** Merchant + program — o clasă per program ca să poți folosi culoarea cardului din app */
  classSuffix: string;
  /** Our barcode value, e.g. SP-ABC123 (alphanumeric, -, _) */
  objectSuffix: string;
  businessName: string;
  programName: string;
  logoUrl?: string | null;
  /** Culoare fundal pass — aliniată la cardul web (ex. card_custom_bg_color) */
  hexBackgroundColor?: string;
  /** Reward description shown on card */
  rewardDescription: string;
  stampsRequired: number;
  stampCount: number;
  rewardAvailable: boolean;
  accountName: string;
  accountId: string;
  /** Link opțional către cardul web în Wallet */
  passPublicUrl?: string | null;
  /** UUID pass — pentru imaginea hero cu grilă ștampile */
  passId: string;
  /** Baza publică a site-ului (ex. NEXT_PUBLIC_APP_URL) — folosită la hero + PATCH */
  appBaseUrl: string;
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

  const remaining = Math.max(0, data.stampsRequired - data.stampCount);
  const stampHeroUrl = buildStampHeroImageUrl(
    data.appBaseUrl.replace(/\/$/, ""),
    data.passId,
    data.stampCount
  );

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

  const loyaltyObject: Record<string, unknown> = {
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
      label: "Ștampile colectate",
      balance: { int: data.stampCount },
    },
    secondaryLoyaltyPoints: {
      label: "Până la recompensă",
      balance: { int: remaining },
    },
    textModulesData: [
      {
        header: "Recompensă",
        body: data.rewardDescription.slice(0, 200),
        id: "reward_desc",
      },
      {
        header: "Recompense disponibile",
        body: data.rewardAvailable ? "1 (ridică la casă)" : "0",
        id: "rewards_avail",
      },
      ...(data.rewardAvailable
        ? [
            {
              header: "Recompensă gata",
              body: "Arată cardul la casă pentru a o folosi.",
              id: "reward_ready",
            },
          ]
        : []),
    ],
    heroImage: {
      sourceUri: { uri: stampHeroUrl },
      contentDescription: {
        defaultValue: { language: "ro", value: "Ștampile și recompensa" },
      },
    },
  };

  if (data.passPublicUrl?.trim()) {
    loyaltyObject.linksModuleData = {
      uris: [
        {
          uri: data.passPublicUrl.trim(),
          description: "Deschide cardul în browser",
          id: "open_card_web",
        },
      ],
    };
  }

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

  const remainingDbg = Math.max(0, data.stampsRequired - data.stampCount);
  const stampHeroUrlDbg = buildStampHeroImageUrl(
    data.appBaseUrl.replace(/\/$/, ""),
    data.passId,
    data.stampCount
  );
  const loyaltyObjectDbg: Record<string, unknown> = {
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
      label: "Ștampile colectate",
      balance: { int: data.stampCount },
    },
    secondaryLoyaltyPoints: {
      label: "Până la recompensă",
      balance: { int: remainingDbg },
    },
    textModulesData: [
      {
        header: "Recompensă",
        body: data.rewardDescription.slice(0, 200),
        id: "reward_desc",
      },
      {
        header: "Recompense disponibile",
        body: data.rewardAvailable ? "1 (ridică la casă)" : "0",
        id: "rewards_avail",
      },
      ...(data.rewardAvailable
        ? [
            {
              header: "Recompensă gata",
              body: "Arată cardul la casă pentru a o folosi.",
              id: "reward_ready",
            },
          ]
        : []),
    ],
    heroImage: {
      sourceUri: { uri: stampHeroUrlDbg },
      contentDescription: {
        defaultValue: { language: "ro", value: "Ștampile și recompensa" },
      },
    },
  };
  if (data.passPublicUrl?.trim()) {
    loyaltyObjectDbg.linksModuleData = {
      uris: [
        {
          uri: data.passPublicUrl.trim(),
          description: "Deschide cardul în browser",
          id: "open_card_web",
        },
      ],
    };
  }

  return {
    iss: "(service account email)",
    aud: "google",
    typ: "savetowallet",
    iat: Math.floor(Date.now() / 1000),
    origins: origins.length ? origins : ["http://localhost:3000"],
    payload: {
      loyaltyClasses: [loyaltyClass],
      loyaltyObjects: [loyaltyObjectDbg],
    },
  };
}

const WALLET_OBJECT_SCOPE =
  "https://www.googleapis.com/auth/wallet_object.issuer";

/** Get OAuth2 access token using service account JWT (for REST API calls). */
async function getWalletApiAccessToken(
  serviceAccount: { client_email: string; private_key: string }
): Promise<string | null> {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
    scope: WALLET_OBJECT_SCOPE,
  };
  try {
    const assertion = jwt.sign(payload, serviceAccount.private_key, {
      algorithm: "RS256",
    });
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion,
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { access_token?: string };
    return data.access_token ?? null;
  } catch {
    return null;
  }
}

export type UpdateGoogleWalletPassParams = {
  stampCount: number;
  stampsRequired: number;
  rewardAvailable: boolean;
  rewardDescription: string;
};

/**
 * Updates the loyalty pass in Google Wallet (stamp count, reward state).
 * @param passId — UUID wallet_passes (pentru imaginea hero)
 * @param objectSuffix — barcode_value (id obiect Google)
 */
export async function updateGoogleWalletPass(
  passId: string,
  objectSuffix: string,
  updates: UpdateGoogleWalletPassParams
): Promise<boolean> {
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
  const keyJson = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_JSON;
  if (!issuerId || !keyJson) return false;

  let serviceAccount: { client_email: string; private_key: string };
  try {
    serviceAccount = JSON.parse(keyJson) as {
      client_email: string;
      private_key: string;
    };
  } catch {
    return false;
  }
  if (!serviceAccount.client_email || !serviceAccount.private_key) return false;

  const accessToken = await getWalletApiAccessToken(serviceAccount);
  if (!accessToken) return false;

  const resourceId = `${issuerId}.${safeObjectSuffix(objectSuffix)}`;
  const remaining = Math.max(0, updates.stampsRequired - updates.stampCount);
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "";
  const stampHeroUrl = baseUrl
    ? buildStampHeroImageUrl(baseUrl, passId, updates.stampCount)
    : null;

  const patchBody: Record<string, unknown> = {
    loyaltyPoints: {
      label: "Ștampile colectate",
      balance: { int: updates.stampCount },
    },
    secondaryLoyaltyPoints: {
      label: "Până la recompensă",
      balance: { int: remaining },
    },
    barcode: {
      type: "QR_CODE",
      value: objectSuffix,
      alternateText: `${updates.stampCount}/${updates.stampsRequired}`,
    },
    textModulesData: [
      {
        header: "Recompensă",
        body: updates.rewardDescription.slice(0, 200),
        id: "reward_desc",
      },
      {
        header: "Recompense disponibile",
        body: updates.rewardAvailable ? "1 (ridică la casă)" : "0",
        id: "rewards_avail",
      },
      ...(updates.rewardAvailable
        ? [
            {
              header: "Recompensă gata",
              body: "Arată cardul la casă pentru a o folosi.",
              id: "reward_ready",
            },
          ]
        : []),
    ],
  };

  if (stampHeroUrl) {
    patchBody.heroImage = {
      sourceUri: { uri: stampHeroUrl },
      contentDescription: {
        defaultValue: { language: "ro", value: "Ștampile și recompensa" },
      },
    };
  }

  const res = await fetch(
    `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject/${encodeURIComponent(resourceId)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patchBody),
    }
  );
  return res.ok;
}
