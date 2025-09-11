
export default function tokenOptions(type) {
  return {
    expiresIn: type.toLowerCase().trim() === "access" ? "1d" : "7d", // token valid for 1 day
    issuer: "Nishan and Nishant",
    subject: "Token option with expiry, issuer info, audience too", // subject of the token
    audience: "Issuers' backend users",
  };
}
