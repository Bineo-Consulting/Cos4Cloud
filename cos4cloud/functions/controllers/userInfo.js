const fetch = require('node-fetch')

function btoa(b) {
  return Buffer.from(b).toString('base64');
};

const userInfo = (req, res) => {
  const clientId = 'c1d079f6-e0be-4c25-df4a-a881bb41afa1'
  const clientSecret = 'fc18afdb5c493b6e5be63623dfd814bcdd8dd635abe175a12fe330e3d4dc9386'
  const url = 'https://www.authenix.eu/oauth/tokeninfo'

  return fetch(url, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + btoa(`${clientId}:${clientSecret}`),
      accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `token=${req.query.access_token}&token_type_hint=access_token`
  }).then(r => r.json())
  .then(r => res.json(r))
  .catch(r => res.error({
    res: r,
    query: req.query.access_token
  }))
}
module.exports = userInfo