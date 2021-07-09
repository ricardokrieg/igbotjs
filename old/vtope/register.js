const axios = require('axios').default;

const vtopeUToken = `ysfqVZ7ag3QLNSIU`;

(async () => {
  try {
    const response = await axios.get(
      `https://vto.pe/botapi/user?utoken=${vtopeUToken}&device=${device}&program=${program}`
    );
    console.log(response.data);
  } catch(e) {
    console.error(e.message);
    console.error(e.response.data);

    process.exit(1);
  }
})();



