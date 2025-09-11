
import mongoose from "mongoose";

async function connect() {
  try {
    await mongoose.connect(process.env.MONGOURI);
    console.log("Mongo fired up successfully");
  } catch (err) {
    console.error(`MongoDB extinguished successfully:${err}`);
  }
}

export default connect;

