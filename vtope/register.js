const axios = require('axios').default;

const vtopeUserId = `5018924`;
const vtopeKey    = `Rk5JnrXXr3pUOuwh`;
const vtopeUToken = `ysfqVZ7ag3QLNSIU`;

(async () => {
  try {
    const response = await axios.get(
      `https://vto.pe/botapi/user?utoken=${vtopeUToken}&device=macbook&program=js`
    );
    console.log(response.data);
  } catch(e) {
    console.error(e.message);
    console.error(e.response.data);

    process.exit(1);
  }
})();



