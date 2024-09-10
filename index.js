const express = require('express');
const admin = require('firebase-admin');
require('dotenv').config(); // Nạp biến môi trường từ file .env

const app = express();
app.use(express.json()); // Để đọc dữ liệu JSON từ request body

//Khởi tạo mội trường SDK của Firebase
admin.initializeApp({
  credential: admin.credential.cert({
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Xử lý ký tự xuống dòng
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    project_id: process.env.FIREBASE_PROJECT_ID,
  }),
});

const db = admin.firestore();
const collection = db.collection('products'); // Collection products trong Firestore

// CRUD APIs

// 1. Create a new product: POST
app.post('/products', async (req, res) => {
  try {
    const product = req.body;
    const docRef = await collection.add(product);
    res.status(201).send({ id: docRef.id, message: 'Product created successfully' });
  } catch (error) {
    res.status(500).send('Error creating product: ' + error.message);
  }
});

// 2. Read all products : GET
app.get('/products', async (req, res) => {
  try {
    const snapshot = await collection.get();
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(products);
  } catch (error) {
    res.status(500).send('Error fetching products: ' + error.message);
  }
});

// 3. Read a product by ID : GET/id
app.get('/products/:id', async (req, res) => {
  try {
    const doc = await collection.doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).send('Product not found');
    }
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).send('Error fetching product: ' + error.message);
  }
});

// 4. Update a product by ID: PUT/id
app.put('/products/:id', async (req, res) => {
  try {
    const updatedProduct = req.body;
    await collection.doc(req.params.id).update(updatedProduct);
    res.status(200).send('Product updated successfully');
  } catch (error) {
    res.status(500).send('Error updating product: ' + error.message);
  }
});

// 5. Delete a product by ID: DELETE/id
app.delete('/products/:id', async (req, res) => {
  try {
    await collection.doc(req.params.id).delete();
    res.status(200).send('Product deleted successfully');
  } catch (error) {
    res.status(500).send('Error deleting product: ' + error.message);
  }
});

// Chạy server với port online hoặc 3000 local
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
