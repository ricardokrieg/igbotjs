import AccountAuther from "./AccountAuther"
import {GuestAccount} from "./interfaces"

(async () => {
  const account: GuestAccount = {
    username: 'casasbahia.pesquisa.4',
    password: 'xxx123xxx',
  }

  const accountAuther = new AccountAuther()

  return accountAuther.login(account)
})()
