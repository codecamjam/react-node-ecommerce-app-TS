import 'dotenv/config';
import { createConnection, getRepository } from 'typeorm';
import { Category } from './entity/Category';
import { User } from './entity/User';
import { Product } from './entity/Product';
import { Order } from './entity/Order';
import { CartItem } from './entity/CartItem';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

const categoriesData = [
  { name: 'Electronics' },
  { name: 'Books' },
  { name: 'Clothing' },
  { name: 'Food' }
];

const usersData = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password',
    role: 0
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password',
    role: 0
  }
];

const productsData = [
  {
    name: 'Laptop',
    description: 'High performance laptop',
    price: 1000,
    quantity: 50,
    sold: 0,
    shipping: true
  },
  {
    name: 'Book - How to Node.js',
    description: 'Learn Node.js from scratch',
    price: 20,
    quantity: 100,
    sold: 0,
    shipping: false
  }
];

async function seedDB() {
  const connection = await createConnection();

  const categoryRepository = getRepository(Category);
  const userRepository = getRepository(User);
  const productRepository = getRepository(Product);
  const orderRepository = getRepository(Order);
  const cartItemRepository = getRepository(CartItem);

  const categories = await categoryRepository.save(categoriesData);
  console.log('Categories created:', categories);

  // for (const user of usersData) {
  //   const salt = uuidv4();
  //   const hashedPassword = crypto
  //     .createHmac('sha256', salt)
  //     .update(user.password)
  //     .digest('hex');
  //   await userRepository.save({ ...user, hashedPassword, salt });
  // }
  // const users = await userRepository.find();
  // console.log('Users created:', users);

  // for (const product of productsData) {
  //   const randomCategory =
  //     categories[Math.floor(Math.random() * categories.length)];
  //   await productRepository.save({ ...product, category: randomCategory });
  // }
  // const products = await productRepository.find({
  //   relations: ['category']
  // });
  // console.log('Products created:', products);

  // const order = new Order();
  // order.transactionId = 'txn_1001';
  // order.amount = products.reduce((sum, product) => {
  //   const result = sum + parseFloat(String(product.price));
  //   return result;
  // }, 0);
  // order.address = '123 First Street';
  // order.status = 'Not processed';
  // order.user = users[Math.floor(Math.random() * users.length)];

  // const cartItems: CartItem[] = [];
  // for (const product of products) {
  //   const cartItem = new CartItem();
  //   cartItem.product = product;
  //   cartItem.name = product.name;
  //   cartItem.price = product.price;
  //   cartItem.count = Math.floor(Math.random() * 5) + 1;
  //   await cartItemRepository.save(cartItem);
  //   cartItems.push(cartItem);
  // }

  // order.products = cartItems;
  // await orderRepository.save(order);
  // console.log('Order created:', order);

  await connection.close();
}

seedDB().catch(err => console.error('Error seeding database:', err));
