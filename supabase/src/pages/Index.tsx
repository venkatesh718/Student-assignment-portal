import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, BookOpen, Users, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center bg-gradient-to-b from-secondary/30 to-background">
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-center mb-8">
            <GraduationCap className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-5xl font-bold mb-6">Student Assignment Portal</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A comprehensive platform for students to submit assignments and instructors to manage, grade, and provide feedback efficiently.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="w-full sm:w-auto">
                Sign In to Portal
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Platform Features</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader className="text-center">
                <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Assignment Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Instructors can create, edit, and manage assignments with deadlines, descriptions, and file requirements.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Easy Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Students can upload their assignments with support for PDF and Word documents, with automatic deadline tracking.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Grade & Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Comprehensive grading system with detailed feedback, submission history, and performance tracking.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-16 px-4 bg-secondary/20">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">Choose Your Role</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">For Students</CardTitle>
                <CardDescription>Access your assignments and track your progress</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li>• View active assignments and deadlines</li>
                  <li>• Upload assignments with file validation</li>
                  <li>• Track submission status and grades</li>
                  <li>• Access detailed feedback from instructors</li>
                  <li>• View complete submission history</li>
                </ul>
                <Link to="/register" className="block">
                  <Button className="w-full mt-4">Register as Student</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">For Instructors</CardTitle>
                <CardDescription>Manage assignments and grade student work</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li>• Create and manage assignments</li>
                  <li>• Review student submissions</li>
                  <li>• Provide grades and detailed feedback</li>
                  <li>• Track submission statistics</li>
                  <li>• Manage assignment deadlines</li>
                </ul>
                <Link to="/register" className="block">
                  <Button className="w-full mt-4">Register as Instructor</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
