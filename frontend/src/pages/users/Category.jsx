import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { API } from "../../services/api";

export default function Category() {

  const { category } = useParams();
  const decodedCategory = decodeURIComponent(category);

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {

    fetchProducts();

    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);

  }, [decodedCategory]);

  const fetchProducts = async () => {
    try {

      const res = await API.get(`/products/category/${decodedCategory}`);
      setProducts(res.data);

    } catch (error) {
      console.error(error);
    }
  };

  const updateCart = (newCart) => {

    setCart(newCart);

    localStorage.setItem("cart", JSON.stringify(newCart));

    window.dispatchEvent(new Event("cartUpdated"));

  };

  const addToCart = (product) => {

    const existing = cart.find(p => p._id === product._id);

    let newCart;

    if (existing) {

      newCart = cart.map(p =>
        p._id === product._id
          ? { ...p, quantity: p.quantity + 1 }
          : p
      );

    } else {

      newCart = [...cart, { ...product, quantity: 1 }];

    }

    updateCart(newCart);

    // OPEN ZEPTO CART POPUP
    setTimeout(() => {
      window.dispatchEvent(new Event("openCartDrawer"));
    }, 100);

  };

  const decreaseQty = (product) => {

    const updated = cart
      .map(p =>
        p._id === product._id
          ? { ...p, quantity: p.quantity - 1 }
          : p
      )
      .filter(p => p.quantity > 0);

    updateCart(updated);

  };

  const getQty = (id) => {

    const item = cart.find(p => p._id === id);
    return item ? item.quantity : 0;

  };

  return (

    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">
        {decodedCategory}
      </h1>

      <div className="grid lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2 gap-6">

        {products.map((product) => {

          const qty = getQty(product._id);

          return (

            <div
              key={product._id}
              className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition"
            >

              <img
                src={product.image}
                alt={product.name}
                className="h-36 w-full object-cover rounded-lg"
              />

              <h3 className="mt-3 font-semibold text-sm">
                {product.name}
              </h3>

              <p className="text-green-600 font-semibold">
                ₹{product.price}
              </p>

              {qty === 0 ? (

                <button
                  onClick={() => addToCart(product)}
                  className="mt-3 border border-pink-500 text-pink-500 px-4 py-1 rounded-full text-sm hover:bg-pink-50 transition"
                >
                  ADD
                </button>

              ) : (

                <div className="mt-3 flex items-center justify-center gap-3 bg-pink-500 text-white px-3 py-1 rounded-full">

                  <button
                    onClick={() => decreaseQty(product)}
                    className="font-bold"
                  >
                    −
                  </button>

                  <span>{qty}</span>

                  <button
                    onClick={() => addToCart(product)}
                    className="font-bold"
                  >
                    +
                  </button>

                </div>

              )}

            </div>

          );

        })}

      </div>

    </div>
  );
}