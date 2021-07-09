import debug from 'debug'

import {AccountState, GuestAccount} from "./interfaces"

export default class AccountStore {
  log: any

  constructor() {
    this.log = debug('AccountStore')
  }

  async saveAccount(account: AccountStoreResource) {

  }
}
