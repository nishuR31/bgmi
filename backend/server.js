
import connect from "./src/config/connect.js";
import app from "./src/config/app.js";
import redis from "./src/config/redis.js";
import dotenv from "dotenv";

dotenv.config();

let port = process.env.PORT || 4321;

(async () => {
  try {
    app.listen(port, () => {
      console.log(`Server fired up on port : ${port}`);
    });
    await connect();
    await redis();
  } catch (err) {
    console.error(`Error occured firing up server and database : ${err}`);
  }
})();

