const express = require('express');
const router = express.Router();
const mentoriaController = require('../controllers/mentoria.controller');

router.post('/solicitar', mentoriaController.solicitarMentoria);
router.put('/:id/confirmar', mentoriaController.confirmarMentoria);
router.put('/:id/recusar', mentoriaController.recusarMentoria);
router.put('/:id/cancelar', mentoriaController.cancelarMentoria);
router.put('/:id/atendimento', mentoriaController.registrarAtendimento);
router.get('/', mentoriaController.listarMentorias);

module.exports = router;