# Cos4Cloud - Expert Portal

## What is Cos4Cloud:

Cos4Cloud is H2020 European Project, and one of their service is a Platform that allow to the experts to Find, Access, Reuse and Interoperate with observations from differentes Citizen Observatories, following the FAIR rules in terms to integrate in the future in the best way in the EOSC environment. 

## What is the Expert Portal:

## What are the Biodiversty CO envolved?

- ArtPortalen: https://www.artportalen.se/

- iSpot: https://www.ispotnature.org/

- Natusfera: https://natusfera.org 

- PlantNet: https://plantnet.org/

And we hope that in the near future more Biodiversity CO could integrate in this service.

## What are the Environmental CO envolved?

- OdourCollect: https://odourcollect.eu

- CanAir.oi: https://canair.io/


## How to deploy Cos4Cloud env. locally:

The first thing that you have to do is install docker, but what is docker? https://www.docker.com/why-docker 

Once you have installed this sotfware on your machine the only thing that you have to do is type the next commando inside the Cos4Cloud folder:

```docker-compose up```

and that's all 🙌

Now you can open your favourite browser and type: http://localhost:3333

and Enjoy!!


### front-end
#### cd cos4cloud-frontend
```npm start```

### backend development mode
#### https://www.npmjs.com/package/firebase-tools
#### cd cos4cloud/functions
```npm run serve```
