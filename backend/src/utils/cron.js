
import cron from "node-cron";

let store = new Map();

let cronTask = {
  start: async function (instance, cb) {
    try {
      await this.stop(instance);
      let task = cron.schedule(instance.time, async () => {
        try {
          await cb(instance);
        } catch (err) {
          console.log(`Error setting up cron: ${err}`);
        }
      });
      task.start();
      store.set(instance_id.toString(), task);
      return task;
    } catch (err) {
      console.log(`Fatal error starting cron :${err}`);
    }
  },

  stop: async function (instance) {
    try {
      let task = store.get(instance._id.toString());
      task.stop();
      store.clear(instance._id);
      console.log(`Cron stopped`);
    } catch (err) {
      console.log(`Fatal error starting cron :${err}`);
    }
  },

  restart: async function (instance, cb) {
    try {
      await this.stop(instance);
      return await this.start(instance);
    } catch (err) {
      console.log(`Fatal error starting cron :${err}`);
    }
  },
};

export default cronTask;
