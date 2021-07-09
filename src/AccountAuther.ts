import { IgApiClient } from 'instagram-private-api'
import debug from 'debug'

import {AccountState, GuestAccount} from "./interfaces"

export default class AccountAuther {
  ig: IgApiClient
  log: any

  constructor() {
    this.log = debug('AccountAuther')

    this.ig = new IgApiClient()
    // this.ig.state.proxyUrl = proxy
    this.ig.request.end$.subscribe(this.requestSubscription.bind(this))
  }

  async login(account: GuestAccount) {
    this.log('login - Start')
    this.ig.state.generateDevice(account.username)

    this.log('login - preLoginFlow')
    await this.ig.simulate.preLoginFlow()

    await this.passwordLogin(account)

    this.log('login - End')
  }

  async passwordLogin(account: GuestAccount) {
    this.log('Performing password login...')

    await this.ig.account.login(account.username, account.password)

    this.log('Simulating post login flow...');
    await this.ig.simulate.postLoginFlow()

    this.log('Logged in');
  }

  private async requestSubscription() {
    const cookies: any = await this.ig.state.serializeCookieJar()
    const state: AccountState = {
      deviceString: this.ig.state.deviceString,
      deviceId: this.ig.state.deviceId,
      uuid: this.ig.state.uuid,
      phoneId: this.ig.state.phoneId,
      adid: this.ig.state.adid,
      build: this.ig.state.build,
    }
  }
}
