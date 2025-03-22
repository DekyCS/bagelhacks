import React from 'react';
import { Html } from "@react-three/drei";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Trash2 } from 'lucide-react';

function ChatInputPanel({ sceneFocus, messageInput, setMessageInput }) {
  return (
    <Html
      position={[1, 0, 2]}
      distanceFactor={2}
      zIndexRange={[100, 0]}
      transform
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '600px',
        opacity: sceneFocus === 'input' ? 1 : 0.3,
        transition: 'opacity 0.5s ease-in-out'
      }}
    >
      <Card className="w-full shadow-xl">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-2xl text-gray-800"> code</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Textarea
            placeholder="Type your message here..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            className="min-h-32 text-lg focus:ring-2 focus:ring-blue-500"
          />
        </CardContent>
        <CardFooter className="flex justify-between bg-gray-50 border-t py-4">
          <Button 
            variant="default" 
            size="lg"
            className="flex items-center gap-2"
            onClick={() => console.log("Message sent:", messageInput)}
          >
            <Send size={20} />
            <span>Send</span>
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="flex items-center gap-2"
            onClick={() => setMessageInput("")}
          >
            <Trash2 size={20} />
            <span>Clear</span>
          </Button>
        </CardFooter>
      </Card>
    </Html>
  );
}

export default ChatInputPanel;