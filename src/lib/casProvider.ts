import type { OAuthConfig } from 'next-auth/providers/oauth';
import { parseStringPromise } from 'xml2js';

export interface CasProfile {
  id: string;
  uid: string;
  mail: string;
  name?: string;
}

interface CasTokens {
  access_token: string;
  xml_response: string;
  [key: string]: string;
}

interface TokenRequestContext {
  params: Record<string, unknown>;
}

interface UserinfoRequestContext {
  tokens: unknown;
}

async function validateCasTicket(
  ticket: string,
  serviceUrl: string
): Promise<CasTokens> {
  const casBaseUrl = process.env.CAS_BASE_URL ?? 'https://cas.ulb.ac.be/cas';
  const validateUrl = `${casBaseUrl}/serviceValidate?ticket=${encodeURIComponent(ticket)}&service=${encodeURIComponent(serviceUrl)}`;

  const res = await fetch(validateUrl);
  if (!res.ok) {
    throw new Error(`CAS serviceValidate HTTP error: ${res.status}`);
  }
  const xml = await res.text();
  return { access_token: ticket, xml_response: xml };
}

async function parseXmlProfile(xml: string): Promise<CasProfile> {
  const result = await parseStringPromise(xml, { explicitArray: true });
  const serviceResponse = result['cas:serviceResponse'];

  const authSuccess = serviceResponse?.['cas:authenticationSuccess']?.[0];
  if (!authSuccess) {
    const failure = serviceResponse?.['cas:authenticationFailure']?.[0];
    throw new Error(`CAS authentication failed: ${failure?._ ?? 'Unknown error'}`);
  }

  const uid: string = authSuccess['cas:user']?.[0] ?? '';
  const attrs = authSuccess['cas:attributes']?.[0] ?? {};
  const mail: string = attrs['cas:mail']?.[0] ?? attrs['cas:email']?.[0] ?? `${uid}@ulb.ac.be`;
  const displayName: string = attrs['cas:displayName']?.[0] ?? uid;

  return { id: uid, uid, mail, name: displayName };
}

export function CasProvider(): OAuthConfig<CasProfile> {
  const casBaseUrl = process.env.CAS_BASE_URL ?? 'https://cas.ulb.ac.be/cas';
  const nextAuthUrl = (process.env.NEXTAUTH_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  const callbackUrl = `${nextAuthUrl}/api/auth/callback/cas-ulb`;

  return {
    id: 'cas-ulb',
    name: 'CAS ULB',
    type: 'oauth',
    version: '2.0',
    authorization: {
      url: `${casBaseUrl}/login`,
      params: {
        service: callbackUrl,
      },
    },
    token: {
      url: `${casBaseUrl}/serviceValidate`,
      async request(context: TokenRequestContext) {
        // CAS sends the ticket as the `code` query param via NextAuth's OAuth flow
        const ticket = context.params.code as string;
        const tokens = await validateCasTicket(ticket, callbackUrl);
        return { tokens };
      },
    },
    userinfo: {
      async request(context: UserinfoRequestContext) {
        const xml = (context.tokens as CasTokens).xml_response;
        return parseXmlProfile(xml);
      },
    },
    profile(profile: CasProfile) {
      return {
        id: profile.uid,
        email: profile.mail,
        name: profile.name ?? profile.uid,
      };
    },
    // CAS doesn't use client credentials, but NextAuth requires these fields
    clientId: process.env.CAS_CLIENT_ID ?? 'cas-ulb',
    clientSecret: process.env.CAS_CLIENT_SECRET ?? 'unused',
    checks: ['none'],
  };
}
