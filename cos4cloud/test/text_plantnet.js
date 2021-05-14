/*
Here is the new Pl@ntNet API test endpoint you should use for development purposes: 
https://my-api.plantnet.org:444/
It replaces : https://bourbonnais.cirad.fr:8083

The routes and return formats are basically the same, but some things changed :
 * ?token= parameter is replaced with ?api-key=
 * /v1 is replaced with /v2 in most routes
 * your new test key (associated to Cos4Cloud account) is 2b10JYMpxAexS5HynCQCFpn6j
*/

const fetch = require('node-fetch')
const fs = require('fs')
// const token = 'd9cfe6cf9bf71d42f67b4b0d80b56efa145abce2'
const token2 = '2b10JYMpxAexS5HynCQCFpn6j'
// const auth = `cos4cloud:M947vxKujjc2pkdr`
// const btoa = (data) => {
//   return Buffer.from(data).toString('base64')
// }

const url0 = 'https://bourbonnais.cirad.fr:8082/v1'
const url1 = 'http://mastodons.lirmm.fr:8088/cos4cloud/v1'
const url2 = 'https://my-api.plantnet.org:444/v2'

console.log(`${url2}/observations?api-key=${token2}`)
fetch(`${url2}/observations?api-key=${token2}`, {
  headers: {
    'content-type': 'application/json'
  }
})
.then(res => res.json())
.then(res => {
  console.log(res)
  fs.writeFileSync('plantnet.json', JSON.stringify(res, null, 2))
})
.catch(error => console.error(error))

