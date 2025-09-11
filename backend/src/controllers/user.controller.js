import User from "../models/user.model.js";

import ApiErrorResponse from "../utils/apiErrorResponse.js";
import { red } from "../config/redis.js";
import ApiResponse from "../utils/apiResponse.js";
import time from "../utils/time.js";
import codes from "../utils/statusCodes.js";
import hideEmail from "../utils/hideEmail.js";
import isEmpty from "../utils/isEmpty.js";
import {
  accessToken,
  tokens,
  verifyAccess,
  verifyRefresh,
} from "../utils/tokenGenerator.js";
import cookieOptions from "../utils/cookieOptions.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { mail, send } from "../utils/sendMail.js";
import { expiry, otp } from "../utils/OTP.js";
let roles = ["leader", "organizer", "admin"];
export let register = asyncHandler(async (req, res) => {
  let { email, password, userName, role } = req.body;
  if (isEmpty([email, password, userName, role])) {
    return res
      .status(codes.badRequest)
      .json(
        new ApiErrorResponse("All fields are required", codes.badRequest).res()
      );
  }

  if (!role.map((e) => roles.includes(e))) {
    return res
      .status(codes.badRequest)
      .json(new ApiErrorResponse("invalid role", codes.badRequest).res());
  }

  let emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email)) {
    return res
      .status(codes.badRequest)
      .json(
        new ApiErrorResponse("Invalid email format.", codes.badRequest).res()
      );
  }

  if (password.length < 8) {
    return res
      .status(codes.badRequest)
      .json(
        new ApiErrorResponse(
          "Password must be atleast 8 characters long.",
          codes.badRequest
        ).res()
      );
  }

  if (!/d/.test(password)) {
    return res
      .status(codes.badRequest)
      .json(
        new ApiErrorResponse(
          "Password must have a digit [1,2...].",
          codes.badRequest
        ).res()
      );
  }

  if (!/[a-z]/.test(password)) {
    return res
      .status(codes.badRequest)
      .json(
        new ApiErrorResponse(
          "Password must have a lowercase character [a-z].",
          codes.badRequest
        ).res()
      );
  }

  if (!/[A-Z]/.test(password)) {
    return res
      .status(codes.badRequest)
      .json(
        new ApiErrorResponse(
          "Password must have an uppercase character [A-Z].",
          codes.badRequest
        ).res()
      );
  }

  if (/s/.test(password)) {
    return res
      .status(codes.badRequest)
      .json(
        new ApiErrorResponse(
          "Password must not have any spaces between.",
          codes.badRequest
        ).res()
      );
  }

  if (!/W/.test(password)) {
    return res
      .status(codes.badRequest)
      .json(
        new ApiErrorResponse(
          "Password must have a symbol [!,@...].",
          codes.badRequest
        ).res()
      );
  }

  let existingEmail = await User.findOne({ email });

  if (existingEmail) {
    return res
      .status(codes.conflict)
      .json(
        new ApiErrorResponse("Email already exists.", codes.conflict).res()
      );
  }

  let existingUsername = await User.findOne({ userName });

  if (existingUsername) {
    return res
      .status(codes.conflict)
      .json(
        new ApiErrorResponse(
          `Account with username : ${userName} already exists`,
          codes.conflict
        ).res()
      );
  }

  let user = await User.create(req.body);
  if (!user) {
    return res
      .status(codes.internalServerError)
      .json(
        new ApiErrorResponse(
          "Registration failed, please retry.",
          codes.internalServerError
        ).res()
      );
  }

  return res.status(codes.created).json(
    new ApiResponse(
      "Account created and registered successfully,please return to login",
      codes.created,
      {
        userName: user.userName,
        email: hideEmail(user.email),
        photoUrl: user.photoUrl,
      }
    ).res()
  );
});

/////////////////////////////////////////////////////////////////

