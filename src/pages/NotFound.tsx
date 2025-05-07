
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <div className="h-24 w-24 rounded-xl nexed-gradient mx-auto mb-6 flex items-center justify-center">
          <span className="text-4xl font-bold text-white">404</span>
        </div>
        <h1 className="text-4xl font-bold mb-4">Page not found</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-lg">
          Sorry, we couldn't find the page you're looking for. It might have been removed or you may have mistyped the URL.
        </p>
        <Button asChild size="lg" className="nexed-gradient">
          <Link to="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
