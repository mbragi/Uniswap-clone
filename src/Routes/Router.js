import { createBrowserRouter } from "react-router-dom";
import Homepage from "../Pages/Homepage";
import LandingPage from "../Pages/Landing";
import SwapTokensPage from "../Pages/SwapTokensPage";
import ErrorPage from "../Utils/ErrorPage";
import AboutPage from "../Pages/AboutPage";
import OrderHistory from "../Components/OrderHistory";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Homepage />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: "/SwapToken",
        element: <SwapTokensPage />,
      },
      {
        path: "/About",
        element: <AboutPage />,
      },
      {
        path: "/networks",
        element: <OrderHistory />,
      },
    ],
  },
]);
