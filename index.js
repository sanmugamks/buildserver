const express = require('express');
const bodyParser = require('body-parser');
const { doBuildProcess } = require('./services/doBuild')

const projects = {
  'hello': {
    'name': 'hello',
    'path': '/home/sanmugam/Documents/Starberry/nodejs/hello'
  }
}

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.get('/webhook', async (req, res) => {

  const project = 'hello';
  const projectConfig = projects[project]; 

  await doBuildProcess(projectConfig);

  res.status(200).send(`${project} - Trigger build process...`);
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
