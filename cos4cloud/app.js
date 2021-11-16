'use strict';

const SwaggerExpress = require('swagger-express-mw');
const bodyParser = require('body-parser')
const app = require('express')();

app.use(bodyParser.json({ type: 'application/json' }))

// const cors = require('cors');

module.exports = app; // for testing

const config = {
  appRoot: __dirname // required config
};

SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  // app.use(cors())
  swaggerExpress.register(app);

  const port = process.env.PORT || 10010;
  app.listen(port);

  if (swaggerExpress.runner.swagger.paths['/observations']) {
    console.log('try this:\ncurl http://127.0.0.1:' + port + '/observations');
  }
});
