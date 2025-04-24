/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable node/no-unsupported-features/es-syntax */
require('dotenv').config();
const mongoose = require('mongoose');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

// Replace this with your actual model imports
const Category = require('./models/category');
const Product = require('./models/product');
const { CartItem, Order } = require('./models/order');
const User = require('./models/user');

// DB connection
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB Connected'))
  .catch(err => console.log('DB Connection Error:', err));

// Dummy data
const categories = [
  { name: 'Electronics' },
  { name: 'Books' },
  { name: 'Clothing' },
  { name: 'Food' }
];

const users = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    hashed_password: 'secret',
    salt: uuidv4()
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    hashed_password: 'secret',
    salt: uuidv4()
  }
];

const products = [
  {
    name: 'Laptop',
    description: 'High performance laptop',
    price: 1000,
    category: null, // This will be set to a Category ObjectId later
    quantity: 50,
    sold: 0,
    shipping: true
  },
  {
    name: 'Book - How to Node.js',
    description: 'Learn Node.js from scratch',
    price: 20,
    category: null, // This will be set to a Category ObjectId later
    quantity: 100,
    sold: 0,
    shipping: false
  }
];

const orders = [
  {
    transaction_id: 'txn_1001',
    amount: 1020,
    address: '123 First Street',
    status: 'Not processed',
    user: null, // This will be set to a User ObjectId later
    products: [] // This will be an array of CartItem documents
  }
];

// Functions to insert dummy data
async function createCategories() {
  for (const cat of categories) {
    const category = new Category(cat);
    await category.save();
  }
  console.log('Categories created');
}

async function createUsers() {
  for (const user of users) {
    user.hashed_password = crypto
      .createHmac('sha256', user.salt)
      .update('password')
      .digest('hex');
    const newUser = new User(user);
    await newUser.save();
  }
  console.log('Users created');
}

async function createProducts() {
  const categoryIds = await Category.find().select('_id');
  for (const product of products) {
    product.category =
      categoryIds[Math.floor(Math.random() * categoryIds.length)]._id;
    const newProduct = new Product(product);
    await newProduct.save();
  }
  console.log('Products created');
}

async function createOrders() {
  const userIds = await User.find().select('_id');
  const productIds = await Product.find().select('_id name price');

  for (const order of orders) {
    order.user = userIds[Math.floor(Math.random() * userIds.length)]._id;
    for (const product of productIds) {
      const cartItem = new CartItem({
        product: product._id,
        name: product.name,
        price: product.price,
        count: Math.floor(Math.random() * 5) + 1 // Random count between 1 and 5
      });
      await cartItem.save();
      order.products.push(cartItem);
    }
    const newOrder = new Order(order);
    await newOrder.save();
  }
  console.log('Orders created');
}

// Execute the functions
async function seedDB() {
  await createCategories();
  await createUsers();
  await createProducts();
  await createOrders();

  // Close the DB connection
  mongoose.connection.close();
}

seedDB().catch(err => console.error(err));
