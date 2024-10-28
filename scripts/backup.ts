// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /scripts/backup.ts
// Backup configuration - because every vote counts, and so does every byte!

import { exec } from 'child_process';
import { promisify } from 'util';
import { S3 } from 'aws-sdk';
import { format } from 'date-fns';

const execAsync = promisify(exec);

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const BACKUP_BUCKET = process.env.BACKUP_BUCKET || 'voter-rideshare-backups';
const MONGODB_URI = process.env.MONGODB_URI;

async function createBackup() {
  try {
    // Create timestamp for backup
    const timestamp = format(new Date(), 'yyyy-MM-dd-HH-mm');
    const backupPath = `/tmp/backup-${timestamp}`;

    // Backup MongoDB
    console.log('Starting MongoDB backup...');
    await execAsync(`mongodump --uri="${MONGODB_URI}" --out=${backupPath}`);

    // Create archive
    console.log('Creating backup archive...');
    await execAsync(`tar -czf ${backupPath}.tar.gz ${backupPath}`);

    // Upload to S3
    console.log('Uploading to S3...');
    await s3.upload({
      Bucket: BACKUP_BUCKET,
      Key: `mongodb/backup-${timestamp}.tar.gz`,
      Body: require('fs').createReadStream(`${backupPath}.tar.gz`),
    }).promise();

    // Cleanup
    await execAsync(`rm -rf ${backupPath} ${backupPath}.tar.gz`);

    console.log('Backup completed successfully');
  } catch (error) {
    console.error('Backup failed:', error);
    throw error;
  }
}

// Function to rotate old backups
async function rotateBackups() {
  try {
    const MAX_BACKUPS = 30; // Keep last 30 days of backups

    const objects = await s3.listObjects({
      Bucket: BACKUP_BUCKET,
      Prefix: 'mongodb/',
    }).promise();

    if (objects.Contents) {
      // Sort by date, newest first
      const sortedObjects = objects.Contents.sort((a, b) => 
        (b.LastModified?.getTime() || 0) - (a.LastModified?.getTime() || 0)
      );

      // Delete older backups
      const objectsToDelete = sortedObjects.slice(MAX_BACKUPS);
      
      if (objectsToDelete.length > 0) {
        await s3.deleteObjects({
          Bucket: BACKUP_BUCKET,
          Delete: {
            Objects: objectsToDelete.map(obj => ({ Key: obj.Key || '' })),
          },
        }).promise();

        console.log(`Deleted ${objectsToDelete.length} old backups`);
      }
    }
  } catch (error) {
    console.error('Backup rotation failed:', error);
    throw error;
  }
}

// If running as a script
if (require.main === module) {
  // Run backup and rotation
  createBackup()
    .then(rotateBackups)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Backup process failed:', error);
      process.exit(1);
    });
}

export { createBackup, rotateBackups };