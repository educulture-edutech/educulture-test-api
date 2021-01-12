const router = require("express").Router();

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
  isTokenExpired,
} = require("../controllers/auth.controller");

// params
router.param("userId", getUserById);

// routes
router.put(
  "/user/update-goal/:userId",
  isTokenExpired,
  isSignIn,
  isAuthenticated,
  updateGoals
);

router.get("/user/get-goals", getAllGoals);

router.get(
  "/user/get-account/:userId",
  isTokenExpired,
  isSignIn,
  isAuthenticated,
  getUserAccount
);

router.get(
  "/user/get-subscriptions/:userId",
  isTokenExpired,
  isSignIn,
  isAuthenticated,
  getUserPurchaseList
);

router.delete(
  "/user/delete-account/:userId",
  isTokenExpired,
  isSignIn,
  isAuthenticated,
  deleteAccount
);

// ----------------- this is temp route ---------------

router.put("/user/clear-user-purchase-list", clearUserPurchaseList);

module.exports = router;
