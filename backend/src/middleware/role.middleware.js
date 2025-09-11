import ApiErrorResponse from "../utils/apiErrorResponse.js";
import codes from "../utils/statusCodes.js";

export default function role(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(codes.unauthorized)
        .json(
          new ApiErrorResponse(
            "Authentication required.",
            codes.unauthorized
          ).res()
        );
    }

    const hasRole = req.user.role.some((r) => allowedRoles.includes(r));
    if (!hasRole) {
      return res
        .status(codes.unauthorized)
        .json(new ApiErrorResponse("Access denied").res());
    }

    next();
  };
}
