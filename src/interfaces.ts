export interface GuestAccount {
  username: string,
  password: string,
}

export interface AccountState {
  deviceString: string,
  deviceId: string,
  uuid: string,
  phoneId: string,
  adid: string,
  build: string,
}

export interface AccountStoreResource {
  username: string,
  password: string,
  state: AccountState,
  cookies: any,
}
