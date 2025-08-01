import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAssignments } from '@/contexts/AssignmentContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, AlertTriangle, ArrowLeft, XCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, parseISO, isAfter } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const AssignmentUpload: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const { user } = useAuth();
  const { getAssignmentById, submitAssignment, isSubmissionAllowed, hasStudentSubmitted } = useAssignments();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const assignment = assignmentId ? getAssignmentById(assignmentId) : null;
  
  if (!assignment) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Assignment Not Found</h2>
        <Link to="/student/dashboard">
          <Button>Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const isOverdue = isAfter(new Date(), parseISO(assignment.deadline));
  const canSubmit = isSubmissionAllowed(assignment.id);
  const alreadySubmitted = hasStudentSubmitted(assignment.id, user?.id || '');
  
  const formatDeadline = (deadline: string) => {
    return format(parseISO(deadline), 'dd-MM-yyyy HH:mm');
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a PDF or Word document only.');
        return;
      }
      
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB.');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !user) return;
    
    if (!canSubmit) {
      toast({
        title: "Submission Closed",
        description: "The deadline for this assignment has passed.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Mock file upload - in real app this would upload to a server
    const mockFileUrl = URL.createObjectURL(selectedFile);
    
    submitAssignment({
      assignmentId: assignment.id,
      studentId: user.id,
      studentName: user.name,
      fileName: selectedFile.name,
      fileUrl: mockFileUrl,
    });
    
    const submissionType = alreadySubmitted ? "resubmitted" : "submitted";
    toast({
      title: `Assignment ${submissionType.charAt(0).toUpperCase() + submissionType.slice(1)}`,
      description: `Your assignment has been successfully ${submissionType}!`,
      className: "success-indicator",
    });
    
    setIsSubmitting(false);
    navigate('/student/dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/student/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Upload Assignment</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{assignment.title}</CardTitle>
          <CardDescription>{assignment.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
            <span className="font-medium">Deadline:</span>
            <span className={isOverdue ? 'overdue-text' : 'text-foreground'}>
              {formatDeadline(assignment.deadline)}
            </span>
          </div>

          {!canSubmit && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Submission is closed. The deadline for this assignment has passed.
              </AlertDescription>
            </Alert>
          )}

          {canSubmit && isOverdue && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This assignment is overdue. Late submissions may be penalized.
              </AlertDescription>
            </Alert>
          )}

          {alreadySubmitted && canSubmit && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                You have already submitted this assignment. Uploading a new file will replace your previous submission.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submit Your Work</CardTitle>
          <CardDescription>Upload your assignment file (PDF or Word document)</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">Assignment File</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                required
              />
              <p className="text-sm text-muted-foreground">
                Accepted formats: PDF, DOC, DOCX (Max size: 10MB)
              </p>
            </div>

            {selectedFile && (
              <div className="p-3 bg-secondary rounded-lg">
                <p className="text-sm">
                  <strong>Selected file:</strong> {selectedFile.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}

            <div className="flex space-x-2">
              <Button 
                type="submit" 
                disabled={!selectedFile || isSubmitting || !canSubmit}
                className="flex-1 hover-scale"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Submitting...' : alreadySubmitted ? 'Resubmit Assignment' : 'Submit Assignment'}
              </Button>
              <Link to="/student/dashboard">
                <Button type="button" variant="outline" className="hover-scale">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignmentUpload;