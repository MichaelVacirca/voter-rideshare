// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /lib/mongodb.ts
// MongoDB configuration - because every voter needs a reliable database!

import { MongoClient, Collection } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env');
}

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10,
};

declare global {
  var mongoClient: MongoClient | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global.mongoClient) {
    global.mongoClient = new MongoClient(uri, options);
  }
  client = global.mongoClient;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
}

clientPromise = client.connect();

export default clientPromise;

/**
 * Get a database collection with proper typing
 */
export function getCollection<T>(collectionName: string): Collection<T> {
  const client = new MongoClient(uri, options);
  return client.db().collection<T>(collectionName);
}

/**
 * Helper function to convert string IDs to ObjectIds
 */
export function toObjectId(id: string) {
  const ObjectId = require('mongodb').ObjectId;
  return new ObjectId(id);
}