const { addJob, startWorker } = require('./queue');

module.exports = {
    doBuildProcess: async (params) => {
      await addJob(params);
      await startWorker();
    }
}