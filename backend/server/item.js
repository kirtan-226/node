const express = require('express');
const router = express.Router();
const db = require('./db');


router.post('/', (req, res) => {
    const { name, is_customizable, price_modifier } = req.body;
    // console.log(name);
    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    const query = `INSERT INTO ingredients (name, is_customizable, price_modifier) VALUES (?, ?, ?)`;
    db.query(query, [name, is_customizable || 1, price_modifier || 0.0], (err, result) => {
        if (err) {
            console.error('Error inserting ingredient:', err);
            return res.status(500).json({ error: 'Failed to add ingredient' });
        }
        res.status(201).json({ message: 'Ingredient added successfully!', ingredient_id: result.insertId });
    });
});


router.get('/:id?', (req, res) => {
    const { id } = req.params;
    const query = id ? 'SELECT * FROM ingredients WHERE ingredient_id = ?' : 'SELECT * FROM ingredients';
    db.query(query, id ? [id] : [], (err, results) => {
        if (err) {
            console.error('Error fetching ingredient(s):', err);
            return res.status(500).json({ error: 'Failed to fetch ingredients' });
        }
        res.status(200).json(results);
    });
});


router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, is_customizable, price_modifier } = req.body;

    const query = `
        UPDATE ingredients 
        SET name = ?, is_customizable = ?, price_modifier = ? 
        WHERE ingredient_id = ?
    `;
    db.query(query, [name, is_customizable, price_modifier, id], (err, result) => {
        if (err) {
            console.error('Error updating ingredient:', err);
            return res.status(500).json({ error: 'Failed to update ingredient' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Ingredient not found' });
        }
        res.status(200).json({ message: 'Ingredient updated successfully!' });
    });
});


router.delete('/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM ingredients WHERE ingredient_id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error deleting ingredient:', err);
            return res.status(500).json({ error: 'Failed to delete ingredient' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Ingredient not found' });
        }
        res.status(200).json({ message: 'Ingredient deleted successfully!' });
    });
});

module.exports = router;
