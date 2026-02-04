import { API } from '../config';

export const createCategory = async (userId, token, category) => {
  try {
    const response = await fetch(`${API}/category/create/${userId}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(category),
    });
    return await response.json();
  } catch (err) {
    return console.log(err);
  }
};

export const createProduct = async (userId, token, product) => {
  try {
    const response = await fetch(`${API}/product/create/${userId}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: product,
    });
    return await response.json();
  } catch (err) {
    return console.log(err);
  }
};

export const getCategories = async () => {
  try {
    const response = await fetch(`${API}/categories`, {
      method: 'GET',
    });
    return await response.json();
  } catch (err) {
    return console.log(err);
  }
};

export const listOrders = async (userId, token) => {
  try {
    const response = await fetch(`${API}/order/list/${userId}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return await response.json();
  } catch (err) {
    return console.log(err);
  }
};

export const getStatusValues = async (userId, token) => {
  try {
    const response = await fetch(`${API}/order/status-values/${userId}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return await response.json();
  } catch (err) {
    return console.log(err);
  }
};

export const updateOrderStatus = async (userId, token, orderId, status) => {
  try {
    const response = await fetch(`${API}/order/${orderId}/status/${userId}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status, orderId }),
    });
    return await response.json();
  } catch (err) {
    return console.log(err);
  }
};

/**
 * to perform crud on product
 * get all products
 * get a single product
 * delete single product
 */
export const getProducts = async () => {
  try {
    const response = await fetch(`${API}/products?limit=${100}`, {
      method: 'GET',
    });
    return await response.json();
  } catch (err) {
    return console.log(err);
  }
};

export const deleteProduct = async (productId, userId, token) => {
  try {
    const response = await fetch(`${API}/product/${productId}/${userId}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return await response.json();
  } catch (err) {
    return console.log(err);
  }
};

export const getProduct = async (productId) => {
  try {
    const response = await fetch(`${API}/product/${productId}`, {
      method: 'GET',
    });
    return await response.json();
  } catch (err) {
    return console.log(err);
  }
};

export const updateProduct = async (productId, userId, token, product) => {
  try {
    const response = await fetch(`${API}/product/${productId}/${userId}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: product,
    });
    return await response.json();
  } catch (err) {
    return console.log(err);
  }
};
