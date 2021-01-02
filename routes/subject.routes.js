const router = require("express").Router();

const { getUserById } = require("../controllers/user.controller");
const {
  isSignIn,
  isAuthenticated,
  isAdmin,
} = require("../controllers/auth.controller");
const {
  createSubject,
  getAllSubjects,
  getAdvertisements,
  getSubjectData,
  getSubjectById,
} = require("../controllers/subject.controller");

// params
router.param("userId", getUserById);

router.param("subjectId", getSubjectById);

router.post(
  "/subject/create-subject/:userId",
  isSignIn,
  isAuthenticated,
  isAdmin,
  createSubject
);

router.get(
  "/subject/all-subjects/:userId",
  isSignIn,
  isAuthenticated,
  getAllSubjects
);

router.get(
  "/subject/get-subject/:userId/:subjectId",
  isSignIn,
  isAuthenticated,
  getSubjectData
);

router.get(
  "/subject/get-advertisement/:userId",
  isSignIn,
  isAuthenticated,
  getAdvertisements
);

module.exports = router;
