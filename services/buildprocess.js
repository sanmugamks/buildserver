const { spawn } = require('child_process');

// Ref: https://nodejs.org/api/child_process.html

module.exports = {

    startBuildProcess: async (params = {}, job) => {

        return new Promise((resolve, reject) => {
            // set project path
            const projectPath = {
                cwd: params.path, // Set the path to your Git repository
            }

            const gitPull = spawn('git', ['pull', 'origin', 'main'], projectPath);

            gitPull.stdout.on('data', (data) => {
                console.log(`Git pull output: ${data}`);
            });

            gitPull.stderr.on('data', (data) => {
                console.error(`Error updating repository: ${data}`);
            });

            gitPull.on('close', (gitPullCode) => {
            // await job.updateProgress(42);
                if (gitPullCode === 0) {

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
                            resolve('Webhook received and build triggered successfully')
                        } else {
                            // Gatsby build failed
                            console.error(`Gatsby build exited with code ${gatsbyBuildCode}`);
                            reject(`Gatsby build exited with code ${gatsbyBuildCode}`)
                        }
                    });

                } else {
                    // Git pull failed
                    console.error(`Git pull exited with code ${gitPullCode}`);
                    reject(`Git pull exited with code ${gitPullCode}`)
                }
            });
        });   
    }

}
