const express = require("express");
const router = express.Router();
// CODE
const { pagar } = require('../controllers/mercado_pago')

router.post("/", pagar)


module.exports = router;