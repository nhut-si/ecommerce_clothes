import { Outlet } from "react-router-dom";

import Header from "../Common/Header";
import Footer from "../Common/Footer";

const UserLayout = () => {
  return (
    <>
      {/* header */}
      <Header />
      {/* main contain */}
      <main>
        <Outlet /> 
      </main>
      {/* footer */}
      <Footer />
    </>
  );
};

export default UserLayout;
