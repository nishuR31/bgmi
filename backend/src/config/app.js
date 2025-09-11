
import express from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import cookie from "cookie-parser";
import logger from "../midlleware/logger.middleware.js";
import codes from "../utils/statusCodes.js";
import rateLimit from "express-rate-limit";
import path from "path";
import ApiErrorResponse from "../utils/apiErrorResponse.js";
import ApiResponse from "../utils/apiResponse.js";
import fileUpload from "express-fileupload";

let app = express();

let corsOptions = {
  origin: "frontendUrl",
  credentials: true,
};

let helmetOptions = {
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
};

// let limter = rateLimit({
//   windowMs: 1 * 24 * 60 * 60 * 1000, // days
//   max: 100, // limit each IP
//   message: "Too many requests, please try again later after one day.",
//   standardHeaders: true, // return info in RateLimit-* headers
//   legacyHeaders: false, // disable X-RateLimit-* headers
// });

app.use(
  fileUpload({
    useTempFiles: true, // saves to /tmp by default
    tempFileDir: "/tmp/",
    limits: { fileSize: 1 * 1024 * 1024 }, // 1MB max (optional)
    createParentPath: true, // create parent folders if not exist
  })
);

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(morgan("dev"));
app.use(cors(corsOptions));
app.use(helmet(helmetOptions));
app.use(cookie());
// app.use(limter);
app.use(logger);
// app.use(express.static(path.join(__dirname, "/frontend")));

app.get("/", (req, res) => {
  res
    .status(codes.ok)
    .json(new ApiResponse("Server is spinning..", codes.ok).res());
});
app.get("/*splat", (req, res) => {
  res
    .status(codes.notFound)
    .json(new ApiErrorResponse("Invalid route..", codes.notFound).res());
});
app.use((err, req, res, next) => {
  res
    .status(codes.notFound)
    .json(
      new ApiErrorResponse("Error occured..", codes.notFound, {}, err).res()
    );
});

export default app;
