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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MagicCard } from "@/components/magicui/magic-card";
import { BlurFade } from "@/components/magicui/blur-fade";
import { ArrowLeft } from 'lucide-react';

export default function Start() {
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

    return (
        <div className="bg-black w-full min-h-screen overflow-x-hidden">
            <Particles
                className="absolute inset-0 z-0"
                quantity={100}
                ease={80}
                color="#ffffff"
                refresh
            />
            
            <div className="flex items-center justify-center h-screen w-full">
                <div className="w-full max-w-md">
                    <Button 
                        variant="ghost" 
                        className="absolute top-4 left-4 text-white hover:bg-white/10 hover:cursor-pointer"
                        onClick={() => window.location.href = '/'}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    
                    <BlurFade delay={0.1}>
                        <MagicCard className="w-full">
                            <Card className="w-full bg-black/60 backdrop-blur-xl border-neutral-800">
                                <CardHeader>
                                    <CardTitle>Start your agent</CardTitle>
                                    <CardDescription>
                                        Enter all details needed for your interview practice agent
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form action="/form" method="post">
                                        <div className="grid gap-4">
                                            <BlurFade delay={0.2}>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="name">Your Name</Label>
                                                    <Input id="name" name="name" type="text" placeholder="John Doe" />
                                                </div>
                                            </BlurFade>
                                            <BlurFade delay={0.3}>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="company">Target Company</Label>
                                                    <Input id="company" name="company" type="text" placeholder="ACME Corp" />
                                                </div>
                                            </BlurFade>
                                        </div>
                                        <BlurFade delay={0.4}>
                                            <div className="mt-4">
                                                <Button type="submit" className="w-full hover:cursor-pointer">Create Agent</Button>
                                            </div>
                                        </BlurFade>
                                    </form>
                                </CardContent>
                            </Card>
                        </MagicCard>
                    </BlurFade>
                </div>
            </div>
        </div>
    )
}