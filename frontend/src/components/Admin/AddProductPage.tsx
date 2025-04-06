// import React, { useState } from "react";
// import { useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { createProduct } from "../../redux/slices/adminProductSlice";

// const AddProductPage = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const [productData, setProductData] = useState({
//     name: "",
//     description: "",
//     price: 0,
//     countInStock: 0,
//     sku: "",
//     category: "",
//     brand: "",
//     colors: [],
//     sizes: [],
//     collections: "",
//     material: "",
//     gender: "",
//     images: [],
//   });
  
//   const [uploading, setUploading] = useState(false);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setProductData((prevData) => ({ ...prevData, [name]: value }));
//   };

//   const handleImageUpload = async (e) => {
//     const file = e.target.files[0];
//     const formData = new FormData();
//     formData.append("image", file);

//     try {
//       setUploading(true);
//       const { data } = await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}/api/upload`,
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );
//       setProductData((prevData) => ({
//         ...prevData,
//         images: [...prevData.images, { url: data.imageUrl, altText: "" }],
//       }));
//       setUploading(false);
//     } catch (error) {
//       console.error("Image upload failed", error);
//       setUploading(false);
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     dispatch(createProduct(productData));
//     navigate("/admin/products");
//   };

//   return (
//     <div className="max-w-5xl mx-auto p-6 shadow-md rounded-md">
//       <h2 className="text-3xl font-bold mb-6">Add New Product</h2>
//       <form onSubmit={handleSubmit}>
//         <div className="mb-6">
//           <label className="block font-semibold mb-2">Product Name</label>
//           <input
//             type="text"
//             name="name"
//             value={productData.name}
//             onChange={handleChange}
//             className="w-full border border-gray-300 rounded-md p-2"
//             required
//           />
//         </div>
//         <div className="mb-6">
//           <label className="block font-semibold mb-2">Description</label>
//           <textarea
//             name="description"
//             value={productData.description}
//             onChange={handleChange}
//             className="w-full border border-gray-300 rounded-md p-2"
//             rows={4}
//             required
//           />
//         </div>
//         <div className="mb-6">
//           <label className="block font-semibold mb-2">Price</label>
//           <input
//             type="number"
//             name="price"
//             value={productData.price}
//             onChange={handleChange}
//             className="w-full border border-gray-300 rounded-md p-2"
//           />
//         </div>
//         <div className="mb-6">
//           <label className="block font-semibold mb-2">Upload Image</label>
//           <input type="file" onChange={handleImageUpload} />
//           {uploading && <p>Uploading image...</p>}
//           <div className="flex gap-4 mt-4">
//             {productData.images.map((image, index) => (
//               <div key={index}>
//                 <img
//                   src={image.url}
//                   alt={image.altText || "Product Image"}
//                   className="w-20 h-20 object-cover rounded-md shadow-md"
//                 />
//               </div>
//             ))}
//           </div>
//         </div>
//         <button
//           type="submit"
//           className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
//         >
//           Add Product
//         </button>
//       </form>
//     </div>
//   );
// };

// export default AddProductPage;