import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
  
import Hero from "../components/Layout/Hero";
import GenderCollectionSection from "../components/Products/GenderCollectionSection";
import NewArrivals from "../components/Products/NewArrivals";
import ProductDeatails from "../components/Products/ProductDeatails";
import FeaturedCollection from "../components/Products/FeaturedCollection";
import ProductsGrid from "../components/Products/ProductsGrid";
import FeaturesSection from "../components/Products/FeaturesSection";
import { fetchProductsByFilters } from "../redux/slices/productsSlice";

  const Home = () => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.products);
  const [bestSellerProduct, setBestSellerProduct] = useState(null);
  useEffect(() => {
    // Fetch products for a specific collection
    dispatch(
      fetchProductsByFilters({
        gender: "Women",
        category: "Bottom Wear",
        limit: 8,
      })
    );

    const API_URL = import.meta.env.VITE_BACKEND_URL;
    // Fetch the best seller product
    const fetchBestSeller = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/products/new-arrivals`);
        setBestSellerProduct(response.data);  
      } catch (error) {
        console.error(error);
      }
    };
    fetchBestSeller();
  }, [dispatch]);
  return (
    <div>
      <Hero />
      <GenderCollectionSection />
      <NewArrivals />

      {/* Best Seller */}
      <h2 className="text-3xl text-center font-bold mb-4">Best Seller</h2>
      {bestSellerProduct ? (
        <ProductDeatails productId={bestSellerProduct._id} />
      ) : (
        <p  className="text-center">Loading best seller product ...</p>
      )}

      <div className="container mx-auto">
        <h2 className="text-3xl text-center font-bold mb-4">
          Top Wears For Womnan
        </h2>
        <ProductsGrid products={products} loading={loading} error={error} />
      </div>

      <FeaturedCollection />
      <FeaturesSection />
    </div>
  );
};

export default Home;