export let login = asyncHandler(async (req, res) => {
  let exist = json.parse(await red.hGet(`user:${user._id}`, "login"));
  if (req.user || exist) {
    return res.status(codes.ok).json(
      new ApiResponse(
        "User already logged in,try logging out before login again.",
        codes.ok,
        {
          user: {
            _id: req.user._id ?? exist._id,
            userName: req.user.userName ?? exist.userName,
            role: req.user.role ?? exist.role,
          },
        }
      ).res()
    );
  }
  let { data, password } = req.body;
  if (!data && !password) {
    return res
      .status(codes.badRequest)
      .json(
        new ApiErrorResponse(
          "Username or email required with password.",
          codes.badRequest
        ).res()
      );
  }

  let emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/;
  let gameIdRegex = /\d/;
  let field;
  if (emailRegex.test(data)) field = "email";
  else if (gameIdRegex.text(data)) field = "gameId";
  else field = "userName";

  let user = await User.findOne({ $or: [{ [field]: data }] });
  // let user = await User.findOne({ $or: [{ [field]: data }] }).select(" -refreshToken -otp ");
  if (!user) {
    return res
      .status(codes.notFound)
      .json(
        new ApiErrorResponse(
          "Account with credentials do not exist, try registering.",
          codes.notFound
        ).res()
      );
  }

  if (!user.comparePassword(password)) {
    return res
      .status(codes.conflict)
      .json(new ApiErrorResponse("Password mismatch.", codes.conflict).res());
  }

  let payload = { _id: user._id, userName: user.userName, role: user.role };
  let { accessToken, refreshToken } = tokens(payload);
  user.refreshToken = refreshToken;
  await user.save();

  res.cookie("accessToken", accessToken, cookieOptions("access"));
  res.cookie("refreshToken", refreshToken, cookieOptions("refresh"));
  await red.hSet(
    `user:${user._id}`,
    "login",
    json.str({ userName: user.userName, _id: user._id, role: user.role })
  ); //1day
  return res.status(codes.ok).json(
    new ApiResponse(
      `Welcome back ${user.userName}. Logging you in.`,
      codes.ok,
      {
        user: {
          _id: user._id,
          userName: user.userName,
          email: user.email,
          gameId: user.gameId ?? "Not yet set",
          gameName: user.gameName ?? "Not yet set",
          role: user.role,
          wallet: user.wallet ?? "Not yet set",
          organized: user.organized ?? "Not yet set",
          teams: user.teams ?? "Not yet set",
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        accessToken: accessToken,
      }
    ).res()
  );
});

////////////////////////////////////////////////////////////////////////////

export let profile = asyncHandler(async (req, res) => {
  let id = req.params.id;
  let exist = json.parse(await red.hGet(`user:${user._id}`, "profile"));
  if (exist) {
    return res.status(codes.ok).json(
      new ApiResponse(`User ${user.userName} found successfully.`, codes.ok, {
        user: {
          _id: exist._id,
          userName: exist.userName,
          email: exist.email,
          gameId: exist.gameId ?? "Not yet set",
          gameName: exist.gameName ?? "Not yet set",
          role: exist.role,
          lastLogin: exist.lastLogin,
          loginAttempt: exist.loginAttempt,
          failedAttempt: exist.failedAttempt,
          wallet: exist.wallet ?? "Not yet set",
          organized: exist.organized ?? "Not yet set",
          teams: exist.teams ?? "Not yet set",
          createdAt: exist.createdAt,
          updatedAt: exist.updatedAt,
        },
      }).res()
    );
  }

  let user = await User.findById(id);
  if (!user) {
    return res
      .status(codes.notFound)
      .json(new ApiErrorResponse("No user found.", codes.notFound).res());
  }
  await red.hSet(
    `user:${user._id}`,
    "profile",
    json.str({
      _id: user._id,
      userName: user.userName,
      email: user.email,
      gameId: user.gameId ?? "Not yet set",
      gameName: user.gameName ?? "Not yet set",
      role: user.role,
      lastLogin: user.lastLogin,
      loginAttempt: user.loginAttempt,
      failedAttempt: user.failedAttempt,
      wallet: user.wallet ?? "Not yet set",
      organized: user.organized ?? "Not yet set",
      teams: user.teams ?? "Not yet set",
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
  );
  return res.status(codes.ok).json(
    new ApiResponse(`User ${user.userName} found successfully.`, codes.ok, {
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        gameId: user.gameId ?? "Not yet set",
        gameName: user.gameName ?? "Not yet set",
        role: user.role,
        lastLogin: user.lastLogin,
        loginAttempt: user.loginAttempt,
        failedAttempt: user.failedAttempt,
        wallet: user.wallet ?? "Not yet set",
        organized: user.organized ?? "Not yet set",
        teams: user.teams ?? "Not yet set",
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    }).res()
  );
});
/////////////////////////////////////////////////////////////
export let logout = asyncHandler(async (req, res) => {
  // let exist=json.parse(await red.hGet(`user:${user._id}`,"login))
  for (let cookie in req.cookies) {
    res.clearCookie(cookie, {
      httpOnly: true,
      path: "/",
      secure: true,
      sameSite: "None",
    });
  }

  const keys = await red.keys("user:*");
  if (keys) {
    let delKeys = keys.filter((key) => key !== "user:0000");
    // await Promise.all(delKeys.map(key=>red.del(key)))
    await red.del(...delKeys);
  }

  return res
    .status(codes.ok)
    .json(new ApiResponse(`User successfully logged out.`, codes.ok).res());
});

///////////////////////////////////////////////

export let updateProfile = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res
      .status(codes.unauthorized)
      .json(
        new ApiErrorResponse(
          "User not authorized,please login before updating profile.",
          codes.unauthorized
        ).res()
      );
  }

  let { email, gameId, gameName, contact } = req.body;
  let exist = json.parse(await red.hGet(`user:${user._id}`, "login"));
  let user = await User.findById(req.user._id).select(
    "-password -refreshToken -otp"
  );

  if (!req.user._id || !exist._id) {
    return res
      .status(codes.unauthorized)
      .json(
        new ApiErrorResponse(
          "Login required before updating.",
          codes.unauthorized
        ).res()
      );
  }

  // Update fields if changed
  if (gameId && user.gameId !== gameId) {
    user.gameId = gameId;
  }
  if (email && user.email !== email) {
    user.email = email;
  }
  if (gameName !== undefined && user.gameName !== gameName) {
    user.gameName = gameName;
  }
  if (contact !== undefined && user.contact !== contact) {
    user.contact = contact;
  }

  await user.save();
  await red.hSet(
    `user:${user._id}`,
    "profile",
    json.str({
      _id: user._id,
      userName: user.userName,
      email: user.email,
      gameId: user.gameId ?? "Not yet set",
      gameName: user.gameName ?? "Not yet set",
      role: user.role,
      lastLogin: user.lastLogin,
      loginAttempt: user.loginAttempt,
      failedAttempt: user.failedAttempt,
      wallet: user.wallet ?? "Not yet set",
      organized: user.organized ?? "Not yet set",
      teams: user.teams ?? "Not yet set",
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
  );
  return res.status(codes.ok).json(
    new ApiResponse("User profile successfully updated", codes.ok, {
      user: user,
    }).res()
  );
});

///////////////////////////////////////////////////////////

export let del = asyncHandler(async (req, res) => {
  let exist = json.parse(await red.hGet(`user:${process.env.KEY}`, "login"));
  let user = await User.findByIdAndDelete(req.user._id ?? exist._id);
  if (!user) {
    return res
      .status(codes.notFound)
      .json(new ApiErrorResponse("User not found.", codes.notFound).res());
  }

  let keys = await red.get(`user:*`);
  if (keys) {
    let delkeys = keys.filter((key) => key !== "user:0000");
    await red.del(...delkeys);
  }

  return res
    .status(codes.ok)
    .json(new ApiResponse("Users successfully deleted", codes.ok).res());
});

////////////////////////////////////////////////

export let refresh = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res
      .status(codes.unauthorized)
      .json(
        new ApiErrorResponse("User not authenticated", codes.unauthorized).res()
      );
  }
  let user = await User.findById(req.user._id);
  if (!user) {
    return res
      .status(codes.notFound)
      .json(
        new ApiErrorResponse(
          "User not found. Try registering",
          codes.notFound
        ).res()
      );
  }

  let decodedRefresh;
  if (user.refreshToken) {
    try {
      decodedRefresh = await verifyRefresh(user.refreshToken);
    } catch (err) {
      console.log(`Error verifying token: ${err.message}`);
      return res
        .status(codes.badRequest)
        .json(
          new ApiErrorResponse(
            "Token verification failed",
            codes.badRequest
          ).res()
        );
    }
  }

  if (decodedRefresh._id !== user._id) {
    return res
      .status(codes.conflict)
      .json(
        new ApiErrorResponse(
          "Token mismatched. Login again",
          codes.conflict
        ).res()
      );
  }

  let accessToken = await accessToken({
    userName: user.userName,
    _id: user._id,
    role: user.role,
  });

  res.cookie("accessToken", accessToken, cookieOptions("access"));

  return res
    .status(codes.ok)
    .json(new ApiResponse("Token refreshed", codes.ok).res());
});

