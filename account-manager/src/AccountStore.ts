import firebase from 'firebase';
import 'firebase/firestore';

import admin from 'firebase-admin';
import * as _serviceAccount from '../res/serviceAccount.json';

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

class UserNotFound extends Error {
    constructor(username: string) {
        super(`User Not Found: ${username}`);
    }
}

interface User {
    username: string;
}

export default class AccountStore {
    static async find(username: string): Promise<User> {
        const doc = accountsCol.doc(username);
        const snapshot = await doc.get();

        if (!snapshot.exists) {
            throw new UserNotFound(username);
        }

        return AccountStore.buildUserFromData(username, snapshot.data());
    }

    // static async all(): Promise<User[]> {
    //
    // }
    //
    // static async save(user: User) {
    //
    // }

    static buildUserFromData(username: string, data: any): User {
        return {
            username,
        }
    }
}
