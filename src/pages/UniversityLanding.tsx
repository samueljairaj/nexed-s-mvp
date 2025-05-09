
import { useNavigate } from "react-router-dom";
import { UserTypeToggle } from "@/components/landing/UserTypeToggle";
import { Button } from "@/components/ui/button";
import { User, FileCheck, FolderArchive } from "lucide-react";

const UniversityLanding = () => {
  const navigate = useNavigate();
  
  // Redirect to student landing page temporarily
  const redirectToStudent = () => {
    navigate('/student');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="nexed-gradient">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-white rounded-md flex items-center justify-center">
              <div className="h-6 w-6 rounded-sm nexed-gradient" />
            </div>
            <span className="ml-3 text-2xl font-bold text-white">neXed</span>
          </div>
          
          <UserTypeToggle />
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="nexed-gradient text-white py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-bold animate-fade-in">
                  University Features Coming Soon
                </h1>
                <p className="text-lg md:text-xl text-blue-50 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                  We're currently focusing on student features. Please use our student portal for now.
                </p>
                <div className="pt-4 flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                  <Button 
                    size="lg" 
                    className="bg-white text-nexed-700 hover:bg-blue-50"
                    onClick={redirectToStudent}
                  >
                    Go to Student Portal
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Features Coming Soon</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Student Management</h3>
                <p className="text-gray-600">Comprehensive student profiles with visa status tracking, document verification, and automated compliance checks.</p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <FileCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Compliance Automation</h3>
                <p className="text-gray-600">Automatic alerts for approaching deadlines, expired documents, and status changes to ensure full compliance.</p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <FolderArchive className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Document Repository</h3>
                <p className="text-gray-600">Securely store, organize, and retrieve important documents with built-in version control and audit trails.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="h-8 w-8 bg-white rounded-md flex items-center justify-center">
                <div className="h-5 w-5 rounded-sm nexed-gradient" />
              </div>
              <span className="ml-2 text-xl font-bold">neXed</span>
            </div>
            <div className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} neXed. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UniversityLanding;
