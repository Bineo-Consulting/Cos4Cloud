curl -X POST "https://my-api.plantnet.org/v2/observations/1003054780/votes/determination?api-key=2b10JYMpxAexS5HynCQCFpn6j" -H  "accept: application/json" -H  "Content-Type: application/json" -d '{"name": "rosa chinensis", "score": 1}'


# Problems with some observations
When querying observations some of them we did not find in the detail request, for example:
/observations?page=3&api-key=2b10JYMpxAexS5HynCQCFpn6j
  => [{"id":... "id": 1003054287, ...}]

/v2/observations/1003054287?api-key=2b10JYMpxAexS5HynCQCFpn6j
  {"statusCode":404,"error":"Not Found","message":"Observation not found"}
  => 404 not found

# votes
/v2/observations/{id}/votes/determination
When we vote some observation, we are receiving an 200 OK response,

fetch(`${host}/observations/1003054768/votes/determination?api-key=${token}`, {
  method: 'POST',
  headers: {
    accept: 'application/json',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'rosa chinensis',
    score: 0.9
  })
})

but we can't see that vote in the detail response:
/observation/14324324 => votes is still empty
 also in the list of "species" we did not find the specie we suggest
 we need that because we need to show the list of identifications and comments

# Comments
Instead of identifications, we can add Comments,
But we don't see that posibility in the model:
{
  "name": "string",
  "score": 0 # add some optional comments or remarks
}

