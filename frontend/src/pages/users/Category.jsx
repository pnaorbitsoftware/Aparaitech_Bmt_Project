import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { API } from "../../services/api";

export default function Category() {

  const { category } = useParams();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    try {

      const res = await API.get(`/products/category/${category}`);

      setProducts(res.data);

    } catch (err) {
      console.error(err);
    }
  };

  return (

    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">
        {category} Products
      </h1>

      <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-6">

        {products.map((product) => (

          <div
            key={product._id}
            className="bg-white rounded-xl shadow hover:shadow-lg p-4"
          >

            <img
              src={product.image}
              alt={product.name}
              className="h-40 w-full object-cover rounded-lg"
            />

            <h3 className="mt-3 font-semibold">
              {product.name}
            </h3>

            <p className="text-gray-500 text-sm">
              ₹{product.price}
            </p>

            <button className="mt-3 bg-purple-600 text-white px-4 py-1 rounded">
              Add to Cart
            </button>

          </div>

        ))}

      </div>

    </div>

  );
}