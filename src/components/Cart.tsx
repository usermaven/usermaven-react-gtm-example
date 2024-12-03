import React from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Cart: React.FC = () => {
  const { items, removeFromCart, total } = useCart();
  const { user } = useUser();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // GTM purchase event
    window.dataLayer?.push({
      event: 'purchase',
      ecommerce: {
        transaction_id: Date.now().toString(),
        value: total,
        items: items.map(item => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      }
    });

    // Clear cart and show success message
    alert('Purchase successful!');
    navigate('/');
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold">Your cart is empty</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Shopping Cart</h2>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between items-center border-b py-4">
            <div>
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-gray-600">Quantity: {item.quantity}</p>
              <p className="text-gray-600">${item.price.toFixed(2)} each</p>
            </div>
            <div className="flex items-center space-x-4">
              <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-500 hover:text-red-600"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <div className="flex justify-between items-center pt-4 border-t">
          <h3 className="text-xl font-semibold">Total:</h3>
          <p className="text-xl font-semibold">${total.toFixed(2)}</p>
        </div>
        <button
          onClick={handleCheckout}
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 mt-6"
        >
          {user ? 'Complete Purchase' : 'Login to Checkout'}
        </button>
      </div>
    </div>
  );
};

export default Cart;
