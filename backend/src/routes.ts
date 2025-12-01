import { Router } from 'express';
import { PdfController } from './controllers/PdfController';

const router = Router();
const pdfController = new PdfController();

router.post('/generate-pdf', pdfController.generate);

export default router;
