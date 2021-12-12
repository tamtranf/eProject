const SERVER_URL = "/api"
export default {
  serverUrl: SERVER_URL,
  get: (path, cb) => {
    //https://jasonwatmore.com/post/2020/04/30/vue-fetch-http-post-request-examples
    fetch(SERVER_URL + path, {
        method: 'get',
        headers: { 'Content-type': 'application/json' },
      }).then(async (response) => {
        const data = await response.json();
      if (data.success == true) {
        return cb(null, data.data);
      } else {
        return cb(data.error, response);
      }
    }).catch((error) => {
      console.log({error});
      return cb("サーバーへのアクセス中にエラーが発生しました。", null);
    });
  },

}