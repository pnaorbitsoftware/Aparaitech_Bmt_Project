import { useEffect, useState } from "react";
import { API } from "../services/api";
import { Plus, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ================= CONSTANTS ================= */
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

function Inventory() {
  const navigate = useNavigate();

  /* ================= ROLE CHECK ================= */
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  /* ================= STATE ================= */
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    category: "Fruits",
    price: "",
    stock: "",
    expiryDate: ""
  });

  /* ================= LOAD PRODUCTS ================= */
  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await API.get("/inventory");

      setProducts(
        res.data.map(p => ({
          ...p,
          price: Number(p.price),
          stock: Number(p.stock),
          expiryDate: p.expiryDate || null
        }))
      );
    } catch {
      alert("Failed to load inventory ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  /* ================= CRUD ================= */
  const handleAddProduct = async () => {
    try {
      await API.post("/inventory", {
        ...newProduct,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        expiryDate: newProduct.expiryDate || null
      });

      setShowAdd(false);
      setNewProduct({
        name: "",
        sku: "",
        category: "Fruits",
        price: "",
        stock: "",
        expiryDate: ""
      });

      loadProducts();
    } catch {
      alert("Add product failed ❌");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Archive this product?")) return;

    try {
      await API.delete(`/inventory/${id}`);
      loadProducts();
    } catch {
      alert("Delete failed ❌");
    }
  };

  const handleUpdate = async () => {
    try {
      await API.put(`/inventory/${editProduct.id}`, {
        ...editProduct,
        price: Number(editProduct.price),
        stock: Number(editProduct.stock),
        expiryDate: editProduct.expiryDate || null
      });

      setShowEdit(false);
      loadProducts();
    } catch {
      alert("Update failed ❌");
    }
  };

  /* ================= EXPIRY BADGE ================= */
  const ExpiryBadge = ({ expiryDate }) => {
    if (!expiryDate) return <span className="text-gray-400">—</span>;

    const days = Math.ceil(
      (new Date(expiryDate) - new Date()) / 86400000
    );

    if (days <= 0)
      return (
        <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-600">
          Expired
        </span>
      );

    if (days <= 7)
      return (
        <span className="px-3 py-1 text-xs rounded-full bg-orange-100 text-orange-600">
          Near Expiry
        </span>
      );

    return (
      <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-600">
        Safe
      </span>
    );
  };

  /* ================= UI ================= */
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Inventory</h1>

        {isAdmin && (
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/inventory/bulk-upload")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white"
            >
              <Upload size={16} /> Bulk Upload
            </button>

            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-white"
            >
              <Plus size={16} /> Add Product
            </button>
          </div>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Product</th>
              <th className="p-4 text-center">Category</th>
              <th className="p-4 text-right">Price</th>
              <th className="p-4 text-center">Stock</th>
              <th className="p-4 text-center">Expiry</th>
              {isAdmin && <th className="p-4 text-center">Action</th>}
            </tr>
          </thead>

          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-gray-400">{p.sku}</div>
                </td>

                <td className="p-4 text-center">{p.category}</td>

                <td className="p-4 text-right">
                  ₹{p.price.toFixed(2)}
                </td>

                <td className="p-4 text-center font-semibold">
                  {p.stock}
                </td>

                <td className="p-4 text-center">
                  <ExpiryBadge expiryDate={p.expiryDate} />
                </td>

                {isAdmin && (
                  <td className="p-4 text-center space-x-3">
                    <button
                      onClick={() => {
                        setEditProduct(p);
                        setShowEdit(true);
                      }}
                    >
                      ✏️
                    </button>
                    <button onClick={() => handleDelete(p.id)}>
                      🗑
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {loading && (
          <p className="p-6 text-center text-gray-500">
            Loading inventory...
          </p>
        )}
      </div>

      {/* ADD MODAL */}
      {showAdd && (
        <Modal title="Add Product" onClose={() => setShowAdd(false)}>
          <ProductForm
            product={newProduct}
            setProduct={setNewProduct}
            onSubmit={handleAddProduct}
          />
        </Modal>
      )}

      {/* EDIT MODAL */}
      {showEdit && editProduct && (
        <Modal title="Edit Product" onClose={() => setShowEdit(false)}>
          <ProductForm
            product={editProduct}
            setProduct={setEditProduct}
            onSubmit={handleUpdate}
          />
        </Modal>
      )}
    </div>
  );
}

/* ================= MODAL ================= */
const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl w-[420px] space-y-4">
      <h2 className="text-lg font-bold">{title}</h2>
      {children}
      <button onClick={onClose} className="w-full text-gray-500">
        Cancel
      </button>
    </div>
  </div>
);

/* ================= FORM ================= */
const ProductForm = ({ product, setProduct, onSubmit }) => (
  <>
    <input
      className="border p-2 w-full"
      placeholder="Name"
      value={product.name}
      onChange={e => setProduct({ ...product, name: e.target.value })}
    />

    <input
      className="border p-2 w-full"
      placeholder="SKU"
      value={product.sku}
      onChange={e => setProduct({ ...product, sku: e.target.value })}
    />

    <select
      className="border p-2 w-full"
      value={product.category}
      onChange={e => setProduct({ ...product, category: e.target.value })}
    >
      {CATEGORIES.map(c => (
        <option key={c}>{c}</option>
      ))}
    </select>

    <input
      className="border p-2 w-full"
      type="number"
      placeholder="Price"
      value={product.price}
      onChange={e => setProduct({ ...product, price: e.target.value })}
    />

    <input
      className="border p-2 w-full"
      type="number"
      placeholder="Stock"
      value={product.stock}
      onChange={e => setProduct({ ...product, stock: e.target.value })}
    />

    <input
      className="border p-2 w-full"
      type="date"
      value={product.expiryDate || ""}
      onChange={e =>
        setProduct({ ...product, expiryDate: e.target.value })
      }
    />

    <button
      onClick={onSubmit}
      className="w-full bg-green-600 text-white py-2 rounded"
    >
      Save
    </button>
  </>
);

export default Inventory;
