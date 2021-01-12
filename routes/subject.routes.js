const router = require("express").Router();

// ================== IMPORTS ======================================

const { getUserById } = require("../controllers/user.controller");
const {
  isSignIn,
  isAuthenticated,
  isAdmin,
  isTokenExpired,
} = require("../controllers/auth.controller");
const {
  createSubject,
  getAllSubjects,
  getAdvertisements,
  getSubjectData,
  getSubjectById,
} = require("../controllers/subject.controller");

// ================== PARAMS =======================================
router.param("userId", getUserById);

router.param("subjectId", getSubjectById);

// ================== ROUTES =======================================

router.post(
  "/subject/create-subject/:userId",
  isTokenExpired,
  isSignIn,
  isAuthenticated,
  isAdmin,
  createSubject
);

router.get(
  "/subject/all-subjects/:userId",
  isTokenExpired,
  isSignIn,
  isAuthenticated,
  getAllSubjects
);

router.get(
  "/subject/get-subject/:userId/:subjectId",
  isTokenExpired,
  isSignIn,
  isAuthenticated,
  getSubjectData
);

router.get(
  "/subject/get-advertisement/:userId",
  isTokenExpired,
  isSignIn,
  isAuthenticated,
  getAdvertisements
);

module.exports = router;
