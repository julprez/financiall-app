import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Entities endpoint' });
});

export { router as entityRoutes };