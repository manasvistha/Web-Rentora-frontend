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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const userId = String(user?.id || user?._id || "");
    console.log("Current User ID:", userId);
    setCurrentUserId(userId);

    const load = async () => {
      try {
        const data = await getConversations();
        console.log("Conversations data:", data);
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
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Link href="/dashboard" style={{ color: '#4f46e5', textDecoration: 'none', fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          ← Back to Dashboard
        </Link>
        <h1 style={{ marginTop: 8, marginBottom: 6, fontSize: '1.75rem', fontWeight: 700, color: '#0f172a' }}>Messages</h1>
        <p style={{ color: '#64748b', marginBottom: 24, fontSize: '0.9375rem' }}>Your conversations with property owners and tenants</p>

        {loading ? (
          <div style={{ background: '#fff', padding: 32, borderRadius: 14, textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ color: '#64748b', margin: 0 }}>Loading conversations...</p>
          </div>
        ) : error ? (
          <div style={{ padding: 16, background: '#fee2e2', color: '#991b1b', borderRadius: 12, border: '1px solid #fecaca' }}>{error}</div>
        ) : conversations.length === 0 ? (
          <div style={{ background: '#fff', padding: 48, borderRadius: 14, textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>💬</div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a', margin: '0 0 6px' }}>No messages yet</h2>
            <p style={{ color: '#64748b', margin: 0 }}>Start a conversation by messaging a property owner.</p>
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            {conversations.map((c, index) => {
              console.log("Conversation participants:", c.participants, "Current user:", currentUserId);
              
              const other = c.participants.find((participant) => {
                const pId = String(participant?._id || (participant as any)?.id || '');
                console.log("Comparing participant ID:", pId, "with current user:", currentUserId);
                return pId && currentUserId && pId !== currentUserId;
              });
              
              // If we couldn't find the other participant, just take the first one that's not us
              const displayParticipant = other || c.participants.find(p => {
                const pId = String(p?._id || (p as any)?.id || '');
                return pId !== currentUserId;
              }) || c.participants[0];
              
              console.log("Selected participant to display:", displayParticipant);
              
              const otherName = displayParticipant?.name || displayParticipant?.email?.split('@')[0] || 'User';
              const avatarInitial = otherName.charAt(0).toUpperCase();
              const hasMessages = c.lastMessage && c.lastMessage !== 'No messages yet';
              
              const timeAgo = (date: string) => {
                const now = new Date();
                const then = new Date(date);
                const diffMs = now.getTime() - then.getTime();
                const diffMins = Math.floor(diffMs / 60000);
                const diffHours = Math.floor(diffMs / 3600000);
                const diffDays = Math.floor(diffMs / 86400000);
                
                if (diffMins < 1) return 'Just now';
                if (diffMins < 60) return `${diffMins}m ago`;
                if (diffHours < 24) return `${diffHours}h ago`;
                if (diffDays < 7) return `${diffDays}d ago`;
                return then.toLocaleDateString();
              };
              
              return (
                <Link 
                  key={c._id} 
                  href={`/conversation/${c._id}`}
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '16px 18px', 
                    borderBottom: index < conversations.length - 1 ? '1px solid #f1f5f9' : 'none',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.transform = 'translateX(2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  {/* Avatar */}
                  <div style={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                  }}>
                    {avatarInitial}
                  </div>
                  
                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9375rem' }}>
                        {otherName}
                      </div>
                      {c.lastMessageTime && (
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 500 }}>
                          {timeAgo(c.lastMessageTime)}
                        </div>
                      )}
                    </div>
                    <div style={{ 
                      fontSize: '0.8125rem', 
                      color: hasMessages ? '#64748b' : '#9ca3af',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontStyle: hasMessages ? 'normal' : 'italic'
                    }}>
                      {c.lastMessage || 'No messages yet'}
                    </div>
                  </div>
                  
                  {/* Unread indicator */}
                  {hasMessages && (
                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#4f46e5',
                      flexShrink: 0
                    }} />
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}