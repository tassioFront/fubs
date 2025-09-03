import * as jwt from 'jsonwebtoken';

export function getToken({ serviceName }: { serviceName: string }): string {
  const secret = process.env.INTERNAL_JWT_SECRET_KEY as string;
  return jwt.sign({ service: serviceName }, secret, {
    expiresIn: '10m',
  });
}

export function getAuthHeader({ serviceName }: { serviceName: string }) {
  const token = getToken({ serviceName });
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}
