const express = require("express");
const router = express.Router();
const {
  verifyToken,
  isAdminOrLoanOfficer,
} = require("../middlewares/authMiddleware");
// const upload = require("../middlewares/uploadMiddleware");
const contactController = require("../controllers/contactController");

router.post(
  "/add",
  verifyToken,
  isAdminOrLoanOfficer,
  // upload.single("profilePicture"),
  contactController.createContact
);
router.put(
  "/:contactId",
  verifyToken,
  isAdminOrLoanOfficer,
  // upload.single("profilePicture"),
  contactController.updateContact
);
router.delete(
  "/:contactId",
  verifyToken,
  isAdminOrLoanOfficer,
  contactController.deleteContact
);
router.get(
  "/get",
  verifyToken,
  isAdminOrLoanOfficer,
  contactController.getAllContacts
);

module.exports = router;
