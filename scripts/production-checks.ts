// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /scripts/production-checks.ts
// Production readiness checks - validating our path to deployment!

import fs from 'fs';
import path from 'path';
import { validateSSLConfig } from '../config/ssl';
import clientPromise from '../lib/mongodb';
import { redisClient } from '../lib/redis';

interface CheckResult {
  name: string;
  status: 'success' | 'failure';
  message?: string;
}

async function runProductionChecks(): Promise<CheckResult[]> {
  const results: CheckResult[] = [];

  // Check required environment variables
  const requiredEnvVars = [
    'MONGODB_URI',
    'REDIS_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'GOOGLE_MAPS_API_KEY',
    'TWILIO_ACCOUNT_SID',
    'SENDGRID_API_KEY',
  ];

  for (const envVar of requiredEnvVars) {
    results.push({
      name: `Environment Variable: ${envVar}`,
      status: process.env[envVar] ? 'success' : 'failure',
      message: process.env[envVar] ? undefined : `Missing ${envVar}`,
    });
  }

  // Check SSL configuration
  results.push({
    name: 'SSL Configuration',
    status: validateSSLConfig() ? 'success' : 'failure',
    message: validateSSLConfig() ? undefined : 'Invalid SSL configuration',
  });

  // Check database connection
  try {
    const client = await clientPromise;
    await client.db().command({ ping: 1 });
    results.push({
      name: 'MongoDB Connection',
      status: 'success',
    });
  } catch (error) {
    results.push({
      name: 'MongoDB Connection',
      status: 'failure',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  // Check Redis connection
  try {
    await redisClient.set('health-check', 'ok');
    await redisClient.del('health-check');
    results.push({
      name: 'Redis Connection',
      status: 'success',
    });
  } catch (error) {
    results.push({
      name: 'Redis Connection',
      status: 'failure',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  // Check build output
  const buildDir = path.join(process.cwd(), '.next');
  results.push({
    name: 'Build Output',
    status: fs.existsSync(buildDir) ? 'success' : 'failure',
    message: fs.existsSync(buildDir) ? undefined : 'Missing build output',
  });

  // Check public directory
  const publicDir = path.join(process.cwd(), 'public');
  const requiredPublicFiles = ['robots.txt', 'favicon.ico'];
  
  for (const file of requiredPublicFiles) {
    results.push({
      name: `Public File: ${file}`,
      status: fs.existsSync(path.join(publicDir, file)) ? 'success' : 'failure',
      message: fs.existsSync(path.join(publicDir, file)) 
        ? undefined 
        : `Missing ${file}`,
    });
  }

  return results;
}

// If running as a script
if (require.main === module) {
  runProductionChecks()
    .then((results) => {
      console.log('\nProduction Checks Results:\n');
      
      const failures = results.filter(r => r.status === 'failure');
      const successes = results.filter(r => r.status === 'success');

      // Print successes
      console.log('✅ Passed Checks:');
      successes.forEach(result => {
        console.log(`  - ${result.name}`);
      });

      // Print failures
      if (failures.length > 0) {
        console.log('\n❌ Failed Checks:');
        failures.forEach(result => {
          console.log(`  - ${result.name}`);
          if (result.message) {
            console.log(`    ${result.message}`);
          }
        });
        process.exit(1);
      }

      console.log(`\n${successes.length}/${results.length} checks passed`);
      process.exit(failures.length === 0 ? 0 : 1);
    })
    .catch((error) => {
      console.error('Failed to run production checks:', error);
      process.exit(1);
    });
}

export { runProductionChecks };