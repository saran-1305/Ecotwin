
import { Router } from 'express';
import { AnalysisController } from '../controllers/analysis.controller';

const router = Router();
const analysisController = new AnalysisController();

router.post('/', analysisController.analyzeProduct.bind(analysisController));

export default router;
