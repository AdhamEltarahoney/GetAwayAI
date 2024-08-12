'use client'
import { useEffect, useState } from "react";
import Image from "next/image";
import { Box, Stack, TextField, Button } from "@mui/material"; // Import these if using Material-UI
import { Assistant } from "next/font/google";

export default function Home() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: 'Hi, I am the GetAwayAI agent! How can I assist you in finding your next vacation spot?'
  }]);

  const [message, setMessage] = useState('');

  const sendMessage = async () => {
    // Optimistically update the UI
    const userMessage = message;
    setMessage('');
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: userMessage },
      { role: 'assistant', content: '' },
    ]);
  
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: userMessage }),  // Send prompt as a string
    });
  
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
  
    let result = '';
    return reader.read().then(function processText({ done, value }) {
      if (done) {
        return result;
      }
      const text = decoder.decode(value || new Uint8Array(), { stream: true });
      setMessages((messages) => {
        const lastMessage = messages[messages.length - 1];
        const otherMessages = messages.slice(0, messages.length - 1);
        return [
          ...otherMessages,
          { ...lastMessage, content: lastMessage.content + text },
        ];
      });
      return reader.read().then(processText);
    });
  };
  

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100vh"
      width="100vw"
      justifyContent="center"
      alignItems="center"
    >
      <Stack
        direction="column"
        width="600px"
        height="700px"
        border="1px solid black"
        p={2}
        spacing={2}
      >
        <Stack
          direction="column"
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messages.map((message, index) => (
            <Box key={index} display='flex' justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}>
              <Box
                bgcolor={message.role === 'assistant' ? 'primary.main' : 'secondary.main'}
                color="white"
                borderRadius={16}
                p={3}
              >
                {message.content}
              </Box>
            </Box>
          ))}
        </Stack>
        <Stack
          direction="row"
          spacing={2}
        >
          <TextField
            fullWidth
            label="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button variant="contained" onClick={sendMessage}>Send</Button>          
        </Stack>
      </Stack>
    </Box>
  );
}
