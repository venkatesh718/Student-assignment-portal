import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AssignmentProvider } from "@/contexts/AssignmentContext";
import Layout from "@/components/Layout";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import StudentDashboard from "@/pages/StudentDashboard";
import InstructorDashboard from "@/pages/InstructorDashboard";
import AssignmentUpload from "@/pages/AssignmentUpload";
import ReviewSubmission from "@/pages/ReviewSubmission";
import StudentHistory from "@/pages/StudentHistory";
import InstructorAssignments from "@/pages/InstructorAssignments";
import AssignmentDetails from "@/pages/AssignmentDetails";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode; requiredRole?: 'student' | 'instructor' }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'student' ? '/student/dashboard' : '/instructor/dashboard'} replace />;
  }
  
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  if (user) {
    return <Navigate to={user.role === 'student' ? '/student/dashboard' : '/instructor/dashboard'} replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<PublicRoute><Index /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        
        {/* Student Routes */}
        <Route path="/student/dashboard" element={
          <ProtectedRoute requiredRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        } />
        <Route path="/student/upload/:assignmentId" element={
          <ProtectedRoute requiredRole="student">
            <AssignmentUpload />
          </ProtectedRoute>
        } />
        <Route path="/student/history" element={
          <ProtectedRoute requiredRole="student">
            <StudentHistory />
          </ProtectedRoute>
        } />
        
        {/* Instructor Routes */}
        <Route path="/instructor/dashboard" element={
          <ProtectedRoute requiredRole="instructor">
            <InstructorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/instructor/review/:submissionId" element={
          <ProtectedRoute requiredRole="instructor">
            <ReviewSubmission />
          </ProtectedRoute>
        } />
        <Route path="/instructor/assignments" element={
          <ProtectedRoute requiredRole="instructor">
            <InstructorAssignments />
          </ProtectedRoute>
        } />
        
        {/* Shared Routes */}
        <Route path="/assignment/:assignmentId" element={
          <ProtectedRoute>
            <AssignmentDetails />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AssignmentProvider>
            <AppRoutes />
          </AssignmentProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
