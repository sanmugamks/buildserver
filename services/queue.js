const { Queue, Worker } = require('bullmq');

const redisConnection = require('./redis-connection') 
const { startBuildProcess } = require('./buildprocess')

buildProcessQueue = new Queue('BuildProcess', {
    connection: redisConnection
})

// Ref: https://docs.bullmq.io/guide/workers
// https://medium.com/@techsuneel99/message-queue-in-node-js-with-bullmq-and-redis-7fe5b8a21475#:~:text=BullMQ%20is%20a%20fast%2C%20robust,tasks%2C%20retrying%20failed%20jobs%20etc.

module.exports = {
    createOrGetQueue:  async () => {

        buildProcessQueue.on('completed', job => {
            console.log(`Job ${job.id} completed!`) 
        })

        buildProcessQueue.on('failed', (job, err) => {
            console.log(`Job ${job.id} failed with ${err}`)
        })

        buildProcessQueue.on('waiting', (jobId) => {
            // console.log(jobId)
            console.log(`Job ${JSON.stringify(jobId.id)} added`) 
        })

        return buildProcessQueue;
    },
    addJob: async (params) => {
        // Add a job of type 'email' to the 'mailer' queue
        await buildProcessQueue.add('build', params);
    },
    startWorker: async () => {
        console.log(`Start process from queue...`);

        const worker = new Worker('BuildProcess', async job => {
            console.log(job.data);
            const result = await startBuildProcess(job.data, job)
            console.log('********************')
            console.log(result);
            console.log('********************')
          },
          { connection: redisConnection }
        );


        worker.on('progress', (job, progress) => {
            console.log('progress', progress)
        });
        worker.on('completed', (job) => {
            console.log(`${job.id} has completed!`);
        });
        
        worker.on('failed', (job, err) => {
            console.log(`${job.id} has failed with ${err.message}`);
        });
    }

}