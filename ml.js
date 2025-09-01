// Import the LinearRegression class from the ml-regression library
const { LinearRegression } = require('ml-regression');

// Simulate the data from your Excel file
// In a real scenario, you would need a way to read the data from your file.
// For this example, we'll use sample data.
const data = [
    { 'Product Id 1': 1, 'Product ID 2': 2 },
    { 'Product Id 1': 2, 'Product ID 2': 4 },
    { 'Product Id 1': 3, 'Product ID 2': 5 },
    { 'Product Id 1': 4, 'Product ID 2': 4 },
    { 'Product Id 1': 5, 'Product ID 2': 5 }
];

// Extract the X and Y data into arrays
// The Python code selected 'Product Id 1' for X and 'Product ID 2' for Y
const X = data.map(row => row['Product Id 1']);
const Y = data.map(row => row['Product ID 2']);

// Create a new Linear Regression model instance
const ml = new LinearRegression(X, Y);

// The model is automatically trained when you create the instance,
// equivalent to ml.fit(X, Y) in Python.

// You can now use the model to make predictions.
// For example, to predict the value of Y when X is 6:
const prediction = ml.predict(6);
console.log(`Prediction for X = 6: ${prediction}`);

// You can also get the model's coefficients
console.log(`Model details:`);
console.log(`  Slope (m): ${ml.slope}`);
console.log(`  Intercept (b): ${ml.intercept}`);
console.log(`  R-squared: ${ml.r2}`);