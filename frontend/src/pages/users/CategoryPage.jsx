import { useParams } from "react-router-dom";

export default function CategoryPage() {

  const { category } = useParams();

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6 capitalize">
        {category} Products
      </h1>

      <div className="grid grid-cols-4 gap-6">

        {/* Example product cards */}

        <div className="bg-white p-4 rounded shadow">
          Product 1
        </div>

        <div className="bg-white p-4 rounded shadow">
          Product 2
        </div>

        <div className="bg-white p-4 rounded shadow">
          Product 3
        </div>

      </div>

    </div>
  );
}