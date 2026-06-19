const express = require('express');
const router = express.Router();
const disciplinaController = require('../controllers/disciplina.controller');

router.post('/', disciplinaController.createDisciplina);
router.get('/', disciplinaController.getDisciplinas);
router.put('/:id', disciplinaController.updateDisciplina);    // 👈 Adicionado para Edição
router.delete('/:id', disciplinaController.deleteDisciplina); // 👈 Adicionado para Remoção

module.exports = router;