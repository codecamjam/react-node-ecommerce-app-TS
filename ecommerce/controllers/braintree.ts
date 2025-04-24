import { Request, Response } from 'express';
import braintree from 'braintree';
import dotenv from 'dotenv';

dotenv.config();

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID || '',
  publicKey: process.env.BRAINTREE_PUBLIC_KEY || '',
  privateKey: process.env.BRAINTREE_PRIVATE_KEY || ''
});

// Generate Braintree token
export const generateToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const response = await gateway.clientToken.generate({});
    res.send(response);
  } catch (err) {
    res.status(500).send(err);
  }
};

// Process payment
export const processPayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const nonceFromTheClient = req.body.paymentMethodNonce;
  const amountFromTheClient = req.body.amount;

  try {
    const result = await gateway.transaction.sale({
      amount: amountFromTheClient,
      paymentMethodNonce: nonceFromTheClient,
      options: {
        submitForSettlement: true
      }
    });
    res.json(result);
  } catch (err) {
    res.status(500).json(err);
  }
};
