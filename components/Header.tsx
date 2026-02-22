// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { getCurrentUser, getImageUrl } from "@/lib/utils/auth-utils";
// import { getProfile } from "@/lib/api/auth";
// import { getNotifications, markNotificationRead, markAllNotificationsRead, NotificationItem } from "@/lib/api/notification";
// import { handleLogout } from "@/lib/actions/auth-actions";

// export default function Header() {
//   const [user, setUser] = useState<any>(null);
//   const [notifications, setNotifications] = useState<NotificationItem[]>([]);
//   const [showNotifications, setShowNotifications] = useState(false);
//   const [showProfileMenu, setShowProfileMenu] = useState(false);

//   useEffect(() => {
//     const hydrate = async () => {
//       const cookieUser = getCurrentUser();
//       if (!cookieUser) return;
//       setUser(cookieUser);
//       try {
//         const profileRes = await getProfile();
//         const payload = profileRes?.data || profileRes?.user || profileRes;
//         setUser(payload || cookieUser);
//       } catch (e) {
//         // ignore
//       }

//       try {
//         const notRes = await getNotifications(1, 20);
//         setNotifications(notRes?.data || []);
//       } catch (e) {}
//     };
//     void hydrate();
//   }, []);

//   const handleMarkRead = async (id: string) => {
//     try {
//       await markNotificationRead(id);
//       setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
//     } catch {}
//   };

//   const handleMarkAllRead = async () => {
//     try {
//       await markAllNotificationsRead();
//       setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
//     } catch {}
//   };

//   const onLogout = async () => {
//     setShowProfileMenu(false);
//     const result = await handleLogout();
//     if (result?.success) window.location.href = '/login';
//   };

//   const avatar = user?.profilePicture ? getImageUrl(user.profilePicture) : '/avatar-placeholder.png';
//   const name = user?.name || user?.email || 'User';
//   const email = user?.email || '';

//   return (
//     <header style={{ background: "#fff", borderBottom: "1px solid #f0f0f0", position: "sticky", top: 0, zIndex: 50 }}>
//       <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 62 }}>
//         <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
//           <img src="/Logo.png" alt="Rentora" style={{ height: 32, width: "auto" }} />
//           <span style={{ fontSize: "1.0625rem", fontWeight: 700, color: "#4f46e5", letterSpacing: "-0.02em" }}>Rentora</span>
//         </Link>

//         <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//           <div style={{ position: "relative" }}>
//             <button
//               onClick={(e) => { e.stopPropagation(); setShowNotifications(s => !s); setShowProfileMenu(false); }}
//               style={{
//                 position: 'relative', width: 40, height: 40, borderRadius: '50%', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
//               }}
//               aria-label="Notifications"
//             >
//               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                 <path d="M18 8A6 6 0 1 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
//                 <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
//               </svg>
//               {notifications.filter(n => !n.isRead).length > 0 && (
//                 <span style={{ position: 'absolute', top: -2, right: -2, minWidth: 18, height: 18, background: '#ef4444', color: '#fff', fontSize: 11, fontWeight: 600, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
//                   {notifications.filter(n => !n.isRead).length}
//                 </span>
//               )}
//             </button>

//             {showNotifications && (
//               <>
//                 <div style={{ position: 'fixed', inset: 0, zIndex: 55 }} onClick={() => setShowNotifications(false)} />
//                 <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 340, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 20px 40px rgba(0,0,0,0.12)', zIndex: 1000, overflow: 'hidden' }}>
//                   <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//                     <span style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>Notifications</span>
//                     <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                       {notifications.filter(n => !n.isRead).length > 0 && (
//                         <button onClick={handleMarkAllRead} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4f46e5', fontSize: 12, fontWeight: 600, padding: '4px 8px', borderRadius: 6 }}>Mark all read</button>
//                       )}
//                       <span style={{ fontSize: 12, color: '#6b7280' }}>{notifications.filter(n => !n.isRead).length} unread</span>
//                       <button onClick={() => setShowNotifications(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}>
//                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
//                       </button>
//                     </div>
//                   </div>
//                   <div style={{ maxHeight: 340, overflow: 'auto' }}>
//                     {notifications.length === 0 && (
//                       <div style={{ padding: 32, textAlign: 'center' }}>
//                         <div style={{ color: '#6b7280', fontSize: 13 }}>No notifications yet</div>
//                       </div>
//                     )}
//                     {notifications.map(n => (
//                       <div key={n._id} style={{ padding: '12px 16px', borderBottom: '1px solid #f8fafc', background: n.isRead ? '#fff' : '#fafbff', cursor: 'pointer' }} onClick={async () => { try { await handleMarkRead(n._id); } catch (err) {} }}>
//                         <div style={{ fontSize: 13, color: '#111827', fontWeight: n.isRead ? 400 : 600, marginBottom: 4 }}>{n.message}</div>
//                         <div style={{ fontSize: 12, color: '#9ca3af' }}>{new Date(n.createdAt).toLocaleString()}</div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </>
//             )}
//           </div>

//           <div style={{ width: 1, height: 22, background: "#ebebeb" }} />

//           <div style={{ position: "relative" }}>
//             <button onClick={() => { setShowProfileMenu(p => !p); setShowNotifications(false); }}
//               style={{ display: "flex", alignItems: "center", gap: 9, padding: "5px 12px 5px 5px", borderRadius: "10px", border: "1px solid #ebebeb", background: "#fff", cursor: "pointer" }}>
//               <img src={avatar} alt={name} style={{ width: 28, height: 28, borderRadius: "8px", objectFit: "cover" }} />
//               <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#0f172a" }}>{name.split(" ")[0]}</span>
//               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform 0.2s", transform: showProfileMenu ? "rotate(180deg)" : "none" }}>
//                 <path d="M6 9l6 6 6-6"/>
//               </svg>
//             </button>
//             {showProfileMenu && (
//               <>
//                 <div style={{ position: "fixed", inset: 0, zIndex: 55 }} onClick={() => setShowProfileMenu(false)} />
//                 <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 220, background: "#fff", borderRadius: 14, border: "1px solid #ebebeb", boxShadow: "0 16px 40px -8px rgba(0,0,0,0.12)", zIndex: 60, overflow: "hidden" }}>
//                   <div style={{ padding: "14px 16px", borderBottom: "1px solid #f4f4f5", background: "#fafafa" }}>
//                     <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "#0f172a", margin: "0 0 2px" }}>{name}</p>
//                     <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: 0 }}>{email}</p>
//                   </div>
//                   <div style={{ padding: 6 }}>
//                     <Link href="/user/profile" onClick={() => setShowProfileMenu(false)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", fontSize: "0.8125rem", color: "#334155", textDecoration: "none", borderRadius: 8 }}>My Profile</Link>
//                     <button onClick={onLogout} style={{ width: '100%', marginTop: 6, padding: '9px 12px', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Logout</button>
//                   </div>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }
