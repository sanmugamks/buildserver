const express = require('express');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.get('/webhook', (req, res) => {
  // Validate the webhook payload or perform any necessary checks

  const siteCode = 'hello';

  // set project path
  const projectPath = {
    cwd: '/home/sanmugam/Documents/Starberry/nodejs/hello', // Set the path to your Git repository
  }


  // // Start pm2 process
  // const pm2Process = spawn('pm2', ['reload "Prod"'], projectPath);

  // pm2Process.stdout.on('data', (data) => {
  //   console.log(`Pm2 output: ${data}`);
  // });

  // pm2Process.stderr.on('data', (data) => {
  //   console.error(`Error updating repository: ${data}`);
  // });

  // pm2Process.on('close', (gitPullCode) => {
  //   console.log('Reload pm2 successful....');
  // });

  const gitPull = spawn('git', ['pull', 'origin', 'main'], projectPath);

  gitPull.stdout.on('data', (data) => {
    console.log(`Git pull output: ${data}`);
  });

  gitPull.stderr.on('data', (data) => {
    console.error(`Error updating repository: ${data}`);
    // res.status(500).send('Error updating repository');
  });

  gitPull.on('close', (gitPullCode) => {
    if (gitPullCode === 0) {

      // const nodeVersion = spawn('nvm', ['use stable']);

      // nodeVersion.on('close', (nodeVersionCode) => {

        // Git pull successful, proceed to Gatsby build
        const gatsbyBuild = spawn('yarn', ['build'], projectPath);

        gatsbyBuild.stdout.on('data', (buildData) => {
          console.log(`Build output: ${buildData}`);
        });

        gatsbyBuild.stderr.on('data', (buildErrorData) => {
          console.error(`Error during build: ${buildErrorData}`);
        });

        gatsbyBuild.on('close', (gatsbyBuildCode) => {
          if (gatsbyBuildCode === 0) {
            // Gatsby build successful
            console.log('Build successful....');
            res.status(200).send('Webhook received and build triggered successfully');

            
          } else {
            // Gatsby build failed
            console.error(`Gatsby build exited with code ${gatsbyBuildCode}`);
            res.status(500).send('Gatsby build unsuccessful');
          }
        });
      // })
    } else {
      // Git pull failed
      console.error(`Git pull exited with code ${gitPullCode}`);
      res.status(500).send('Git pull unsuccessful');
    }
  });

  // res.status(200).send('Successfull...');
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
