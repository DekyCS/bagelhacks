import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Trash2 } from 'lucide-react';

const ChatInterface = ({ messageInput, setMessageInput }) => {
  return (
    <div className="w-full h-full p-6 bg-gray-50 overflow-auto">
      <Card className="h-full shadow-xl border border-gray-200">
        <CardHeader className="bg-white border-b sticky top-0 z-10">
          <CardTitle className="text-2xl text-gray-800">Chat</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 bg-white flex-grow overflow-auto">
          <Textarea
            placeholder="Type your message here..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            className="min-h-64 text-lg focus:ring-2 focus:ring-blue-500 h-full"
          />
        </CardContent>
        <CardFooter className="flex justify-between bg-white border-t py-4 sticky bottom-0 z-10">
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
    </div>
  );
};

export default ChatInterface;