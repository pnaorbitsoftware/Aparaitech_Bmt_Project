import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { API } from "../../services/api";

export default function Category() {

  const { category } = useParams();
  const decodedCategory = decodeURIComponent(category);

  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, [decodedCategory]);

  const fetchProducts = async () => {

    try {

      const res = await API.get(`/products/category/${decodedCategory}`);

      setProducts(res.data);

    } catch (error) {
      console.error(error);
    }

  };

  return (

    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">
        {decodedCategory}
      </h1>

      <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-6">

        {products.map((product) => (

          <div
            key={product._id}
            className="bg-white p-4 rounded-xl shadow hover:shadow-lg"
          >

            <img
              src={product.image}
              alt={product.name}
              className="h-40 w-full object-cover rounded-lg"
            />

            <h3 className="mt-3 font-semibold">
              {product.name}
            </h3>

            <p className="text-gray-500">
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