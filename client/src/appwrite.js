// src/appwrite.js
import { Client, Account, Storage, ID, Permission, Role } from 'appwrite';

const client = new Client();

client
  .setEndpoint('https://fra.cloud.appwrite.io/v1') // Replace with your Appwrite endpoint
  .setProject('68444194002bfb6f87a6');                   // Replace with your project ID

const account = new Account(client);
const storage = new Storage(client);

export { client, account, storage, ID, Permission, Role };
