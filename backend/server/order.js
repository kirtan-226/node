const express = require('express');
const router = express.Router();
const db = require('./db');

router.post('/', (req, res) => {
    const { user_id, layers } = req.body;
    if (!user_id || !Array.isArray(layers) || layers.length === 0) {
        return res.status(400).json({ error: 'User ID and layers are required' });
    }
    let total_price = 0.0;
    console.log('Original Data:', layers);
    const remainingBeverages = layers.filter((i) => i.category === 'Beverage');
    
    const extractedData = layers
        .map((item) => {
            let beverageName = null;
            if (remainingBeverages.length > 0 && item.category !== 'Add-On' && item.category !== 'Beverage') {
                beverageName = remainingBeverages.shift().item;
            }
            return {
                item: item.item,
                beverages: item.category === 'Beverage' ? null : beverageName,
                add_ons: item.add_ons || [],
                method: item.method,
                temp: item.temp,
                category: item.category,
            };
        })
        .filter((item) => item.category !== 'Beverage');
    
        const filteredData = extractedData.filter(({ beverages }) => beverages !== null);

        const itemsArray = filteredData.map(({ item }) => item);
        const beveragesArray = filteredData.map(({ beverages }) => beverages);
        
        console.log('Items Array:', itemsArray);
        console.log('Beverages Array:', beveragesArray);
    const dishQuery = `SELECT * FROM dishes WHERE name IN (?)`;
    const beverageQuery = `SELECT beverage_id, name, price FROM beverages WHERE name IN (?)`;

    db.query(dishQuery, [itemsArray], (err, dishResults) => {
        if (err) {
            console.error('Error fetching dishes:', err);
            return res.status(500).json({ error: 'Failed to calculate total price' });
        }
        console.log(dishResults,'dishResults');
        const dishMap = dishResults.reduce((map, dish) => {
            map[dish.dish_id] = parseFloat(dish.price);
            return map;
        }, {});


        if (beveragesArray.length === 0) {
            processOrder(dishMap, {}, res, user_id, layers, total_price);
        } else {
            // Query beverages only if there are valid beverage names
            db.query(beverageQuery, [beveragesArray], (err, beverageResults) => {
                if (err) {
                    console.error('Error fetching beverages:', err);
                    return res.status(500).json({ error: 'Failed to calculate total price' });
                }

                const beverageMap = beverageResults.map((beverage) => ({
                    beverage_id: beverage.beverage_id,
                    beverage_price: parseFloat(beverage.price),
                }));
                processOrder(dishMap, beverageMap, res, user_id, layers, total_price);
            });
        }
    });
});

function processOrder(dishMap, beverageMap, res, user_id, total_price) {
    const orderQuery = `
        INSERT INTO orders (user_id, total_price, order_status)
        VALUES (?, ?, ?)
    `;

    let calculatedTotalPrice = 0;
    const orderItems = [];

    // Calculate total price for dishes and prepare order items
    for (const [dishId, dishPrice] of Object.entries(dishMap)) {
        calculatedTotalPrice += parseFloat(dishPrice);
    }

    // Calculate total price for beverages
    for (const beverage of beverageMap) {
        calculatedTotalPrice += parseFloat(beverage.beverage_price);
    }

    // Insert order into database
    db.query(orderQuery, [user_id, calculatedTotalPrice, 'pending'], (err, orderResult) => {
        if (err) {
            console.error('Error creating order:', err);
            return res.status(500).json({ error: 'Failed to create order' });
        }

        const orderId = orderResult.insertId;

        // Populate orderItems directly
        for (const [dishId, dishPrice] of Object.entries(dishMap)) {
            orderItems.push([orderId, 'dish', dishId, null, parseFloat(dishPrice)]);
        }

        for (const beverage of beverageMap) {
            orderItems.push([orderId, 'beverage', null, beverage.beverage_id, parseFloat(beverage.beverage_price)]);
        }

        // Insert order items into the database
        const orderItemsQuery = `
            INSERT INTO order_items (order_id, type, dish_id, beverage_id, price)
            VALUES ?
        `;
        db.query(orderItemsQuery, [orderItems], (err) => {
            if (err) {
                console.error('Error inserting order items:', err);
                return res.status(500).json({ error: 'Failed to add order items' });
            }

            // Update total price in orders table
            const updateOrderQuery = `
                UPDATE orders
                SET total_price = ?
                WHERE order_id = ?
            `;
            db.query(updateOrderQuery, [calculatedTotalPrice, orderId], (err) => {
                if (err) {
                    console.error('Error updating total price:', err);
                    return res.status(500).json({ error: 'Failed to update order total price' });
                }

                // Respond with success
                res.status(201).json({
                    message: 'Order placed successfully',
                    order_id: orderId,
                    total_price: calculatedTotalPrice,
                });
            });
        });
    });
}







router.get('/:id', (req, res) => {
    const { id } = req.params;

    const query = `SELECT * FROM orders WHERE order_id = ?`;
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error fetching order status:', err);
            return res.status(500).json({ error: 'Failed to fetch order status' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.status(200).json(results[0]);
    });
});

router.put('/:id/status', (req, res) => {
    const { id } = req.params;
    const { order_status } = req.body;

    if (!order_status) {
        return res.status(400).json({ error: 'Order status is required' });
    }

    const query = `UPDATE orders SET order_status = ? WHERE order_id = ?`;
    db.query(query, [order_status, id], (err, result) => {
        if (err) {
            console.error('Error updating order status:', err);
            return res.status(500).json({ error: 'Failed to update order status' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.status(200).json({ message: 'Order status updated successfully!' });
    });
});

router.get('/:id/bill', (req, res) => {
    const { id } = req.params;

    const query = `SELECT total_price FROM orders WHERE order_id = ?`;
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error fetching order bill:', err);
            return res.status(500).json({ error: 'Failed to fetch order bill' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.status(200).json({ total_price: results[0].total_price });
    });
});

module.exports = router;
