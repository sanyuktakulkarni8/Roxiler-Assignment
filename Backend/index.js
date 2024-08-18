const express=require('express');
require("./Models/db.js");
const Transaction = require('./Models/Transaction.js');
const mongoose = require('mongoose');
const cors=require('cors');
const moment = require('moment');

const app=express();
const PORT=5000;
app.use(cors());

//Initializing db with external json seed data
app.get('/init-db', async (req, res) => {
    try {
        // Fetch data from the third-party API
        const response = await fetch('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        const data = await response.json();

        const transformedData = data.map(item => {
            
            const formattedDate = moment(item.dateOfSale).format('YYYY-MM'); 

            return {
                ...item,
                dateOfSale: formattedDate, 
            };
        });
       // console.log('Transformed Data:', transformedData);
        
        // Seed the database with the fetched data
        await Transaction.insertMany(transformedData);

        res.send('Database initialized with seed data');
    } catch (error) {
        console.error('Error initializing the database:', error);
        res.status(500).send('Error initializing the database');
    }
});



app.get('/transactions', async (req, res) => {
    try {
        const { month } = req.query;

        const query = {};
        if (month) {
            query.$expr = {
                $eq: [
                    { $substr: ["$dateOfSale", 5, 2] }, // Extract month part from dateOfSale
                    month // Provided month
                ]
            };
        }
       
        // Fetch and sort transactions
        const transactions = await Transaction.find(query).sort({ dateOfSale: 1 }); // Sorting by dateOfSale, ascending

        res.status(200).json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.get('/statistics', async (req, res) => {
    try {
        const { month } = req.query;

        // Default query object
        const query = {};
        if (month) {
            query.$expr = {
                $eq: [
                    { $substr: ["$dateOfSale", 5, 2] }, // Extract month part from dateOfSale
                    month // Provided month
                ]
            };
        }

        // Total sale amount
        const totalSaleAmount = await Transaction.aggregate([
            { $match: query },
            { $group: { _id: null, totalAmount: { $sum: "$price" } } }
        ]);

        // Total number of sold items
        const totalSoldItems = await Transaction.countDocuments({ ...query, sold: true });

        // Total number of not sold items
        const totalNotSoldItems = await Transaction.countDocuments({ ...query, sold: false });

        res.json({
            totalSaleAmount: totalSaleAmount[0]?.totalAmount || 0,
            totalSoldItems,
            totalNotSoldItems
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/price-range', async (req, res) => {
    try {
        const { month } = req.query;
        const query = {};

        if (month) {
            query.$expr = {
                $eq: [
                    { $substr: ["$dateOfSale", 5, 2] }, // Extract month part from dateOfSale
                    month // Provided month
                ]
            };
        }

        // Define price ranges
        const priceRanges = [
            { min: 0, max: 100 },
            { min: 101, max: 200 },
            { min: 201, max: 300 },
            { min: 301, max: 400 },
            { min: 401, max: 500 },
            { min: 501, max: 600 },
            { min: 601, max: 700 },
            { min: 701, max: 800 },
            { min: 801, max: 900 },
            { min: 901, max: Infinity }
        ];

        // Count items in each price range
        const priceRangeCounts = await Promise.all(priceRanges.map(async range => {
            const count = await Transaction.countDocuments({
                ...query,
                price: { $gte: range.min, $lte: range.max }
            });
            return { range: `${range.min} - ${range.max}`, count };
        }));

        res.status(200).json(priceRangeCounts);
    } catch (error) {
        console.error('Error fetching price range data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});





app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT} `);

});


