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
import { CohereClientV2 } from "cohere-ai";

export default function InterviewReport() {
    // State to store interview report data
    const [reportData, setReportData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    // Force dark theme with React's useEffect
    React.useEffect(() => {
        // Add dark class to html element
        document.documentElement.classList.add('dark');
        
        // Fetch Cohere response when component mounts
        fetchCohereResponse();
        
        // Remove the class when component unmounts
        return () => {
            // Only remove if we added it
            document.documentElement.classList.remove('dark');
        };
    }, []); // Empty dependency array ensures this only runs once

    const fetchCohereResponse = async () => {
        try {
            setLoading(true);
            
            // Get chat history from localStorage
            const chatHistory = JSON.parse(localStorage.getItem('interviewChatHistory'));
            
            if (!chatHistory || !Array.isArray(chatHistory) || chatHistory.length === 0) {
                console.error("No chat history found or invalid format");
                setError("No interview data found. Please ensure interview data is available.");
                setLoading(false);
                return;
            }
            
            // Extract position and candidate name if available
            let position = "Unknown Position";
            let candidateName = "Unknown Candidate";
            
            // Try to extract position and name from chat history
            for (const message of chatHistory) {
                if (message.role === "system" && message.content.includes("position")) {
                    const positionMatch = message.content.match(/position[:\s]+([^,\n]+)/i);
                    if (positionMatch && positionMatch[1]) {
                        position = positionMatch[1].trim();
                    }
                }
                if (message.role === "user" && message.content.includes("name")) {
                    const nameMatch = message.content.match(/name[:\s]+([^,\n]+)/i);
                    if (nameMatch && nameMatch[1]) {
                        candidateName = nameMatch[1].trim();
                    }
                }
            }
            
            // Format the chat history for the prompt
            const formattedChatHistory = chatHistory.map(msg => {
                return `${msg.role.toUpperCase()}: ${msg.content}`;
            }).join("\n\n");
            
            // Get API key from import.meta.env (for Vite projects)
            const apiKey = import.meta.env.VITE_COHERE_API_KEY;
            
            if (!apiKey) {
                console.error("Cohere API key not found in environment variables!");
                console.log("Make sure you have VITE_COHERE_API_KEY in your .env file");
                console.log("Using fallback API key for development");
            }
            
            // Initialize the Cohere client
            const cohere = new CohereClientV2({
                token: apiKey
            });
            
            // Create the prompt with the interview grading scheme
            const prompt = `
# Interview Analysis Task

## Interview Information:
- Position: ${position}
- Candidate: ${candidateName}
- Date: ${new Date().toLocaleDateString()}

## Interview Transcript:
${formattedChatHistory}

## Your Task:
You are an expert interviewer and evaluator. Analyze the above interview transcript and generate a comprehensive assessment report following these guidelines:

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

5. Determine a recommendation status: "Strongly Recommended", "Recommended for next round", "Consider for another role", or "Not recommended"

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

IMPORTANT: Ensure your response is ONLY the valid JSON object with no additional text before or after it.
`;

            // Call the generate endpoint with a supported model
            const response = await cohere.generate({
                model: "command", // Or a more advanced model if available
                prompt: prompt,
                maxTokens: 2000, // Adjust based on expected response length
                temperature: 0.2, // Lower for more consistent output
                format: "json", // Request JSON format if API supports it
            });
            
            console.log("Cohere API response:", response);
            
            // Extract the generated text and parse it
            const generatedText = response.generations?.[0]?.text || "";
            console.log("Generated text:", generatedText);
            
            // Try to parse as JSON
            try {
                const parsedData = JSON.parse(generatedText);
                setReportData(parsedData);
                setLoading(false);
            } catch (error) {
                console.error("Error parsing JSON from Cohere response:", error);
                console.log("Raw response was:", generatedText);
                setError("Error processing the interview data. Please try again.");
                setLoading(false);
            }
            
        } catch (error) {
            console.error("Error fetching Cohere response:", error);
            setError("Error connecting to the evaluation service. Please try again later.");
            setLoading(false);
        }
    };

    // For testing/development, use this sample data if you want to bypass Cohere
    const useExampleData = () => {
        // Using the data from Cohere's response
        const exampleReport = {
            "candidateName": "John Doe", // Updated from Unknown Candidate
            "position": "Senior Frontend Developer", // Updated from Unknown Position
            "overallScore": 80, // Updated from 60 to average of the two reports
            "interviewDate": "March 23, 2025", // Formatted date
            "duration": "45 minutes", // Changed from 1 hour
            "interviewer": "Sarah Johnson", // Updated from Unknown Interviewer
            "summary": "The candidate shows strong technical knowledge with good problem-solving skills. While communication could be improved, they demonstrate a solid understanding of frontend development concepts and frameworks. Their experience is relevant but could benefit from more exposure to large-scale applications.",
            "categories": [
                {
                    "name": "Technical Knowledge",
                    "score": 85, // Average of both reports
                    "feedback": "Strong understanding of fundamental programming concepts with knowledge of several frameworks and languages. Could improve on explaining core assumptions."
                },
                {
                    "name": "Problem Solving",
                    "score": 83, // Average of both reports
                    "feedback": "Demonstrates a methodical and thoughtful approach to problem-solving, though sometimes overlooks key constraints and assumptions."
                },
                {
                    "name": "Communication",
                    "score": 70, // Same in both reports
                    "feedback": "Adequate clarity but occasionally struggles to explain complex concepts simply. Would benefit from more comprehensive explanations."
                },
                {
                    "name": "Experience",
                    "score": 63, // Average of both reports
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

    // If loading data from Cohere fails or for development, use this
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

    // Show loading state
    if (loading && !reportData) {
        return (
            <div className="bg-black w-full min-h-screen flex items-center justify-center">
                <div className="text-blue-300 text-center">
                    <div className="animate-spin mb-4 mx-auto">
                        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                    <p>Analyzing interview data...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error && !reportData) {
        return (
            <div className="bg-black w-full min-h-screen flex items-center justify-center">
                <div className="text-red-400 text-center max-w-md p-6 bg-gray-900 rounded-lg border border-red-900/30">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Error</h2>
                    <p>{error}</p>
                    <Button 
                        variant="outline" 
                        className="mt-4 border-red-500/30 text-red-400 hover:bg-red-950/30"
                        onClick={() => fetchCohereResponse()}
                    >
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

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
                            Interview Results
                        </h1>
                        <p className="text-gray-400 text-sm">
                            {report.position} | {report.interviewDate}
                        </p>
                        <div className="flex justify-center mt-2">
                            <Badge className="bg-blue-900/30 text-blue-300 border-blue-700/50">
                                {report.interviewer}
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
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        <BlurFade delay={0.6} inView>
                                            <div className="bg-gray-800 rounded p-3 border border-green-900/30">
                                                <h3 className="font-medium mb-2 text-sm text-green-300">Strengths</h3>
                                                <ul className="text-xs space-y-1">
                                                    {report.strengths.map((strength, idx) => (
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
                                                    {report.areasToImprove.map((area, idx) => (
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
                                        <span className="text-xs">{report.duration}</span>
                                    </div>
                                    <Badge className="text-xs py-0.5 bg-blue-900/70 text-blue-100 border-blue-700">
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
                                    {report.categories.map((category, idx) => (
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