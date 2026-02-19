"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getConversations, Conversation } from "@/lib/api/conversation";
import { getCurrentUser } from "@/lib/utils/auth-utils";

export default function ConversationsPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const load = async () => {
      try {
        const data = await getConversations();
        setConversations(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err?.message || 'Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: 24 }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <Link href="/dashboard" style={{ color: '#4f46e5', textDecoration: 'none' }}>← Back</Link>
        <h1 style={{ marginTop: 8 }}>Conversations</h1>

        {loading && <div style={{ padding: 16, background: '#fff' }}>Loading...</div>}
        {error && <div style={{ padding: 12, background: '#fee2e2', color: '#991b1b' }}>{error}</div>}

        {!loading && !error && (
          <div style={{ marginTop: 12, background: '#fff', borderRadius: 8, overflow: 'hidden', border: '1px solid #e6eefb' }}>
            {conversations.length === 0 ? (
              <div style={{ padding: 20, color: '#64748b' }}>No conversations yet. Message a property owner to start chatting.</div>
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {conversations.map(c => {
                  const other = c.participants[0];
                  return (
                    <li key={c._id} style={{ padding: 12, borderBottom: '1px solid #f1f5f9' }}>
                      <Link href={`/conversation/${c._id}`} style={{ textDecoration: 'none', color: '#0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{other?.name || other?.email || 'User'}</div>
                          <div style={{ fontSize: 13, color: '#64748b' }}>{c.lastMessage || 'No messages yet'}</div>
                        </div>
                        <div style={{ fontSize: 12, color: '#9ca3af' }}>{c.lastMessageTime ? new Date(c.lastMessageTime).toLocaleString() : ''}</div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}