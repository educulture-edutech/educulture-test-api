const router = require("express").Router();

// ===================== IMPORTS ======================================================

const {
  getUserById,
  updateGoals,
  getAllGoals,
  getUserAccount,
  deleteAccount,
  getUserPurchaseList,
  clearUserPurchaseList,
} = require("../controllers/user.controller");
const {
  isSignIn,
  isAuthenticated,
  tokenVerify,
} = require("../controllers/auth.controller");

// ==================== PARAMS ========================================================

router.param("userId", getUserById);

// ==================== ROUTES ========================================================

router.put(
  "/user/update-goal/:userId",
  tokenVerify,
  isSignIn,
  isAuthenticated,
  updateGoals
);

router.get("/user/get-goals", getAllGoals);

router.get(
  "/user/get-account/:userId",
  tokenVerify,
  isSignIn,
  isAuthenticated,
  getUserAccount
);

router.get(
  "/user/get-subscriptions/:userId",
  tokenVerify,
  isSignIn,
  isAuthenticated,
  getUserPurchaseList
);

router.delete(
  "/user/delete-account/:userId",
  isSignIn,
  isAuthenticated,
  deleteAccount
);

// ----------------- this is temp route ---------------

router.put("/user/clear-user-purchase-list", clearUserPurchaseList);

module.exports = router;
