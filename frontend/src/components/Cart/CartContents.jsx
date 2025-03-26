import React, { useState } from "react";
import { RiDeleteBin3Line } from "react-icons/ri";

const CartContents = () => {
  const CartProducts = [
    {
      productId: 1,
      name: "T-shirt",
      size: "M",
      color: "black",
      quantity: 1,
      price: 15,
      image: "https://picsum.photos/200?random=1",
    },
    {
      productId: 2,
      name: "Jeans",
      size: "L",
      color: "red",
      quantity: 5,
      price: 20,
      image: "https://picsum.photos/200?random=2",
    },
  ];

  const [quantities, setQuantities] = useState({});

  const increaseQuantity = (productId) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 1) + 1,
    }));
  };

  const decreaseQuantity = (productId) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max((prev[productId] || 1) - 1, 1),
    }));
  };

  return (
    <div>
      {CartProducts.map((product, index) => (
        <div
          key={index}
          className="flex items-start justify-between py-4 border-b"
        >
          <div className="flex items-start">
            <img
              src={product.image}
              alt={product.name}
              className="w-16 h-20 sm:w-20 sm:h-24 object-cover mr-4 rounded"
            />
            <div>
              <h3>{product.name}</h3>
              <p className="text-sm text-gray-500">
                size: {product.size} | color: {product.color}
              </p>
              <div className="flex items-center mt-2">
                <button
                  onClick={() => decreaseQuantity(product.productId)}
                  className="border rounded px-2 py-1 text-xl font-medium"
                >
                  -
                </button>
                <span className="mx-4">
                  {quantities[product.productId] || product.quantity}
                </span>
                <button
                  onClick={() => increaseQuantity(product.productId)}
                  className="border rounded px-2 py-1 text-xl font-medium   "
                >
                  +
                </button>
              </div>
            </div>
          </div>
          <div>
            <p className="font-medium">$ {product.price.toLocaleString()}</p>
            <button>
              <RiDeleteBin3Line className="h-6 w-6 mt-2" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CartContents;
