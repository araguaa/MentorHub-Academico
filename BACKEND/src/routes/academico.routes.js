const express = require('express');
const router = express.Router();
const acadController = require('../controllers/academico.controller');

router.post('/vinculos', acadController.criarVinculo);
router.get('/vinculos', acadController.listarVinculos);
router.post('/monitorias', acadController.agendarMonitoria);
router.get('/monitorias/mentor/:mentorId', acadController.listarMonitoriasPorMentor);
router.post('/desempenho', acadController.salvarDesempenho);
router.get('/desempenho', acadController.listarDesempenhoCompleto);

module.exports = router;