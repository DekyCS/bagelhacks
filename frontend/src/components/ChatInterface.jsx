import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const PythonCodeBlock = ({ code }) => {
  // Keywords for Python syntax highlighting
  const pythonKeywords = [
    'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 
    'def', 'del', 'elif', 'else', 'except', 'False', 'finally', 'for', 
    'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'None', 
    'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'True', 'try', 
    'while', 'with', 'yield'
  ];
  
  // Apply syntax highlighting
  const applySyntaxHighlighting = (code) => {
    if (!code) return [];
    
    // Split the code into lines
    const lines = code.split('\n');
    
    return lines.map((line, lineIndex) => {
      // Process each line for syntax highlighting
      let highlightedLine = [];
      let currentWord = '';
      let inString = false;
      let stringChar = '';
      let inComment = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        // Handle comments
        if (char === '#' && !inString) {
          inComment = true;
          if (currentWord) {
            highlightedLine.push(
              <span key={`${lineIndex}-word-${i}`} className={pythonKeywords.includes(currentWord) ? 'text-blue-500 font-medium' : 'text-slate-200'}>
                {currentWord}
              </span>
            );
            currentWord = '';
          }
          highlightedLine.push(
            <span key={`${lineIndex}-comment-${i}`} className="text-emerald-400 italic">
              {line.substring(i)}
            </span>
          );
          break;
        }
        
        // Handle strings
        if ((char === "'" || char === '"') && (i === 0 || line[i-1] !== '\\')) {
          if (!inString) {
            // Starting a new string
            if (currentWord) {
              highlightedLine.push(
                <span key={`${lineIndex}-word-${i}`} className={pythonKeywords.includes(currentWord) ? 'text-blue-500 font-medium' : 'text-slate-200'}>
                  {currentWord}
                </span>
              );
              currentWord = '';
            }
            inString = true;
            stringChar = char;
            currentWord = char;
          } else if (char === stringChar) {
            // Ending the string
            currentWord += char;
            highlightedLine.push(
              <span key={`${lineIndex}-string-${i}`} className="text-amber-300">
                {currentWord}
              </span>
            );
            currentWord = '';
            inString = false;
          } else {
            // This is a different quote character inside a string
            currentWord += char;
          }
          continue;
        }
        
        if (inString) {
          currentWord += char;
          continue;
        }
        
        // Handle spaces and punctuation
        if (/\s/.test(char) || /[.,();:=+\-*/%<>[\]{}]/.test(char)) {
          if (currentWord) {
            highlightedLine.push(
              <span key={`${lineIndex}-word-${i}`} className={pythonKeywords.includes(currentWord) ? 'text-blue-500 font-medium' : 'text-slate-200'}>
                {currentWord}
              </span>
            );
            currentWord = '';
          }
          
          // Highlight operators and punctuation
          if (/[.,();:=+\-*/%<>[\]{}]/.test(char)) {
            highlightedLine.push(
              <span key={`${lineIndex}-operator-${i}`} className="text-fuchsia-400">
                {char}
              </span>
            );
          } else {
            highlightedLine.push(char);
          }
          continue;
        }
        
        // Accumulate the current word
        currentWord += char;
      }
      
      // Add any remaining word
      if (currentWord && !inComment) {
        highlightedLine.push(
          <span key={`${lineIndex}-word-final`} className={pythonKeywords.includes(currentWord) ? 'text-blue-500 font-medium' : 'text-slate-200'}>
            {currentWord}
          </span>
        );
      }
      
      return (
        <div key={`line-${lineIndex}`} className="px-4 py-0.5 hover:bg-gray-800/50 flex">
          <span className="text-gray-500 w-8 inline-block text-right mr-3 select-none">{lineIndex + 1}</span>
          <div className="flex-1">{highlightedLine}</div>
        </div>
      );
    });
  };
  
  return (
    <div className="w-full rounded-lg overflow-hidden bg-gray-900 my-4 shadow-xl border border-gray-800">
      <div className="flex items-center bg-gray-800 px-4 py-2 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
          <span className="ml-2 text-gray-300 text-sm font-medium">mystery_function.py</span>
        </div>
      </div>
      <div className="p-0 overflow-x-auto">
        <pre className="font-mono text-sm leading-relaxed">
          {applySyntaxHighlighting(code)}
        </pre>
      </div>
    </div>
  );
};

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

  // The code to display in the code block
  const pythonCode = `def mystery_checker(text):    
    left = 0
    right = len(text) - 1
    
    while left < right:
        if text[left] != text[right]:
            return False
        left += 1
        right -= 1
    
    return True`;

  return (
    <div className="w-full h-full p-6 bg-gradient-to-br from-gray-100 to-gray-200 overflow-auto">
      <Card className="h-full shadow-xl border border-gray-200 rounded-xl overflow-hidden">
        <CardHeader className="bg-white border-b sticky top-0 z-10 px-6 py-5">
          <div>
            <CardTitle className="text-2xl text-gray-800 font-semibold">Code Challenge</CardTitle>
            <p className="text-gray-500 text-sm mt-1">Can you guess what this function does?</p>
          </div>
        </CardHeader>
        <CardContent className="pt-6 px-6 bg-white flex-grow overflow-auto">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Mystery Function</h3>
            <p className="text-gray-600 mb-4">
              Examine this Python function and try to determine what it does!
            </p>
            
            <PythonCodeBlock code={pythonCode} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatInterface;