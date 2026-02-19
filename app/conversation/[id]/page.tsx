"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { getConversation, sendMessage } from "@/lib/api/conversation";
import { getCurrentUser } from "@/lib/utils/auth-utils";

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const convId = params.id as string;
  const [conversation, setConversation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const load = async () => {
      try {
        const data = await getConversation(convId);
        setConversation(data);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      } catch (err: any) {
        setError(err?.response?.data?.error || err?.message || 'Failed to load conversation');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [convId, router]);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      const data = await sendMessage(convId, text.trim());
      setConversation(data);
      setText("");
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (err: any) {
      alert(err?.response?.data?.error || err?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: 20 }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <button onClick={() => router.back()} style={{ color: '#4f46e5', background: 'none', border: 'none', padding: 0 }}>← Back</button>
        {loading && <div style={{ padding: 20, background: '#fff' }}>Loading...</div>}
        {error && <div style={{ padding: 12, background: '#fee2e2', color: '#991b1b' }}>{error}</div>}
        {!loading && !error && conversation && (
          <div style={{ marginTop: 12, background: '#fff', borderRadius: 8, padding: 12, border: '1px solid #e6eefb', display: 'flex', flexDirection: 'column', height: '70vh' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
              {conversation.messages.length === 0 && <div style={{ color: '#64748b' }}>No messages yet. Say hello!</div>}
              {conversation.messages.map((m: any, idx: number) => {
                const mine = (m.sender?._id || m.sender) === getCurrentUser()?.id;
                return (
                  <div key={idx} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
                    <div style={{ maxWidth: '70%', background: mine ? '#4f46e5' : '#f1f5f9', color: mine ? '#fff' : '#0f172a', padding: '8px 12px', borderRadius: 10 }}>
                      <div style={{ fontSize: 14 }}>{m.content}</div>
                      <div style={{ fontSize: 11, color: mine ? 'rgba(255,255,255,0.7)' : '#6b7280', marginTop: 6 }}>{new Date(m.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', padding: 8, display: 'flex', gap: 8 }}>
              <input value={text} onChange={e => setText(e.target.value)} placeholder="Write a message..." style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #e6eefb' }} />
              <button disabled={sending} onClick={handleSend} style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 14px', cursor: 'pointer' }}>{sending ? 'Sending…' : 'Send'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}