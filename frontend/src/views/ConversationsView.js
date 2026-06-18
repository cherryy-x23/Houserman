import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useSession } from '../store/SessionContext';
import { chatService } from '../services/api';
import { timeSince } from '../services/helpers';
import { toast } from 'react-toastify';
import { FiSend, FiMessageSquare, FiArrowLeft } from 'react-icons/fi';

let socketRef = null;

export default function ConversationsView() {
  const { threadTag } = useParams();
  const navigate = useNavigate();
  const { account } = useSession();
  const [threads, setThreads] = useState([]);
  const [lines, setLines] = useState([]);
  const [text, setText] = useState('');
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingLines, setLoadingLines] = useState(false);
  const [peerTyping, setPeerTyping] = useState(false);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  useEffect(() => {
    if (!account) return;
    socketRef = io(process.env.REACT_APP_SOCKET_BASE || 'http://localhost:4500', { transports: ['websocket', 'polling'] });
    socketRef.on('connect', () => socketRef.emit('account_online', account._id));
    socketRef.on('chat_line_arrived', (line) => {
      setLines((prev) => prev.find((l) => l._id === line._id) ? prev : [...prev, line]);
    });
    socketRef.on('peer_typing', () => setPeerTyping(true));
    socketRef.on('peer_stop_typing', () => setPeerTyping(false));
    return () => socketRef?.disconnect();
  }, [account]);

  const loadThreads = () => {
    chatService.fetchThreads().then((res) => setThreads(res.data.threads)).catch(() => {}).finally(() => setLoadingThreads(false));
  };

  useEffect(() => { loadThreads(); }, []);

  useEffect(() => {
    if (!threadTag || !socketRef) return;
    socketRef.emit('join_thread', threadTag);
    setLoadingLines(true);
    chatService.fetchLines(threadTag)
      .then((res) => setLines(res.data.lines))
      .catch(() => toast.error('Failed to load conversation'))
      .finally(() => setLoadingLines(false));
    return () => socketRef?.emit('leave_thread', threadTag);
  }, [threadTag]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [lines]);

  const currentThread = threads.find((t) => t._id === threadTag);
  const peer = currentThread?.otherAccount;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !threadTag) return;
    const parts = threadTag.split('_');
    const toUser = parts[0] === account._id ? parts[1] : parts[0];
    try {
      const res = await chatService.send({ toUser, text: text.trim(), threadTag });
      setLines((prev) => [...prev, res.data.line]);
      socketRef?.emit('thread_stop_typing', { threadTag });
      setText('');
      loadThreads();
    } catch { toast.error('Failed to send'); }
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    socketRef?.emit('thread_typing', { threadTag, accountId: account._id });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => socketRef?.emit('thread_stop_typing', { threadTag }), 1400);
  };

  return (
    <div className="hr-panel" style={{ display: 'flex', height: 'calc(100vh - 160px)', minHeight: 480, padding: 0, overflow: 'hidden' }}>
      {/* Threads list */}
      <div style={{ width: 280, borderRight: '1px solid var(--line)', display: threadTag ? 'none' : 'flex', flexDirection: 'column' }} className="hr-thread-list">
        <div style={{ padding: 16, borderBottom: '1px solid var(--line)', fontWeight: 700 }}>Conversations</div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loadingThreads ? <div style={{ padding: 20, textAlign: 'center' }}><div className="hr-spin" /></div> :
            threads.length === 0 ? <div className="hr-empty" style={{ padding: 30 }}><FiMessageSquare size={28} /><p>No conversations yet</p></div> :
            threads.map((t) => (
              <button key={t._id} onClick={() => navigate(`/conversations/${t._id}`)}
                style={{ display: 'flex', width: '100%', textAlign: 'left', gap: 10, padding: 14, border: 'none', background: threadTag === t._id ? 'var(--brand-soft)' : 'transparent' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--brand-soft)', color: 'var(--brand-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {t.otherAccount?.fullName?.[0]?.toUpperCase() || '?'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 13 }}>{t.otherAccount?.fullName}</p>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-soft)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.lastLine?.text}</p>
                </div>
                {t.unseenCount > 0 && <span style={{ background: 'var(--coral)', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t.unseenCount}</span>}
              </button>
            ))}
        </div>
      </div>

      {/* Chat window */}
      <div style={{ flex: 1, display: threadTag ? 'flex' : 'none', flexDirection: 'column' }} className="hr-chat-window">
        {!threadTag ? (
          <div className="hr-empty" style={{ margin: 'auto' }}><FiMessageSquare size={32} /><p>Select a conversation</p></div>
        ) : (
          <>
            <div style={{ padding: 14, borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={() => navigate('/conversations')} style={{ background: 'none', border: 'none', display: 'none' }} className="hr-back-mobile"><FiArrowLeft /></button>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--brand-soft)', color: 'var(--brand-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>
                {peer?.fullName?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{peer?.fullName || 'Conversation'}</p>
                {peerTyping && <p style={{ margin: 0, fontSize: 11, color: 'var(--brand)' }}>typing...</p>}
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {loadingLines ? <div className="hr-spin" style={{ margin: '20px auto' }} /> :
                lines.length === 0 ? <p style={{ textAlign: 'center', color: 'var(--ink-soft)', fontSize: 13 }}>No messages yet. Say hello!</p> :
                lines.map((l, i) => {
                  const mine = (l.fromUser?._id || l.fromUser) === account._id;
                  return (
                    <div key={l._id || i} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                      <div style={{ maxWidth: '70%' }}>
                        <div style={{
                          padding: '9px 14px', borderRadius: 16, fontSize: 13.5,
                          background: mine ? 'var(--brand)' : 'var(--paper)',
                          color: mine ? 'white' : 'var(--ink)',
                          borderBottomRightRadius: mine ? 4 : 16,
                          borderBottomLeftRadius: mine ? 16 : 4,
                        }}>{l.text}</div>
                        <p style={{ fontSize: 10, color: 'var(--ink-soft)', margin: '3px 4px 0', textAlign: mine ? 'right' : 'left' }}>{timeSince(l.createdAt)}</p>
                      </div>
                    </div>
                  );
                })}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} style={{ display: 'flex', gap: 10, padding: 14, borderTop: '1px solid var(--line)' }}>
              <input className="hr-field" placeholder="Type a message..." value={text} onChange={handleTyping} autoFocus />
              <button type="submit" disabled={!text.trim()} className="hr-pill-btn primary" style={{ padding: '0 18px', display: 'flex', alignItems: 'center' }}>
                <FiSend />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
