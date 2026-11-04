import { OAuth2Client } from 'google-auth-library';

/** The parts of a verified Google ID token the app uses. */
export interface GoogleProfile {
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string;
  picture: string;
}

export interface GoogleVerifier {
  /** Verifies a Google Identity Services credential (ID token); throws if invalid. */
  verify(credential: string): Promise<GoogleProfile>;
}

export function createGoogleVerifier(clientId: string): GoogleVerifier {
  const client = new OAuth2Client(clientId);
  return {
    async verify(credential) {
      const ticket = await client.verifyIdToken({ idToken: credential, audience: clientId });
      const p = ticket.getPayload();
      if (!p?.sub || !p.email) throw new Error('Google token has no account id or email');
      return {
        sub: p.sub,
        email: p.email.toLowerCase(),
        emailVerified: p.email_verified === true,
        name: p.name?.trim() || p.email.split('@')[0] || 'Traveller',
        picture: p.picture ?? '',
      };
    },
  };
}
