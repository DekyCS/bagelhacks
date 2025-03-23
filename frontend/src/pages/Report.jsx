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
import { Loader2 } from "lucide-react"; // Import Loader2 icon from lucide-react
import { AlertCircle, CheckCircle, Clock, Star, ArrowLeft, Award, Building2 } from 'lucide-react';

export default function InterviewReport() {
    // State to store interview report data
    const [reportData, setReportData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [loadingProgress, setLoadingProgress] = React.useState(0);

    // Update loading progress animation
    React.useEffect(() => {
        if (loading && !reportData) {
            const interval = setInterval(() => {
                setLoadingProgress(prev => {
                    // Increment slowly up to 90%, the last 10% will be when data is actually loaded
                    const increment = Math.random() * 2;
                    return prev < 90 ? Math.min(prev + increment, 90) : prev;
                });
            }, 300);
            
            return () => clearInterval(interval);
        } else if (!loading) {
            setLoadingProgress(100);
        }
    }, [loading, reportData]);
    
    // Force dark theme with React's useEffect
    React.useEffect(() => {
        // Add dark class to html element
        document.documentElement.classList.add('dark');
        
        // Add overflow-x-hidden to body to prevent horizontal scrolling
        document.body.style.overflowX = 'hidden';
        
        // Fetch API response when component mounts
        fetchOpenAIResponse();
        
        // Remove the class when component unmounts
        return () => {
            // Only remove if we added it
            document.documentElement.classList.remove('dark');
            document.body.style.overflowX = '';
        };
    }, []); // Empty dependency array ensures this only runs once

    const fetchOpenAIResponse = async () => {
        try {
            setLoading(true);
            setLoadingProgress(10); // Start loading progress
            
            // Get chat history from localStorage
            const chatHistory = JSON.parse(localStorage.getItem('interviewChatHistory'));
            
            if (!chatHistory || !Array.isArray(chatHistory) || chatHistory.length === 0) {
                console.error("No chat history found or invalid format");
                setError("No interview data found. Please ensure interview data is available.");
                setLoading(false);
                return;
            }
            
            setLoadingProgress(20); // Update progress
            
            // Get values directly from localStorage
            const candidateName = localStorage.getItem('interviewName') || "Unknown Candidate";
            const position = localStorage.getItem('interviewPosition') || "Unknown Position";
            const company = localStorage.getItem('interviewCompany') || "Unknown Company";
            
            setLoadingProgress(30); // Update progress
            
            // Get API key from import.meta.env (for Vite projects)
            const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
            
            if (!apiKey) {
                console.error("OpenAI API key not found in environment variables!");
                console.log("Make sure you have VITE_OPENAI_API_KEY in your .env file");
                setError("API key not found. Please check your environment configuration.");
                setLoading(false);
                return;
            }
            
            setLoadingProgress(40); // Update progress
            
            // Format the messages for OpenAI's chat completion API
            const messages = [
                {
                    role: "system",
                    content: `You are an expert interviewer and evaluator. Analyze the interview transcript and generate a comprehensive assessment report.`
                },
                {
                    role: "user",
                    content: `
# Interview Analysis Task

## Interview Information:
- Position: ${position}
- Candidate: ${candidateName}
- Company: ${company}
- Date: ${new Date().toLocaleDateString()}

## Interview Transcript:
${chatHistory.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join("\n\n")}

## Your Task:
Analyze the above interview transcript and generate a comprehensive assessment report following these guidelines:

1. Evaluate the candidate across these categories:
   - Technical Knowledge (understanding of technologies and concepts)
   - Problem Solving (approach to challenges and solution quality)
   - Communication (clarity and ability to explain concepts)
   - Experience (relevance and depth of past work)

2. For each category, provide:
   - A score from 0-100
   - 1-2 sentences of specific, constructive feedback

3. Identify 3-5 key questions from the interview and rate each answer on a scale of 1-5

4. List 2-4 specific strengths and 2-4 areas for improvement

5. Determine a recommendation status (select one, without including the company name): "Strongly Recommended", "Recommended for next round", "Consider for another role", or "Not recommended"

6. Calculate an overall score from 0-100 based on performance across all categories

## Output Format:
Generate your response as a valid JSON object with the following structure:

{
  "candidateName": "string",
  "position": "string",
  "overallScore": number,
  "interviewDate": "string",
  "duration": "string",
  "interviewer": "string",
  "summary": "string",
  "categories": [
    {
      "name": "Technical Knowledge",
      "score": number,
      "feedback": "string"
    },
    // Include all 4 categories
  ],
  "questions": [
    {
      "question": "string",
      "rating": number,
      "notes": "string"
    }
    // Include 3-5 key questions
  ],
  "strengths": ["string", "string", ...],
  "areasToImprove": ["string", "string", ...],
  "recommendationStatus": "string"
}

IMPORTANT: Ensure your response is ONLY the valid JSON object with no additional text before or after it.`
                }
            ];

            setLoadingProgress(50); // Update progress
            
            // Call the OpenAI API
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini', // Using GPT-4o mini model
                    messages: messages,
                    temperature: 0.2, // Lower temperature for more consistent output
                    response_format: { type: "json_object" } // Request JSON format
                })
            });
            
            setLoadingProgress(70); // Update progress
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error("OpenAI API error:", errorData);
                setError(`Error from OpenAI API: ${errorData.error?.message || 'Unknown error'}`);
                setLoading(false);
                return;
            }
            
            const data = await response.json();
            console.log("OpenAI API response:", data);
            
            setLoadingProgress(80); // Update progress
            
            // Extract the generated text
            const generatedText = data.choices?.[0]?.message?.content || "";
            console.log("Generated text:", generatedText);
            
            setLoadingProgress(90); // Update progress
            
            // Try to parse as JSON
            try {
                const parsedData = JSON.parse(generatedText);
                setReportData(parsedData);
                setLoadingProgress(100); // Complete progress
                setLoading(false);
            } catch (error) {
                console.error("Error parsing JSON from OpenAI response:", error);
                console.log("Raw response was:", generatedText);
                setError("Error processing the interview data. Please try again.");
                setLoading(false);
            }
            
        } catch (error) {
            console.error("Error fetching OpenAI response:", error);
            setError("Error connecting to the evaluation service. Please try again later.");
            setLoading(false);
        }
    };

    // For testing/development, use this sample data if you want to bypass the API
    const useExampleData = () => {
        // Get values directly from localStorage for the example data
        const candidateName = localStorage.getItem('interviewName') || "John Doe";
        const position = localStorage.getItem('interviewPosition') || "Senior Frontend Developer";
        
        const exampleReport = {
            "candidateName": candidateName,
            "position": position,
            "overallScore": 80,
            "interviewDate": "March 23, 2025",
            "duration": "45 minutes",
            "interviewer": "Sarah Johnson",
            "summary": "The candidate shows strong technical knowledge with good problem-solving skills. While communication could be improved, they demonstrate a solid understanding of frontend development concepts and frameworks. Their experience is relevant but could benefit from more exposure to large-scale applications.",
            "categories": [
                {
                    "name": "Technical Knowledge",
                    "score": 85,
                    "feedback": "Strong understanding of fundamental programming concepts with knowledge of several frameworks and languages. Could improve on explaining core assumptions."
                },
                {
                    "name": "Problem Solving",
                    "score": 83,
                    "feedback": "Demonstrates a methodical and thoughtful approach to problem-solving, though sometimes overlooks key constraints and assumptions."
                },
                {
                    "name": "Communication",
                    "score": 70,
                    "feedback": "Adequate clarity but occasionally struggles to explain complex concepts simply. Would benefit from more comprehensive explanations."
                },
                {
                    "name": "Experience",
                    "score": 63,
                    "feedback": "Experience is relevant but could benefit from further discussion of specific projects and outcomes that align with company needs."
                }
            ],
            "questions": [
                {
                    "question": "Explain the difference between frontend and backend development",
                    "rating": 4,
                    "notes": "Clear explanation with expressed preference for backend development, showing desire for challenging problem-solving."
                },
                {
                    "question": "How do you keep up with the latest trends in software?",
                    "rating": 3,
                    "notes": "Mentioned courses and resources but lacked specific details about technologies followed."
                },
                {
                    "question": "Describe a project where you overcame a difficult problem",
                    "rating": 5,
                    "notes": "Excellent detailed explanation of a technical challenge solved with a systematic approach."
                },
                {
                    "question": "What is your approach to testing and debugging code?",
                    "rating": 4,
                    "notes": "Described an iterative approach but didn't discuss insights from debugging tools."
                },
                {
                    "question": "Can you describe a scenario where you advocated for user-centric design?",
                    "rating": 5,
                    "notes": "Provided a strong example of successfully implementing user-centered design principles."
                }
            ],
            "strengths": [
                "Problem-solving approach and critical thinking",
                "Technical knowledge of programming concepts",
                "Experience with debugging and testing",
                "User research and usability testing skills"
            ],
            "areasToImprove": [
                "Communication of complex technical concepts",
                "Discussing previous work in greater depth",
                "Clarifying core assumptions in problem statements",
                "System design and performance optimization"
            ],
            "recommendationStatus": "Recommended for next round"
        };
        
        return exampleReport;
    };

    // If loading data from API fails or for development, use this
    const report = reportData || useExampleData();

    // Helper for star ratings
    const StarRating = ({ rating }) => {
        return (
            <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                    <Star 
                        key={i} 
                        size={16} 
                        className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-500 opacity-40"} 
                    />
                ))}
            </div>
        );
    };

    // Show loading state - Using shadcn style loading screen
    if (loading && !reportData) {
        return (
            <div className="bg-black w-full min-h-screen overflow-x-hidden">
                <Particles
                    className="absolute inset-0 z-0"
                    quantity={25}
                    ease={100}
                    color="#ffffff"
                    refresh
                />
                
                <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
                    <Card className="w-full max-w-md bg-gray-900/90 border-blue-900/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xl text-center text-blue-300">
                                Analyzing Interview
                            </CardTitle>
                            <CardDescription className="text-center text-blue-300/70">
                                Processing candidate responses and generating report
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-4">
                            <div className="flex justify-center">
                                <Loader2 className="h-12 w-12 text-blue-400 animate-spin" />
                            </div>
                            
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-blue-300/70">
                                    <span>Analysis in progress...</span>
                                    <span>{loadingProgress}%</span>
                                </div>
                                <Progress value={loadingProgress} className="h-1.5 bg-gray-800" />
                            </div>
                            
                            <div className="space-y-3">
                                <div className="text-xs text-center text-gray-400">
                                    {loadingProgress < 30 && "Reading interview transcript..."}
                                    {loadingProgress >= 30 && loadingProgress < 60 && "Evaluating candidate responses..."}
                                    {loadingProgress >= 60 && loadingProgress < 80 && "Generating assessment metrics..."}
                                    {loadingProgress >= 80 && "Finalizing report..."}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Show error state - Enhanced with shadcn components
    if (error && !reportData) {
        return (
            <div className="bg-black w-full min-h-screen overflow-x-hidden">
                <Particles
                    className="absolute inset-0 z-0"
                    quantity={25}
                    ease={100}
                    color="#ffffff"
                    refresh
                />
                
                <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
                    <Card className="w-full max-w-md bg-gray-900/90 border-red-900/30">
                        <CardHeader className="pb-2">
                            <div className="flex justify-center mb-2">
                                <AlertCircle className="w-12 h-12 text-red-400" />
                            </div>
                            <CardTitle className="text-xl text-center text-red-400">
                                Error Occurred
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-2">
                            <p className="text-center text-gray-300 text-sm">{error}</p>
                        </CardContent>
                        <CardFooter className="flex justify-center pt-2 pb-6">
                            <Button 
                                onClick={() => fetchOpenAIResponse()}
                                className="bg-red-950/50 text-red-300 hover:bg-red-900/50 border border-red-700/30"
                            >
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Try Again
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-black w-full min-h-screen overflow-x-hidden">
            <Particles
                className="absolute inset-0 z-0"
                quantity={50}
                ease={100}
                color="#ffffff"
                refresh
            />
            
            <div className="relative z-10 container mx-auto px-4 py-8">
                
                <BlurFade delay={0.2} inView>
                    <header className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-blue-300 mb-1">
                            Interview Results
                        </h1>
                        <p className="text-gray-400 text-sm">
                            {report.position} | {report.interviewDate}
                        </p>
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
                                        Interview with {report.candidateName}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <BlurFade delay={0.4} inView>
                                        <div className="flex flex-col items-center">
                                            <div className="relative">
                                                <span className="text-6xl font-bold text-blue-300">
                                                    {report.overallScore}
                                                </span>
                                                <span className="absolute top-0 right-0 transform translate-x-full -translate-y-1/4 text-xs text-gray-400">/100</span>
                                            </div>
                                        </div>
                                    </BlurFade>
                                    
                                    <BlurFade delay={0.5} inView>
                                        <div className="bg-gray-800 rounded p-4 border border-blue-900/30">
                                            <h3 className="font-medium mb-1 text-sm text-blue-300">Summary</h3>
                                            <p className="text-gray-300 text-xs">{report.summary}</p>
                                        </div>
                                    </BlurFade>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <BlurFade delay={0.6} inView>
                                            <div className="bg-gray-800 rounded p-3 border border-green-900/30">
                                                <h3 className="font-medium mb-2 text-sm text-green-300">Strengths</h3>
                                                <ul className="text-xs space-y-1">
                                                    {report.strengths.map((strength, idx) => (
                                                        <li key={idx} className="text-gray-300 break-words">
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
                                                    {report.areasToImprove.map((area, idx) => (
                                                        <li key={idx} className="text-gray-300 break-words">
                                                            {area}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </BlurFade>
                                    </div>
                                </CardContent>
                                <CardFooter className="border-t border-blue-900/30 pt-3 flex flex-wrap justify-between items-center">
                                    <div className="flex items-center gap-1 text-blue-300/70">
                                        <Building2 size={14} />
                                        <span className="text-xs">{localStorage.getItem('interviewCompany') || "Unknown Company"}</span>
                                    </div>
                                    <Badge className="text-xs py-0.5 bg-blue-900/70 text-blue-100 border-blue-700 mt-2 sm:mt-0">
                                        {report.recommendationStatus}
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
                                    {report.categories.map((category, idx) => (
                                        <BlurFade key={idx} delay={0.5 + (idx * 0.1)} inView>
                                            <div className="p-3 bg-gray-800 rounded-lg border border-blue-900/20 hover:border-blue-800/40 transition-all duration-300">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-blue-200">{category.name}</span>
                                                    <span className="text-xs text-blue-300">{category.score}</span>
                                                </div>
                                                <Progress 
                                                    value={category.score} 
                                                    className={`h-1.5 bg-gray-700 ${category.score >= 85 ? "bg-blue-400" : category.score >= 80 ? "bg-blue-500" : category.score >= 70 ? "bg-blue-600" : "bg-amber-400"}`}
                                                />
                                                <div className="mt-2 text-xs text-gray-300">
                                                    {category.feedback}
                                                </div>
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
                                    {report.questions.map((q, idx) => (
                                        <BlurFade key={idx} delay={0.9 + (idx * 0.1)} inView>
                                            <Card className="bg-gray-900 border-blue-900/30">
                                                <CardHeader className="pb-1">
                                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                                        <CardTitle className="text-xs text-blue-200 break-words">{q.question}</CardTitle>
                                                        <div className="flex-shrink-0">
                                                            <StarRating rating={q.rating} />
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-gray-300 text-xs break-words">{q.notes}</p>
                                                </CardContent>
                                            </Card>
                                        </BlurFade>
                                    ))}
                                </div>
                            </TabsContent>
                            <TabsContent value="feedback" className="border-0 p-0 bg-transparent">
                                <div className="space-y-3">
                                    {report.categories.map((category, idx) => (
                                        <BlurFade key={idx} delay={0.9 + (idx * 0.1)} inView>
                                            <Card className="bg-gray-900 border-blue-900/30">
                                                <CardHeader className="pb-1">
                                                    <CardTitle className="text-xs text-blue-200">{category.name}</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-gray-300 text-xs break-words">{category.feedback}</p>
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