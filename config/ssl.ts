// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /config/ssl.ts
// SSL configuration - because secure voting starts with secure connections!

import fs from 'fs';
import path from 'path';
import { createServer } from 'https';
import { NextApiHandler } from 'next';

interface SSLConfig {
  /** Path to SSL certificate */
  certPath: string;
  /** Path to SSL private key */
  keyPath: string;
  /** Path to SSL chain */
  chainPath?: string;
}

const sslConfig: SSLConfig = {
  certPath: process.env.SSL_CERT_PATH || path.join(process.cwd(), 'certificates', 'cert.pem'),
  keyPath: process.env.SSL_KEY_PATH || path.join(process.cwd(), 'certificates', 'key.pem'),
  chainPath: process.env.SSL_CHAIN_PATH,
};

export function createSecureServer(handler: NextApiHandler) {
  // Only use SSL in production
  if (process.env.NODE_ENV !== 'production') {
    return handler;
  }

  try {
    const ssl = {
      cert: fs.readFileSync(sslConfig.certPath),
      key: fs.readFileSync(sslConfig.keyPath),
      ...(sslConfig.chainPath && {
        ca: fs.readFileSync(sslConfig.chainPath),
      }),
    };

    return createServer(ssl, handler);
  } catch (error) {
    console.error('Failed to load SSL certificates:', error);
    process.exit(1);
  }
}

export function validateSSLConfig() {
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }

  const requiredFiles = [sslConfig.certPath, sslConfig.keyPath];
  if (sslConfig.chainPath) {
    requiredFiles.push(sslConfig.chainPath);
  }

  const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
  if (missingFiles.length > 0) {
    console.error('Missing SSL certificates:', missingFiles);
    return false;
  }

  return true;
}