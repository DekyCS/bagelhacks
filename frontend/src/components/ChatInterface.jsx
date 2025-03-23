import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Trash2 } from 'lucide-react';

const ChatInterface = ({ messageInput, setMessageInput }) => {
  // Function to handle message sending
  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    
    console.log("Sending message:", messageInput);
    
    // Here you would typically send the message to your backend
    // For now, we'll just log it and clear the input
    
    // Clear the input after sending
    setMessageInput("");
    
    // After sending, return focus to the 3D model
    // This is optional - remove if you want to keep the text input visible
    window.dispatchEvent(new CustomEvent('sceneFocusChange', {
      detail: { focus: 'model' }
    }));
  };
  
  // Handle Enter key press to send message
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent adding a new line
      handleSendMessage();
    }
  };

  return (
    <div className="w-full h-full p-6 bg-gray-50 overflow-auto">
      <Card className="h-full shadow-xl border border-gray-200">
        <CardHeader className="bg-white border-b sticky top-0 z-10">
          <CardTitle className="text-2xl text-gray-800">Technical Answer</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 bg-white flex-grow overflow-auto">
          <Textarea
            placeholder="Type your answer to the technical question here..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-64 text-lg focus:ring-2 focus:ring-blue-500 h-full"
          />
        </CardContent>
        <CardFooter className="flex justify-between bg-white border-t py-4 sticky bottom-0 z-10">
          <Button
            variant="default"
            size="lg"
            className="flex items-center gap-2"
            onClick={handleSendMessage}
          >
            <Send size={20} />
            <span>Submit Answer</span>
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