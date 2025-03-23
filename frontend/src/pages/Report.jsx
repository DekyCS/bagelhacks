import * as React from "react"
import { Particles } from "@/components/magicui/particles";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BlurFade } from "@/components/magicui/blur-fade";
import { AlertCircle, CheckCircle, Clock, Star, ArrowLeft, Award } from 'lucide-react';

export default function InterviewReport() {
    // Force dark theme with React's useEffect
    React.useEffect(() => {
        // Add dark class to html element
        document.documentElement.classList.add('dark');
        // Remove the class when component unmounts
        return () => {
            // Only remove if we added it
            document.documentElement.classList.remove('dark');
        };
    }, []);

    // Mock data - this would come from your actual interview assessment
    const mockReport = {
      candidateName: "Sigma",
      position: "Senior Frontend Developer",
      overallScore: 99,
      interviewDate: "March 22, 2025",
      duration: "45 minutes",
      interviewer: "Sarah Johnson",
      summary: "Strong technical knowledge with good communication skills. Demonstrated solid problem-solving approach but could improve on system design concepts.",
      categories: [
        { name: "Technical Knowledge", score: 99, feedback: "Strong understanding of React and modern JavaScript. Handled algorithm questions well." },
        { name: "Problem Solving", score: 99, feedback: "Good analytical approach. Takes time to understand problems before diving into solutions." },
        { name: "Communication", score: 99, feedback: "Articulate and clear. Explains technical concepts effectively." },
        { name: "Experience", score: 99, feedback: "Has relevant experience but could benefit from more exposure to large-scale applications." }
      ],
      questions: [
        { question: "Describe a challenging project you worked on", rating: 4, notes: "Provided clear example with good details on their role and impact" },
        { question: "Implement a function to find duplicates in an array", rating: 5, notes: "Optimal O(n) solution with clear explanation of approach" },
        { question: "How would you optimize a slow-loading React component?", rating: 3, notes: "Basic understanding of optimization techniques, but missed some key concepts" },
        { question: "Tell me about a time you had to learn a new technology quickly", rating: 4, notes: "Good example showing adaptability and learning approach" },
        { question: "Design a simple state management solution", rating: 3, notes: "Solution worked but lacked consideration for edge cases" }
      ],
      strengths: ["Technical problem solving", "Communication skills", "React ecosystem knowledge"],
      areasToImprove: ["System design concepts", "Performance optimization", "Edge case handling"],
      recommendationStatus: "Recommended for next round"
    };

    // Helper function to get color based on score
    const getScoreColor = (score) => {
      if (score >= 85) return "bg-green-500";
      if (score >= 70) return "bg-blue-500";
      return "bg-red-500";
    };

    // Helper for star ratings
    const StarRating = ({ rating }) => {
      const getStarColor = (rating) => {
        if (rating >= 4) return "fill-green-400 text-green-400";
        if (rating >= 3) return "fill-blue-400 text-blue-400";
        return "fill-red-400 text-red-400";
      };
      
      return (
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              size={16} 
              className={i < rating ? getStarColor(rating) : "text-gray-500 opacity-40"} 
            />
          ))}
        </div>
      );
    };

    return (
        <div className="bg-black w-full min-h-screen">
            <Particles
                className="absolute inset-0 z-0"
                quantity={50}
                ease={100}
                color="#ffffff"
                refresh
            />
            
            <div className="relative z-10 container mx-auto px-4 py-8">
                <BlurFade delay={0.1} inView>
                    <Button variant="ghost" className="mb-6 text-gray-400 hover:text-white" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                    </Button>
                </BlurFade>
                
                <BlurFade delay={0.2} inView>
                    <header className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-blue-300 mb-1">
                            
                        </h1>
                        <p className="text-gray-400 text-sm">
                            {mockReport.position} | {mockReport.interviewDate}
                        </p>
                        <div className="flex justify-center mt-2">
                            <Badge className="bg-blue-900/30 text-blue-300 border-blue-700/50">
                                {mockReport.interviewer}
                            </Badge>
                        </div>
                    </header>
                </BlurFade>

                <div className="max-w-xl mx-auto">
                    <div className="grid grid-cols-1 gap-4 mb-6">
                        <BlurFade delay={0.3} inView>
                            <Card className="bg-gray-900 border-blue-900/50">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center mb-1">
                                        <Award className="text-blue-400 w-4 h-4 mr-2" />
                                        <CardTitle className="text-sm text-blue-300">Overall Assessment</CardTitle>
                                    </div>
                                    <CardDescription className="text-blue-300/70 text-xs">
                                        Interview with {mockReport.candidateName}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <BlurFade delay={0.4} inView>
                                        <div className="flex flex-col items-center">
                                            <div className="relative">
                                                <span className="text-6xl font-bold text-green-400">
                                                    {mockReport.overallScore}
                                                </span>
                                                <span className="absolute top-0 right-0 transform translate-x-full -translate-y-1/4 text-xs text-gray-400">/100</span>
                                            </div>
                                        </div>
                                    </BlurFade>
                                    
                                    <BlurFade delay={0.5} inView>
                                        <div className="bg-gray-800 rounded p-4 border border-blue-900/30">
                                            <h3 className="font-medium mb-1 text-sm text-blue-300">Summary</h3>
                                            <p className="text-gray-300 text-xs">Strong technical knowledge with good communication skills. Demonstrated solid problem-solving approach but could improve on system design concepts.</p>
                                        </div>
                                    </BlurFade>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        <BlurFade delay={0.6} inView>
                                            <div className="bg-gray-800 rounded p-3 border border-green-900/30">
                                                <h3 className="font-medium mb-2 text-sm text-green-300">Strengths</h3>
                                                <ul className="text-xs space-y-1">
                                                    {mockReport.strengths.map((strength, idx) => (
                                                        <li key={idx} className="text-gray-300">
                                                            {strength}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </BlurFade>
                                        <BlurFade delay={0.7} inView>
                                            <div className="bg-gray-800 rounded p-3 border border-amber-900/30">
                                                <h3 className="font-medium mb-2 text-sm text-amber-300">Areas to Improve</h3>
                                                <ul className="text-xs space-y-1">
                                                    {mockReport.areasToImprove.map((area, idx) => (
                                                        <li key={idx} className="text-gray-300">
                                                            {area}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </BlurFade>
                                    </div>
                                </CardContent>
                                <CardFooter className="border-t border-blue-900/30 pt-3 flex justify-between items-center">
                                    <div className="flex items-center gap-1 text-blue-300/70">
                                        <Clock size={14} />
                                        <span className="text-xs">{mockReport.duration}</span>
                                    </div>
                                    <Badge className="text-xs py-0.5 bg-green-900/70 text-green-100 border-green-700">
                                        {mockReport.recommendationStatus}
                                    </Badge>
                                </CardFooter>
                            </Card>
                        </BlurFade>

                        <BlurFade delay={0.4} inView>
                            <Card className="bg-gray-900 border-blue-900/50">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center mb-1">
                                        <Star className="text-blue-400 w-4 h-4 mr-2" />
                                        <CardTitle className="text-sm text-blue-300">Category Breakdown</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {mockReport.categories.map((category, idx) => (
                                        <BlurFade key={idx} delay={0.5 + (idx * 0.1)} inView>
                                            <div className="p-3 bg-gray-800 rounded-lg border border-blue-900/20 hover:border-blue-800/40 transition-all duration-300">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-gray-300">{category.name}</span>
                                                    <span className="text-xs font-medium text-green-400">{category.score}</span>
                                                </div>
                                                <Progress 
                                                    value={category.score} 
                                                    className="h-1.5 bg-gray-700"
                                                    indicatorClassName={getScoreColor(category.score)}
                                                />
                                            </div>
                                        </BlurFade>
                                    ))}
                                </CardContent>
                            </Card>
                        </BlurFade>
                    </div>

                    <BlurFade delay={0.8} inView>
                        <Tabs defaultValue="questions" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-gray-950 border-b border-blue-900/50 mb-4">
                                <TabsTrigger value="questions" className="bg-transparent data-[state=active]:bg-blue-900/20 data-[state=active]:text-blue-300 rounded-none text-xs py-2">Questions & Responses</TabsTrigger>
                                <TabsTrigger value="feedback" className="bg-transparent data-[state=active]:bg-blue-900/20 data-[state=active]:text-blue-300 rounded-none text-xs py-2">Detailed Feedback</TabsTrigger>
                            </TabsList>
                            <TabsContent value="questions" className="border-0 p-0 bg-transparent">
                                <div className="space-y-3">
                                    {mockReport.questions.map((q, idx) => (
                                        <BlurFade key={idx} delay={0.9 + (idx * 0.1)} inView>
                                            <Card className="bg-gray-900 border-blue-900/30">
                                                <CardHeader className="pb-1">
                                                    <div className="flex justify-between items-center">
                                                        <CardTitle className="text-xs text-blue-200">{q.question}</CardTitle>
                                                        <StarRating rating={q.rating} />
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-gray-300 text-xs">{q.notes}</p>
                                                </CardContent>
                                            </Card>
                                        </BlurFade>
                                    ))}
                                </div>
                            </TabsContent>
                            <TabsContent value="feedback" className="border-0 p-0 bg-transparent">
                                <div className="space-y-3">
                                    {mockReport.categories.map((category, idx) => (
                                        <BlurFade key={idx} delay={0.9 + (idx * 0.1)} inView>
                                            <Card className="bg-gray-900 border-blue-900/30">
                                                <CardHeader className="pb-1">
                                                    <CardTitle className="text-xs text-blue-200">{category.name}</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-gray-300 text-xs">{category.feedback}</p>
                                                </CardContent>
                                            </Card>
                                        </BlurFade>
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </BlurFade>
                </div>
            </div>
        </div>
    );
}