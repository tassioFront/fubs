import * as jwt from 'jsonwebtoken';

export function getInternalApiToken({
  serviceName,
}: {
  serviceName: string;
}): string {
  const secret = process.env.INTERNAL_JWT_SECRET_KEY;
  if (!secret || secret.trim().length < 16) {
    throw new Error(
      'INTERNAL_JWT_SECRET_KEY is missing or too weak (min 16 chars).'
    );
  }
  return jwt.sign({ service: serviceName }, secret, {
    expiresIn: '10m',
    algorithm: 'HS256',
  });
}

export function getInternalApiHeader({ serviceName }: { serviceName: string }) {
  const token = getInternalApiToken({ serviceName });
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}
