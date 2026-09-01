import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Spinner } from "./ui/index.jsx";

export default function RequireAuth({ children }) {
  const { isAuthenticated, loading, token } = useAuth();

  if (loading || (token && !isAuthenticated)) {
    return (
      <div className="flex h-full items-center justify-center bg-bg text-faint">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return children;
}
