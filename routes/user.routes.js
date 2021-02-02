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
  pushSubjectToUserPurchaseList,
} = require("../controllers/user.controller");
const {
  isSignIn,
  isAuthenticated,
  tokenVerify,
  isAdmin,
} = require("../controllers/auth.controller");
const { getSubjectById } = require("../controllers/subject.controller");

// ==================== PARAMS ========================================================

router.param("userId", getUserById);
router.param("subjectId", getSubjectById);

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

router.post(
  "/user/push-subject/:userId/:subjectId",
  tokenVerify,
  isSignIn,
  isAuthenticated,
  isAdmin,
  pushSubjectToUserPurchaseList
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
