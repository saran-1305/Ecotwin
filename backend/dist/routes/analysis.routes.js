"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analysis_controller_1 = require("../controllers/analysis.controller");
const router = (0, express_1.Router)();
const analysisController = new analysis_controller_1.AnalysisController();
router.post('/', analysisController.analyzeProduct.bind(analysisController));
exports.default = router;
