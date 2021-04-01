import 'firebase/firestore';
interface User {
    username: string;
}
export default class AccountStore {
    static find(username: string): Promise<User>;
    static buildUserFromData(username: string, data: any): User;
}
export {};