/////////////////////////////////////////////////////////////////////////////////

// helper for OTP expiry time

export const forgotPass = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res
      .status(codes.notFound)
      .json(new ApiErrorResponse("Email not found.", codes.notFound).res());
  }

  // generate OTP
  const { code, hashCode } = otp();

  user.otp = {
    code: hashCode,
    verified: false,
    expiry: expiry(5),
  };

  await user.save();

  // send mail immediately
  await mail({
    to: email,
    subject: "XGround Password Reset",
    text: `Your OTP is ${code}. It will expire in 5 minutes.`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Password Reset</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px;">
  <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
    <h2 style="color: #007bff;">Password Reset</h2>
    <p style="font-size: 15px; color: #333;">
      Your OTP is <b style="font-size: 18px; color: #d9534f;">${code}</b>.  
      It will expire in <b>5 minutes</b>.
    </p>
    <p style="font-size: 14px; color: #555;">
      If you did not request this reset, please ignore this email or contact our support team.
    </p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
    <p style="font-size: 13px; color: #666;">
      Regards,<br/>
      <strong>XGround Security Team</strong>
    </p>
  </div>
</body>
</html>
`,
  });

  localStorage.setItem("email", email);

  return res
    .status(codes.ok)
    .json(new ApiResponse("OTP sent to your email.", codes.ok).res());
});

////////////////////////////////////////////////////////

export const verifyOtp = asyncHandler(async (req, res) => {
  const { otp } = req.body;

  const user = await User.findOne({ email: localStorage.getItem("email") });
  if (!user) {
    return res
      .status(codes.notFound)
      .json(new ApiErrorResponse("Email not found.", codes.notFound).res());
  }

  if (!bcrypt.compare(user.otp.code, otp)) {
    return res
      .status(codes.conflict)
      .json(new ApiErrorResponse("Invalid otp.", codes.conflict).res());
  }

  if (user.otp.expiry > Date.now()) {
    return res
      .status(codes.conflict)
      .json(new ApiErrorResponse("OTP expired.", codes.conflict).res());
  }
  user.otp.verified = true;
  user.otp.expiry = null;
  await user.save();

  return res
    .status(codes.ok)
    .json(new ApiResponse("OTP verification done", codes.ok).res());
});

////////////////////////////////////////////////////////

export const changePass = asyncHandler(async (req, res) => {
  const { password } = req.body;

  const user = await User.findOne({ email: localStorage.getItem("email") });
  if (!user) {
    return res
      .status(codes.notFound)
      .json(new ApiErrorResponse("Email not found.", codes.notFound).res());
  }

  if (!user.otp.verified) {
    return res
      .status(codes.conflict)
      .json(new ApiErrorResponse("OTP not verified.", codes.conflict).res());
  }

  if (password.length < 8) {
    return res
      .status(codes.badRequest)
      .json(
        new ApiErrorResponse(
          "Password must be atleast 8 characters long.",
          codes.badRequest
        ).res()
      );
  }

  if (bcrypt.compare(password, user.password)) {
    return res
      .status(codes.conflict)
      .json(
        new ApiErrorResponse(
          "Password must be different from previous one.",
          codes.conflict
        ).res()
      );
  }

  if (!/d/.test(password)) {
    return res
      .status(codes.badRequest)
      .json(
        new ApiErrorResponse(
          "Password must have a digit [1,2...].",
          codes.badRequest
        ).res()
      );
  }

  if (!/[a-z]/.test(password)) {
    return res
      .status(codes.badRequest)
      .json(
        new ApiErrorResponse(
          "Password must have a lowercase character [a-z].",
          codes.badRequest
        ).res()
      );
  }

  if (!/[A-Z]/.test(password)) {
    return res
      .status(codes.badRequest)
      .json(
        new ApiErrorResponse(
          "Password must have an uppercase character [A-Z].",
          codes.badRequest
        ).res()
      );
  }

  if (/s/.test(password)) {
    return res
      .status(codes.badRequest)
      .json(
        new ApiErrorResponse(
          "Password must not have any spaces between.",
          codes.badRequest
        ).res()
      );
  }

  if (!/W/.test(password)) {
    return res
      .status(codes.badRequest)
      .json(
        new ApiErrorResponse(
          "Password must have a symbol [!,@...].",
          codes.badRequest
        ).res()
      );
  }
  user.password = password;

  user.otp.verified = false;
  await user.save();
  await mail({
    to: localStorage.getItem("email"),
    subject: "XGround Password Change Done",
    text: `Your password is successfully changed.`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Password Changed</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px;">
  <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
    <h2 style="color: #d9534f;">Your password is successfully changed</h2>
    <p style="font-size: 15px; color: #333;">
      If this was not done by you, please <a href="https://xground.com/reset-password" style="color: #007bff; text-decoration: none;">reset your password immediately</a> and contact our support team.
    </p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
    <p style="font-size: 13px; color: #666;">
      Regards,<br/>
      <strong>XGround Security Team</strong>
    </p>
  </div>
</body>
</html>
`,
  });

  localStorage.clear();

  return res
    .status(codes.ok)
    .json(
      new ApiResponse("Password changed. Please login again.", codes.ok).res()
    );
});

