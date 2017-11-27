import express from 'express';
let router = express.Router();
import solver from '../models/solver';


/* Router */
router.get('/', (req, res, next) => {
  solver.start(res)
});


export default router;