import {map} from 'lodash';
import firebase from 'firebase';
import 'firebase/firestore';
import * as _debug from 'debug';
const debug = _debug.debug('AccountStore');

import admin from 'firebase-admin';
import * as _serviceAccount from '../../res/serviceAccount.json';

import {AccountNotFound} from './AccountNotFound';

const serviceAccount = {
  projectId: _serviceAccount.project_id,
  clientEmail: _serviceAccount.client_email,
  privateKey: _serviceAccount.private_key,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://instagram-bot-js.firebaseio.com',
});

const firestore = admin.firestore();
const accountsCol = firestore.collection('accounts');

export interface Account {
  username: string;
  password: string;
  taskProvider: string;
  bot: string;
  proxy?: string;
  cookies?: string;
  userAgent?: string;
  csrfToken?: string;
  igWwwClaim?: string;
  instagramAjax?: string;
}

export class AccountStore {
  static async find(username: string): Promise<Account> {
    const doc = accountsCol.doc(username);
    const snapshot = await doc.get();

    if (!snapshot.exists) {
      throw new AccountNotFound(username);
    }

    return Promise.resolve(AccountStore.buildAccountFromData(snapshot.data()));
  }

  static async all(): Promise<Account[]> {
    const snapshot = await accountsCol.get();
    const accounts = map(snapshot.docs, doc => AccountStore.buildAccountFromData(doc.data()));

    return Promise.resolve(accounts);
  }

  static async save(account: Account): Promise<void> {
    await accountsCol.doc(account.username).set(account, { merge: true });
    return Promise.resolve();
  }

  static buildAccountFromData(data: any): Account {
    return {
      ...data,
    }
  }
}
