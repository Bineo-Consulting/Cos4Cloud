const fetch = require('node-fetch')
const fs = require('fs')
const token = 'd9cfe6cf9bf71d42f67b4b0d80b56efa145abce2'
const auth = `cos4cloud:M947vxKujjc2pkdr`
const btoa = (data) => {
  return Buffer.from(data).toString('base64')
}

const url0 = 'https://bourbonnais.cirad.fr:8082/v1'
const url1 = 'http://mastodons.lirmm.fr:8088/cos4cloud/v1'

fetch(`${url0}/observations?token=${token}`, {
  headers: {
    'content-type': 'application/json'
  }
})
.then(res => res.json())
.then(res => {
  console.log(res)
  fs.writeFileSync('plantnet.json', JSON.stringify(res, null, 2))
})

