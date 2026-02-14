import React from 'react'
import { useLocation } from 'react-router-dom';
const PaymentSucess = () => {
    localStorage.removeItem('cart');
    const query=new URLSearchParams(useLocation().search);
     const reference=query.get("reference");
  return (
    <div className='max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-md'>
        <h1 className='text-2xl font-bold text-center mt-10'>Payment Successful!</h1>
        <p className='text-center mt-4 text-gray-600'>Thank you for your purchase. Your payment reference is:</p>
        <p className='text-center mt-2 text-green-600 font-mono'>{reference}</p>
    </div>
  )
}

export default PaymentSucess