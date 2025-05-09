import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getProfileProperty } from "@/utils/propertyMapping";

const ProfilePage = () => {
  const { currentUser, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Do not render on the server
  if (!mounted) {
    return null;
  }

  // Redirect if not authenticated
  if (!currentUser) {
    navigate("/");
    return null;
  }

  const visaType = currentUser ? getProfileProperty(currentUser, 'visa_type') : null;

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Your Profile</CardTitle>
          <CardDescription>
            View and manage your profile information here.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="text-gray-700 font-bold">Name:</div>
            <div>{currentUser?.name}</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-gray-700 font-bold">Email:</div>
            <div>{currentUser?.email}</div>
          </div>
          {visaType && (
            <div className="grid grid-cols-2 gap-2">
              <div className="text-gray-700 font-bold">Visa Type:</div>
              <div>{visaType}</div>
            </div>
          )}
          <Button variant="destructive" onClick={logout} className="mt-4">
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
