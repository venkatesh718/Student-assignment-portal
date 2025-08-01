import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAssignments } from '@/contexts/AssignmentContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, User, Calendar, Save } from 'lucide-react';
import { Link } from 'react-router-dom';

const ReviewSubmission: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const { submissions, assignments, gradeSubmission } = useAssignments();
  const navigate = useNavigate();
  
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const submission = submissions.find(s => s.id === submissionId);
  const assignment = submission ? assignments.find(a => a.id === submission.assignmentId) : null;
  
  if (!submission || !assignment) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Submission Not Found</h2>
        <Link to="/instructor/dashboard">
          <Button>Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  // Pre-fill existing feedback if already graded
  React.useEffect(() => {
    if (submission.grade !== undefined) {
      setGrade(submission.grade.toString());
    }
    if (submission.feedback) {
      setFeedback(submission.feedback);
    }
  }, [submission]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grade || !feedback) return;
    
    setIsSubmitting(true);
    
    const gradeNumber = parseInt(grade);
    if (gradeNumber < 0 || gradeNumber > 100) {
      alert('Grade must be between 0 and 100');
      setIsSubmitting(false);
      return;
    }
    
    gradeSubmission(submission.id, gradeNumber, feedback);
    
    setIsSubmitting(false);
    navigate('/instructor/dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/instructor/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Review Submission</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submission Details */}
        <Card>
          <CardHeader>
            <CardTitle>Submission Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Assignment:</span>
                <span>{assignment.title}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Student:</span>
                <span>{submission.studentName}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Submitted:</span>
                <span>{submission.submittedAt}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Deadline:</span>
                <span>{assignment.deadline}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="font-medium">Status:</span>
                <Badge variant={submission.status === 'late' ? 'destructive' : 'secondary'}>
                  {submission.status}
                </Badge>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Assignment Description:</h4>
              <p className="text-sm text-muted-foreground">{assignment.description}</p>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Submitted File:</h4>
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm">{submission.fileName}</span>
                <Button variant="outline" size="sm">
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grading Form */}
        <Card>
          <CardHeader>
            <CardTitle>Grade & Feedback</CardTitle>
            <CardDescription>Provide a grade and feedback for this submission</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="grade">Grade (0-100)</Label>
                <Input
                  id="grade"
                  type="number"
                  min="0"
                  max="100"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="Enter grade..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide detailed feedback for the student..."
                  rows={8}
                  required
                />
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Saving...' : 'Save Grade & Feedback'}
                </Button>
                <Link to="/instructor/dashboard">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>

            {submission.grade !== undefined && (
              <div className="mt-4 p-3 bg-secondary rounded-lg">
                <p className="text-sm">
                  <strong>Current Grade:</strong> {submission.grade}/100
                </p>
                {submission.feedback && (
                  <p className="text-sm mt-1">
                    <strong>Current Feedback:</strong> {submission.feedback}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* File Viewer Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>File Preview</CardTitle>
          <CardDescription>Preview of the submitted file</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/20">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">File preview would appear here</p>
              <p className="text-sm text-muted-foreground mt-1">
                In a real application, this would show the PDF/document content
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewSubmission;