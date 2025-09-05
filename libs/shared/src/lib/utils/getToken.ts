import * as jwt from 'jsonwebtoken';

export function getInternalApiToken({
  serviceName,
}: {
  serviceName: string;
}): string {
  const secret = process.env.INTERNAL_JWT_SECRET_KEY as string;
  return jwt.sign({ service: serviceName }, secret, {
    expiresIn: '10m',
  });
}

export function getInternalApiHeader({ serviceName }: { serviceName: string }) {
  const token = getInternalApiToken({ serviceName });
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}