///////////////////////////////////////////////////////////////////////////////

export const passwordLessMail = asyncHandler(async (req, res) => {
  let { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res
      .status(codes.notFound)
      .json(new ApiErrorResponse("Email not found.", codes.notFound).res());
  }

  let token = accessToken({ _id: iser._id });

  await mail({
    to: email,
    subject: "XGround Login",
    text: `Click button below to login.`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Login Link</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px;">
  <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
    
    <h2 style="color: #007bff; margin-bottom: 20px;">Click below to login</h2>

    <a href="https://xground.com/password-less-login?z0mp0tmU2RUOhDo2b10hl21VR3mryg2UuCGhHEer=${token}" 
       style="display: inline-block; background-color: #28a745; color: #fff; 
              padding: 12px 24px; border-radius: 6px; text-decoration: none; 
              font-weight: bold; font-size: 16px;">
      Login
    </a>

    <p style="font-size: 15px; color: #333; margin-top: 20px;">
      If this action was not done by you, please 
      <a href="https://xground.com/reset-password" style="color: #d9534f; text-decoration: none;">
        reset your password immediately
      </a> and contact our support team.
    </p>

    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />

    <p style="font-size: 13px; color: #666;">
      Regards,<br/>
      <strong>XGround Security Team</strong>
    </p>
  </div>
</body>
</html>
`,
  });

  return res
    .status(codes.ok)
    .json(new ApiResponse("Check your mail.", codes.ok).res());
});

//////////////////////////////////////////////////////////

export const passwordLessLogin = asyncHandler(async (req, res) => {
  let { z0mp0tmU2RUOhDo2b10hl21VR3mryg2UuCGhHEer: token } = req.params;

  let decoded;
  try {
    decoded = verifyAccess(token);
  } catch (err) {
    return res
      .status(codes.badRequest)
      .json(new ApiErrorResponse("Token invalid", codes.badRequest).res());
  }
  const user = await User.findOne({ email: localStorage.getItem("email") });
  if (!user) {
    return res
      .status(codes.notFound)
      .json(new ApiErrorResponse("Email not found.", codes.notFound).res());
  }

  if (!decoded._id === user._id) {
    return res
      .status(codes.conflict)
      .json(
        new ApiErrorResponse("Mismatch token, try again", codes.conflict).res()
      );
  }

  localStorage.clear();

  return res
    .status(codes.ok)
    .json(new ApiResponse(`Welcome back ${user.userName}`, codes.ok).res());
});
