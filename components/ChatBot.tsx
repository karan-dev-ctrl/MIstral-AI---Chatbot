import { useState } from "react";
import { Tinos } from "next/font/google";
import { SendHorizonal, SendHorizontal } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {useEffect } from 'react'
 
const serifFont = Tinos({
  subsets: ["latin"],
  weight: ["400"],
});

export default function ChatBox() {
  const [messages, setMessages] = useState([
    { role: "system", content: "You are chatting with Mistral AI." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false)


  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: updatedMessages }),
    });

    const data = await response.json();
    if (response.ok) {
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: data.reply },
      ]);
    } else {
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: "Error from AI API" },
      ]);
    }
    setLoading(false);
  }


 const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
};
  

  return (
    <div 
    
      className="bg-cover bg-center min-h-screen p-4 items-center justify-center "
      style={{ backgroundImage: "url('./bgImage.avif')" }}
    >
      <h5 className={`text-center mt-10 text-6xl ${serifFont.className}`}>
       Hey, What's on Your Mind Today ?
      </h5>
      <div className="max-w-5xl mx-auto p-6 bg-cover rounded-3xl flex flex-col h-[80vh] mt-10">
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 border-gray-800 rounded-xl bg-cover">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`my-2 flex ${
                msg.role === "user"
                  ? "justify-end"
                  : msg.role === "assistant"
                  ? "justify-start"
                  : "justify-center"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-2xl text-sm shadow-sm m-2 ${
                  msg.role === "user"
                    ? `bg-black text-white ${serifFont.className} rounded-br-none max-w-[80%]`
                    : msg.role === "assistant"
                    ? `bg-gray-900 text-white ${serifFont.className} rounded-bl-none whitespace-pre-wrap overflow-x-auto max-w-[80%]`
                    : `text-black italic ${serifFont.className} border border-black text-md`
                }`}
              >
                {msg.role === "system" ? (
                  msg.content
                ) : (
                  <>
                    <b>
                      {msg.role === "user"
                        ? "You"
                        : msg.role === "assistant"
                        ? "Mistral AI"
                        : "System"}
                      :
                    </b>{" "}
                    {msg.content}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input section */}
        <div className="max-w-full mt-5 flex items-center space-x-2 rounded-2xl">
          {/* <textarea
          rows={3}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          placeholder="Type your message..."
          className="w-full px-4 py-2 border border-black rounded-2xl resize-none placeholder-black text-black "
          
        /> */}
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className={`h-[50px] border-2 border-black rounded-md text-black placeholder:text-black ${serifFont.className}`}
          />

          {/* <SendHorizonal className="w-8 h-8 text-black" /> */}
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className={`flex items-center justify-center w-[50px] h-[50px] rounded-lg font-medium 
    ${
      loading || !input.trim()
        ? "bg-black cursor-not-allowed text-white"
        : "bg-[#F98516] cursor-pointer text-black"
    }`}
            aria-label="Send message"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <SendHorizontal className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
