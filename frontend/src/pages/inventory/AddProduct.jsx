import { useState } from "react";
import { API } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { PackagePlus, Save, X } from "lucide-react";

const CATEGORIES = [
  "Fruits",
  "Vegetables",
  "Dairy",
  "Bakery",
  "Pantry",
  "Beverages",
  "Snacks",
  "Frozen",
  "Stationery",
  "Personal Care"
];

function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [product, setProduct] = useState({
    name: "",
    sku: "",
    category: "Fruits",
    price: "",
    stock: "",
    expiryDate: ""
  });

  const handleSave = async () => {
    const { name, sku, price, stock } = product;

    if (!name || !sku || !price || !stock) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      await API.post("/inventory", {
        ...product,
        price: Number(price),
        stock: Number(stock)
      });

      alert("Product added successfully ✅");
      navigate("/inventory");
    } catch {
      alert("Failed to add product ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center p-6">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-lg p-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-full bg-green-100 text-green-600">
            <PackagePlus size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Add New Product</h1>
            <p className="text-sm text-gray-500">
              Enter product details to add it to inventory
            </p>
          </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <div>
            <label className="text-sm font-medium">Product Name *</label>
            <input
              className="mt-1 border p-3 w-full rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="e.g. Apple"
              value={product.name}
              onChange={e => setProduct({ ...product, name: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium">SKU *</label>
            <input
              className="mt-1 border p-3 w-full rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="e.g. APP-001"
              value={product.sku}
              onChange={e => setProduct({ ...product, sku: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Category</label>
            <select
              className="mt-1 border p-3 w-full rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
              value={product.category}
              onChange={e => setProduct({ ...product, category: e.target.value })}
            >
              {CATEGORIES.map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Price (₹) *</label>
            <input
              type="number"
              className="mt-1 border p-3 w-full rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="e.g. 100"
              value={product.price}
              onChange={e => setProduct({ ...product, price: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Stock *</label>
            <input
              type="number"
              className="mt-1 border p-3 w-full rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="e.g. 50"
              value={product.stock}
              onChange={e => setProduct({ ...product, stock: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Expiry Date</label>
            <input
              type="date"
              className="mt-1 border p-3 w-full rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
              value={product.expiryDate}
              onChange={e => setProduct({ ...product, expiryDate: e.target.value })}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            onClick={handleSave}
            disabled={loading}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition
              ${loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}
          >
            <Save size={18} />
            {loading ? "Saving..." : "Save Product"}
          </button>

          <button
            onClick={() => navigate("/inventory")}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
          >
            <X size={18} /> Cancel
          </button>
        </div>

      </div>
    </div>
  );
}

export default AddProduct;
