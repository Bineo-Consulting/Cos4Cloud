const fetch = require('node-fetch');
const dJSON = require('dirty-json')

p = fetch("https://api.ispotnature.org/ispotapi/content/observations?page=2", {
  "headers": {
    "authority": "api.ispotnature.org",
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9,es-ES;q=0.8,es;q=0.7,fr;q=0.6",
    "ispot-community": "21285",
    "ispot-language": "en",
    "ispot-origin": "b60e4df368c3187f848f496b0753f1fd1acea0f6",
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36",
    "ispot-token": "null",
    "origin": "https://www.ispotnature.org",
    "Cookie": "__cfduid=d7c9f8ac36c19683ff64c545349637e271600365161; _ga=GA1.2.63808785.1600365164; _gid=GA1.2.1538649754.1601375706; ispot_session=eyJpdiI6IkwxXC9aNGdEUVphdFRUeVZoTzdNbEZ3PT0iLCJ2YWx1ZSI6ImZDeGdQWk10Uk03VHk2cm5xV0hraXhCWTlseG41Y1BhTzZwSkY3TXhOckd1eisxejluOVwva045UDIzV1wvY01WamRMRmJ4SXpxQXBcL0dKOVl2aENLYStnPT0iLCJtYWMiOiIxOTUyZjgyYjIzYTU4ZmVmM2M5MDIyYmU4YzgxZjZiZTZiNzcxY2VmYmUxODllYjI0ODc5ZTkxNGI3N2YzYjM4In0%3D; _gat=1"
  },
  "referrer": "https://www.ispotnature.org/",
  "referrerPolicy": "no-referrer-when-downgrade",
  "body": null,
  "method": "GET"
});

p.then(res => res.text()).then(res => {
console.log(res.split("\n")[1])
  return dJSON.parse(res.split("\n")[1])
})


