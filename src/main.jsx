import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import App from "./App.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import NewRun from "./pages/NewRun.jsx";
import RunDetail from "./pages/RunDetail.jsx";
import Compare from "./pages/Compare.jsx";
import Templates from "./pages/Templates.jsx";
import Workflow from "./pages/Workflow.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";
import "./index.css";

const router = createBrowserRouter([
  { path: "/", element: <Landing />, errorElement: <ErrorPage /> },
  { path: "/login", element: <Login /> },
  {
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      { path: "runs", element: <Dashboard /> },
      { path: "runs/new", element: <NewRun /> },
      { path: "runs/:id", element: <RunDetail /> },
      { path: "compare", element: <Compare /> },
      { path: "templates", element: <Templates /> },
      { path: "workflow", element: <Workflow /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
