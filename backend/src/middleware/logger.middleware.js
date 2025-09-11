
export default function logger(req, res, next) {
  console.log({
    method: req.method,
    secure: req.secure,
    urls: {
      path: req.secure
        ? "https"
        : "http" + "://" + req.host + req.baseUrl + req.url,
      hostname: req.hostname,
      port: req.host.split(":")[req.host.split(":").length - 1],
      base: req.baseUrl,
      url: req.url,
    },
    statusCode: res.statusCode,
    time: new Date().toLocaleString(),
    parameters: req.params,
    query: req.query,
  });

  next();
}
