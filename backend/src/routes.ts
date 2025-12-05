import { Router } from 'express';
import { PdfController } from './controllers/PdfController';
import { DocxController } from './controllers/DocxController';

const router = Router();
const pdfController = new PdfController();
const docxController = new DocxController();

router.post('/generate-pdf', pdfController.generate);
router.post('/generate-docx', docxController.generate);

export default router;
