import { useState } from 'react';

export default function ChatBox() {
  const [messages, setMessages] = useState([
    { role: 'system', content: 'You are chatting with Mistral AI.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: updatedMessages })
    });

    const data = await response.json();
    if (response.ok) {
      setMessages([...updatedMessages, { role: 'assistant', content: data.reply }]);
    } else {
      setMessages([...updatedMessages, { role: 'assistant', content: 'Error from AI API' }]);
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <div style={{ minHeight: 300, border: '1px solid #ccc', padding: 10, overflowY: 'auto' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ margin: '10px 0' }}>
            <b>{msg.role === 'user' ? 'You' : msg.role === 'assistant' ? 'Mistral AI' : 'System'}:</b> {msg.content}
          </div>
        ))}
      </div>
      <textarea
        rows={3}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={loading}
        style={{ width: '100%', marginTop: 10 }}
        placeholder="Type your message..."
      />
      <button onClick={sendMessage} disabled={loading || !input.trim()} style={{ marginTop: 10 }}>
        {loading ? 'Sending...' : 'Send'}
      </button>
    </div>
  );
}
