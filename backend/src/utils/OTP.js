import crypto from "crypto";
export let otp = async () => {
  let raw = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
  return { code: raw, hashCode: crypto.hash(raw, 10) };
};

export let expiry = (minutes = 5) => {
  return Date.now() + 1000 * 60 * minutes;
};
