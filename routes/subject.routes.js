const router = require("express").Router();

// ================== IMPORTS ======================================

const { getUserById } = require("../controllers/user.controller");
const {
  isSignIn,
  isAuthenticated,
  isAdmin,
  tokenVerify,
} = require("../controllers/auth.controller");
const {
  createSubject,
  getAllSubjects,
  getAdvertisements,
  getSubjectData,
  getSubjectById,
  updateSubject,
} = require("../controllers/subject.controller");

// ================== PARAMS =======================================
router.param("userId", getUserById);

router.param("subjectId", getSubjectById);

// ================== ROUTES =======================================

router.post(
  "/subject/create-subject/:userId",
  tokenVerify,
  isSignIn,
  isAuthenticated,
  isAdmin,
  createSubject
);

router.put(
  "/subject/update-subject/:userId/:subjectId",
  tokenVerify,
  isSignIn,
  isAuthenticated,
  isAdmin,
  updateSubject
);

router.get(
  "/subject/all-subjects/:userId",
  tokenVerify,
  isSignIn,
  isAuthenticated,
  getAllSubjects
);

router.get(
  "/subject/get-subject/:userId/:subjectId",
  tokenVerify,
  isSignIn,
  isAuthenticated,
  getSubjectData
);

router.get(
  "/subject/get-advertisement/:userId",
  tokenVerify,
  isSignIn,
  isAuthenticated,
  getAdvertisements
);

module.exports = router;
