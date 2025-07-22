import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaPaperPlane, FaCheck, FaCheckDouble, FaImage, FaBars, FaArrowLeft, FaGlobe, FaShareAlt } from 'react-icons/fa';
import io from 'socket.io-client';
import axiosInstance from '../api/axiosConfig';
import { incrementUnreadForConversation, clearUnreadForConversation, setChatUnreadCounts } from '../redux/slices/uiSlice';
import { toast } from 'react-toastify';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { translateText } from '../utils/translate';

const SOCKET_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

// /*
// .animate-slide-in-right-slow {
//   animation: slideInRightSlow 0.5s cubic-bezier(0.4,0,0.2,1) both;
// }
// @keyframes slideInRightSlow {
//   from { transform: translateX(100%); }
//   to { transform: translateX(0); }
// }
// */

const Chat = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const socketRef = useRef();
  const messagesEndRef = useRef();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sellerId = searchParams.get('sellerId');
  const { chatUnreadCounts } = useSelector((state) => state.ui);
  const [lastMessages, setLastMessages] = useState({});
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [otherTypingName, setOtherTypingName] = useState('');
  const typingTimeout = useRef();
  const chatBodyRef = useRef();
  const [isTranslationActive, setIsTranslationActive] = useState(() => {
    const saved = localStorage.getItem('isTranslationActive');
    return saved !== null ? saved === 'true' : false;
  });
  const [targetLanguage, setTargetLanguage] = useState(() => {
    return localStorage.getItem('targetLanguage') || 'zh';
  });
  const [autoTranslateIncoming, setAutoTranslateIncoming] = useState(() => {
    const saved = localStorage.getItem('autoTranslateIncoming');
    return saved !== null ? saved === 'true' : false;
  });
  const [incomingLang, setIncomingLang] = useState(() => {
    return localStorage.getItem('incomingLang') || 'en';
  });
  const [translatedMessages, setTranslatedMessages] = useState({}); // {msgId: translatedText}
  const [loadingTranslations, setLoadingTranslations] = useState({}); // {msgId: boolean}
  const languageOptions = [
    { code: 'en', label: 'English' },
    { code: 'zh', label: 'Chinese' },
    { code: 'hi', label: 'Hindi' },
    { code: 'es', label: 'Spanish' },
    { code: 'fr', label: 'French' },
  ];
  const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 768); // Show sidebar by default on md+
  const [showDeleteClue, setShowDeleteClue] = useState(true);
  const [deleteMsgId, setDeleteMsgId] = useState(null); // message id for delete menu
  const [deleteConvId, setDeleteConvId] = useState(null); // conversation id for delete menu
  const [showTranslateDrawer, setShowTranslateDrawer] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  // Fetch users and conversations (with unread counts) from backend
  const fetchConversationsAndUnread = async () => {
    if (!user) return;
    const usersRes = await axiosInstance.get('/chat/users');
    setUsers(usersRes.data);
    const convRes = await axiosInstance.get('/chat/conversations');
    if (convRes.data.conversations && convRes.data.unreadCounts) {
      setConversations(convRes.data.conversations);
      dispatch(setChatUnreadCounts(convRes.data.unreadCounts || {}));
      if (convRes.data.lastMessages) setLastMessages(convRes.data.lastMessages);
    } else {
      setConversations(convRes.data);
    }
  };

  useEffect(() => {
    fetchConversationsAndUnread();
    // eslint-disable-next-line
  }, [user]);

  // Connect to socket.io
  useEffect(() => {
    if (!user || !user._id) return;
    socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current.emit('join', user._id);

    // Listen for unread count updates from server
    socketRef.current.on('unreadCountsUpdate', (unreadCounts) => {
      dispatch(setChatUnreadCounts(unreadCounts));
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [user, dispatch]);

  // Auto-start or open conversation with sellerId from URL
  useEffect(() => {
    if (!user || !user._id || !sellerId || !users.length) return;
    const existingConv = conversations.find(conv =>
      conv.participants?.some(p => p._id === sellerId)
    );
    if (existingConv) {
      openConversation(existingConv);
    } else {
      startConversation(sellerId);
    }
    // eslint-disable-next-line
  }, [user, sellerId, users, conversations]);

  // Join conversation and fetch messages
  const openConversation = async (conv) => {
    setSelectedConversation(conv);
    const res = await axiosInstance.get(`/chat/messages/${conv._id}`);
    setMessages(res.data);
    socketRef.current.emit('joinConversation', conv._id);
    dispatch(clearUnreadForConversation(conv._id));
  };

  // Mark as read when tab is focused and a conversation is open
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && selectedConversation && selectedConversation._id && user && user._id) {
        socketRef.current.emit('markAsRead', {
          conversationId: selectedConversation._id,
          userId: user._id
        });
        openConversation(selectedConversation);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [selectedConversation, user]);

  // Desktop notification for new messages
  useEffect(() => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Listen for incoming messages
  useEffect(() => {
    if (!user || !user._id) return;
    const handler = (msg) => {
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c._id === msg.conversationId);
        if (idx === -1) return prev;
        const conv = prev[idx];
        const newConvs = [conv, ...prev.slice(0, idx), ...prev.slice(idx + 1)];
        return newConvs;
      });
      if (selectedConversation && selectedConversation._id && msg.conversationId === selectedConversation._id) {
        setMessages((prev) => {
          // Remove any pending message with same text, sender, and fileUrl
          const filtered = prev.filter(m => {
            if (!m.pending) return true;
            if (m.sender?._id !== msg.senderId) return true;
            if (m.text !== msg.text) return true;
            if ((m.fileUrl || null) !== (msg.fileUrl || null)) return true;
            return false; // remove this pending message
          });
          return [...filtered, { ...msg, sender: { _id: msg.senderId, name: msg.senderName } }];
        });
        dispatch(clearUnreadForConversation(msg.conversationId));
      } else {
        if (msg.senderId !== user._id) {
          dispatch(incrementUnreadForConversation(msg.conversationId));
          if (document.visibilityState !== 'visible' || !selectedConversation || selectedConversation._id !== msg.conversationId) {
            if (Notification.permission === 'granted') {
              new Notification('New message', {
                body: msg.text || 'You have a new message',
                icon: '/favicon.ico'
              });
            }
          }
        }
        toast.info('New message received!');
      }
    };
    socketRef.current.on('receiveMessage', handler);
    return () => socketRef.current.off('receiveMessage', handler);
  }, [selectedConversation, dispatch, user]);

  // Listen for typing events
  useEffect(() => {
    if (!socketRef.current) return;
    socketRef.current.on('typing', ({ conversationId, userId, userName }) => {
      if (selectedConversation && selectedConversation._id && conversationId === selectedConversation._id && user && user._id && userId !== user._id) {
        setIsOtherTyping(true);
        setOtherTypingName(userName || 'Someone');
      }
    });
    socketRef.current.on('stopTyping', ({ conversationId, userId }) => {
      if (selectedConversation && selectedConversation._id && conversationId === selectedConversation._id && user && user._id && userId !== user._id) {
        setIsOtherTyping(false);
        setOtherTypingName('');
      }
    });
    return () => {
      socketRef.current.off('typing');
      socketRef.current.off('stopTyping');
    };
  }, [selectedConversation, user]);

  // Typing event handler
  const handleInputChange = (e) => {
    setMessage(e.target.value);
    if (!selectedConversation || !selectedConversation._id || !user || !user._id) return;
    socketRef.current.emit('typing', {
      conversationId: selectedConversation._id,
      userId: user._id,
      userName: user.name
    });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socketRef.current.emit('stopTyping', {
        conversationId: selectedConversation._id,
        userId: user._id
      });
    }, 1200);
  };

  // Scroll to bottom only if user is already at the bottom
  const scrollToBottom = (force = false) => {
    if (!chatBodyRef.current) return;
    const container = chatBodyRef.current;
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    if (isAtBottom || force) {
      container.scrollTop = container.scrollHeight;
    }
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Start new conversation
  const startConversation = async (userId) => {
    if (!user || !user._id) return;
          const res = await axiosInstance.post('/chat/conversations', { userId });
    setConversations((prev) => {
      if (prev.find((c) => c._id === res.data._id)) return prev;
      return [res.data, ...prev];
    });
    if (!conversations.find((c) => c._id === res.data._id)) {
      openConversation(res.data);
    } else {
      const existing = conversations.find((c) => c._id === res.data._id);
      if (existing) openConversation(existing);
    }
  };

  // After sending a message, force scroll to bottom
  const sendMessage = async (e) => {
    e.preventDefault();
    if ((!message.trim() && !file) || !selectedConversation || !selectedConversation._id || !user || !user._id) return;
    let fileUrl = null;
    let fileType = null;
    let finalMessage = message;
    if (isTranslationActive && message.trim()) {
      try {
        console.log('Translating:', message, 'to', targetLanguage);
        finalMessage = await translateText(message, targetLanguage);
        console.log('Translated:', finalMessage);
      } catch (err) {
        toast.error('Translation failed. Sending original message.');
        finalMessage = message;
      }
    }
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await axiosInstance.post('/chat/upload', formData);
      fileUrl = uploadRes.data.fileUrl;
      fileType = uploadRes.data.fileType;
    }
    // Optimistically add message to UI
    const tempId = 'temp-' + Date.now();
    setMessages((prev) => [
      ...prev,
      {
        _id: tempId,
        conversation: selectedConversation._id,
        sender: { _id: user._id, name: user.name },
        text: finalMessage,
        fileUrl,
        fileType,
        createdAt: new Date().toISOString(),
        pending: true,
      },
    ]);
    await axiosInstance.post('/chat/messages', {
      conversationId: selectedConversation._id,
      text: finalMessage,
      fileUrl,
      fileType
    });
    socketRef.current.emit('sendMessage', {
      conversationId: selectedConversation._id,
      senderId: user._id,
      text: finalMessage,
      fileUrl,
      fileType
    });
    setMessage('');
    setFile(null);
    setTimeout(() => scrollToBottom(true), 100);
  };

  // Effect to auto-translate incoming messages when needed
  useEffect(() => {
    if (!autoTranslateIncoming || !selectedConversation) return;
    const untranslated = messages.filter(
      (msg, idx) => {
        const isMe = msg.sender?._id === user?._id;
        const msgId = msg._id || idx;
        return !isMe && msg.text && !translatedMessages[msgId] && !loadingTranslations[msgId];
      }
    );
    if (untranslated.length === 0) return;
    untranslated.forEach((msg, idx) => {
      const msgId = msg._id || messages.indexOf(msg);
      setLoadingTranslations(prev => ({ ...prev, [msgId]: true }));
      translateText(msg.text, incomingLang)
        .then(t => {
          setTranslatedMessages(prev => ({ ...prev, [msgId]: t }));
        })
        .catch(() => {
          setTranslatedMessages(prev => ({ ...prev, [msgId]: null }));
        })
        .finally(() => {
          setLoadingTranslations(prev => ({ ...prev, [msgId]: false }));
        });
    });
  }, [autoTranslateIncoming, incomingLang, messages, selectedConversation, translatedMessages, loadingTranslations, user?._id]);

  // Responsive: update showSidebar on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setShowSidebar(false);
      } else {
        setShowSidebar(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // When a conversation is opened on mobile, hide sidebar
  useEffect(() => {
    if (window.innerWidth < 768 && selectedConversation) {
      setShowSidebar(false);
    }
  }, [selectedConversation]);

  // When back is pressed, clear selectedConversation
  const handleBack = () => {
    setSelectedConversation(null);
    if (window.innerWidth < 768) setShowSidebar(true);
  };

  // Save auto-translate settings to localStorage when changed
  useEffect(() => {
    localStorage.setItem('autoTranslateIncoming', autoTranslateIncoming);
  }, [autoTranslateIncoming]);
  useEffect(() => {
    localStorage.setItem('incomingLang', incomingLang);
  }, [incomingLang]);
  useEffect(() => {
    localStorage.setItem('isTranslationActive', isTranslationActive);
  }, [isTranslationActive]);
  useEffect(() => {
    localStorage.setItem('targetLanguage', targetLanguage);
  }, [targetLanguage]);

  // Show clue on conversation open/change
  useEffect(() => {
    setShowDeleteClue(true);
    const timer = setTimeout(() => setShowDeleteClue(false), 4000);
    return () => clearTimeout(timer);
  }, [selectedConversation?._id]);

  // Hide clue on user interaction
  const hideClue = () => setShowDeleteClue(false);

  // Delete message API call (placeholder)
  const handleDeleteMessage = async (msgId) => {
    try {
      await axiosInstance.delete(`/chat/messages/${msgId}`);
      setMessages((prev) => prev.filter((m) => m._id !== msgId));
      setDeleteMsgId(null);
    } catch (err) {
      toast.error('Failed to delete message');
    }
  };

  // Delete conversation API call (placeholder)
  const handleDeleteConversation = async (convId) => {
    try {
      await axiosInstance.delete(`/chat/conversations/${convId}`);
      setConversations((prev) => prev.filter((c) => c._id !== convId));
      if (selectedConversation?._id === convId) setSelectedConversation(null);
      setDeleteConvId(null);
    } catch (err) {
      toast.error('Failed to delete conversation');
    }
  };

  const handleDrawerTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };
  const handleDrawerTouchMove = (e) => {
    setTouchEndX(e.touches[0].clientX);
  };
  const handleDrawerTouchEnd = () => {
    if (touchStartX !== null && touchEndX !== null && touchEndX - touchStartX > 60) {
      setShowTranslateDrawer(false);
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  // Redirect to login if sellerId is present and user is not logged in
  useEffect(() => {
    if (sellerId && !user) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
    }
  }, [sellerId, user, navigate]);

  if (!user) return <div className="flex items-center justify-center h-full text-gray-500 text-lg">Please log in to use chat.</div>;

  return (
    <div className="flex flex-col items-center justify-center w-full h-[calc(100vh-56px)] md:h-[calc(100vh-64px)] bg-gradient-to-br from-blue-100 via-white to-purple-100">
      <div className="flex flex-1 w-full h-full max-w-4xl md:max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 mt-0 md:mt-6 mb-0 md:mb-6 relative">
        {/* Sidebar as drawer on mobile, as column on desktop */}
        <div
          className={`fixed inset-0 z-30 md:static md:z-auto md:h-full md:w-80 md:relative md:block transition-transform duration-300 ${showSidebar ? 'translate-x-0' : '-translate-x-full'} bg-white/90 md:bg-white flex flex-col md:border-r shadow-lg md:shadow-none p-3 md:p-4`}
          style={{ minWidth: '220px', maxWidth: '90vw' }}
        >
          <div className="md:hidden flex justify-end mb-2 pt-2 pr-2">
            <button onClick={() => { setShowSidebar(false); hideClue(); }} className="text-2xl p-2 text-primary-700"><FaArrowLeft /></button>
          </div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-extrabold text-primary-700 tracking-tight">Chats</h2>
            <div className="flex items-center gap-2">
              {(user?.role === 'seller' || user?.role === 'admin') && (
                <button
                  onClick={async () => {
                    const link = `${window.location.origin}/chat?sellerId=${user._id}`;
                    await navigator.clipboard.writeText(link);
                    toast.success('Share link copied! Anyone can use it to start a chat with you.');
                  }}
                  className="text-primary-700 bg-primary-100 hover:bg-primary-200 rounded p-2 text-base shadow-sm"
                  title="Share conversation link"
                >
                  <FaShareAlt />
                </button>
              )}
              <button onClick={() => { fetchConversationsAndUnread(); hideClue(); }} className="text-xs px-2 py-1 rounded bg-primary-100 hover:bg-primary-200 text-primary-700 font-semibold shadow-sm">Refresh</button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto pr-1">
            <h3 className="font-semibold text-gray-700 mb-2 text-xs uppercase tracking-wider">Conversations</h3>
            {conversations.length === 0 && <div className="text-gray-400">No conversations yet</div>}
            {conversations.map((conv) => {
              const other = conv.participants?.find((p) => p._id !== user?._id);
              const unread = chatUnreadCounts?.[conv._id] || 0;
              const lastMsg = lastMessages?.[conv._id];
              return (
                <div key={conv._id} className="relative">
                  <button
                    className={`w-full flex items-center gap-2 px-2 py-2 rounded-xl mb-1 transition group shadow-sm border border-transparent ${selectedConversation?._id === conv._id ? 'bg-primary-50 border-primary-200' : 'hover:bg-primary-50'}`}
                    onClick={() => { openConversation(conv); if (window.innerWidth < 768) setShowSidebar(false); hideClue(); }}
                    onDoubleClick={() => setDeleteConvId(conv._id)}
                    title="Double-click to delete conversation"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-200 to-primary-400 flex items-center justify-center text-primary-800 font-bold text-lg group-hover:scale-105 transition">
                      {other?.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex flex-col items-start w-36">
                      <span className="font-semibold text-gray-900 truncate text-sm">{other?.name || 'Unknown'} <span className="text-xs text-gray-400">({other?.role})</span></span>
                      {lastMsg && (
                        <span className="text-xs text-gray-500 truncate w-full">
                          {lastMsg.sender && lastMsg.sender._id === user._id ? 'You: ' : lastMsg.sender?.name ? `${lastMsg.sender.name}: ` : ''}
                          {lastMsg.text ? lastMsg.text.slice(0, 30) : '[File]'}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-end ml-auto">
                      {lastMsg && (
                        <span className="text-xs text-gray-400 mb-1">{lastMsg.createdAt ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                      )}
                      {unread > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 shadow">{unread}</span>
                      )}
                    </div>
                  </button>
                  {/* Delete conversation popover */}
                  {deleteConvId === conv._id && (
                    <div className="absolute right-10 top-2 bg-white border border-gray-300 rounded shadow p-2 z-30 flex flex-col">
                      <button className="text-red-600 text-xs font-semibold hover:underline" onClick={() => handleDeleteConversation(conv._id)}>Delete Conversation</button>
                      <button className="text-xs mt-1 text-gray-500 hover:underline" onClick={() => setDeleteConvId(null)}>Cancel</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {/* Hamburger open button (mobile only) */}
        {!showSidebar && (
          <button
            className="md:hidden absolute top-4 left-4 z-40 bg-white/80 rounded-full p-2 shadow text-primary-700"
            onClick={() => { setShowSidebar(true); hideClue(); }}
          >
            <FaBars size={22} />
          </button>
        )}
        {/* Chat Window */}
        <div className={`flex-1 flex flex-col bg-white transition-all duration-300 h-full ${showSidebar && window.innerWidth < 768 ? 'hidden' : ''}`}>
          {/* Chat Header */}
          <div className="flex items-center gap-4 px-3 md:px-6 py-3 border-b border-gray-200 bg-white sticky top-0 z-10">
            {/* Hamburger icon for mobile only */}
            {selectedConversation && (
              <button className="md:hidden mr-2 text-primary-700" onClick={() => { handleBack(); hideClue(); }}><FaArrowLeft size={22} /></button>
            )}
            {selectedConversation && selectedConversation.participants ? (
              <>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-200 to-primary-400 flex items-center justify-center text-primary-800 font-bold text-xl">
                  {selectedConversation.participants.find((p) => p._id !== user?._id)?.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-lg text-gray-900">{selectedConversation.participants.find((p) => p._id !== user?._id)?.name}</span>
                  <span className="text-xs text-gray-500">{selectedConversation.participants.find((p) => p._id !== user?._id)?.role}</span>
                </div>
                {/* Translation Feature: desktop only */}
                <div className="hidden md:flex items-center gap-2 ml-auto">
                  <label className="flex items-center gap-1 text-xs font-medium">
                    <input
                      type="checkbox"
                      checked={isTranslationActive}
                      onChange={e => setIsTranslationActive(e.target.checked)}
                      className="mr-1 accent-primary-600"
                    />
                    Translator
                  </label>
                  <select
                    value={targetLanguage}
                    onChange={e => setTargetLanguage(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary-200"
                    disabled={!isTranslationActive}
                  >
                    {languageOptions.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.label}</option>
                    ))}
                  </select>
                  {/* Auto-translate incoming */}
                  <label className="flex items-center gap-1 text-xs font-medium ml-4">
                    <input
                      type="checkbox"
                      checked={autoTranslateIncoming}
                      onChange={e => setAutoTranslateIncoming(e.target.checked)}
                      className="mr-1 accent-primary-600"
                    />
                    Auto-translate incoming
                  </label>
                  <select
                    value={incomingLang}
                    onChange={e => setIncomingLang(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary-200"
                    disabled={!autoTranslateIncoming}
                  >
                    {languageOptions.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.label}</option>
                    ))}
                  </select>
                </div>
                {/* Translate icon for mobile */}
                <button
                  className="md:hidden ml-auto text-primary-700 p-2 rounded-full hover:bg-primary-100 active:bg-primary-200 transition shadow-sm"
                  style={{ boxShadow: '0 1px 4px rgba(80,80,180,0.08)' }}
                  onClick={() => setShowTranslateDrawer(true)}
                  title="Translation options"
                >
                  <FaGlobe size={20} />
                </button>
              </>
            ) : null}
          </div>
          {/* Translation Drawer (mobile only) */}
          {showTranslateDrawer && (
            <div className="absolute top-0 right-0 bottom-0 z-40 flex md:hidden h-full w-full">
              <div className="flex-1 bg-black/30" onClick={() => setShowTranslateDrawer(false)} />
              <div
                className="w-72 max-w-full bg-white h-full shadow-2xl flex flex-col animate-slide-in-right-slow relative rounded-l-2xl"
                style={{ minWidth: '240px', boxShadow: '0 4px 24px rgba(80,80,180,0.13)' }}
                onTouchStart={handleDrawerTouchStart}
                onTouchMove={handleDrawerTouchMove}
                onTouchEnd={handleDrawerTouchEnd}
              >
                <button
                  className="absolute top-3 left-3 text-primary-700 text-lg rounded-full hover:bg-primary-100 active:bg-primary-200 p-2"
                  onClick={() => setShowTranslateDrawer(false)}
                  title="Back"
                >
                  <FaArrowLeft />
                </button>
                <div className="p-4 pt-12 flex flex-col gap-3 text-[15px]">
                  <label className="flex items-center gap-2 font-medium">
                    <input
                      type="checkbox"
                      checked={isTranslationActive}
                      onChange={e => setIsTranslationActive(e.target.checked)}
                      className="accent-primary-600 w-4 h-4"
                    />
                    Translator
                  </label>
                  <select
                    value={targetLanguage}
                    onChange={e => setTargetLanguage(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-200"
                    disabled={!isTranslationActive}
                  >
                    {languageOptions.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.label}</option>
                    ))}
                  </select>
                  <label className="flex items-center gap-2 font-medium mt-2">
                    <input
                      type="checkbox"
                      checked={autoTranslateIncoming}
                      onChange={e => setAutoTranslateIncoming(e.target.checked)}
                      className="accent-primary-600 w-4 h-4"
                    />
                    Auto-translate incoming
                  </label>
                  <select
                    value={incomingLang}
                    onChange={e => setIncomingLang(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-200"
                    disabled={!autoTranslateIncoming}
                  >
                    {languageOptions.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
          {/* Chat Body */}
          <div ref={chatBodyRef} className="flex-1 flex flex-col-reverse overflow-y-auto gap-2 px-2 md:px-4 py-2 md:py-4 pb-20 md:pb-8" style={{scrollbarWidth:'thin', minHeight:0, maxHeight:'100%'}} onClick={hideClue}>
            <div ref={messagesEndRef} />
            {selectedConversation && selectedConversation.participants ? (
              messages.slice().reverse().map((msg, idx) => {
                if (!msg.sender || !user) return null;
                const isMe = msg.sender?._id === user?._id;
                const other = selectedConversation.participants.find((p) => p._id !== user?._id);
                const msgId = msg._id || (messages.length - 1 - idx); // reverse order
                const shouldTranslate = autoTranslateIncoming && !isMe && msg.text;
                const loadingTranslation = loadingTranslations[msgId];
                const translated = translatedMessages[msgId];
                return (
                  <div key={idx} className={`flex items-end w-full ${isMe ? 'justify-end pr-2' : 'justify-start pl-2'} mb-1`}>
                    {!isMe && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-200 to-primary-400 flex items-center justify-center text-primary-800 font-bold text-base mr-2">
                        {other?.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <div
                      className={`relative max-w-xs w-fit px-4 py-2 pb-5 rounded-2xl shadow-md text-sm ${isMe ? 'bg-primary-600 text-white rounded-br-3xl ml-auto' : 'bg-white text-gray-900 border border-gray-200 rounded-bl-3xl'} flex flex-col`}
                      style={{wordBreak:'break-word'}}
                      onDoubleClick={() => isMe && setDeleteMsgId(msg._id)}
                      title={isMe ? 'Double-click to delete/unsend' : undefined}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-xs">{msg.sender?.name || (isMe ? 'You' : 'Other')}</span>
                        <span className="text-xs text-gray-300">{msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                      </div>
                      {msg.text && (
                        <div className="whitespace-pre-line break-words leading-relaxed text-[15px]">
                          {shouldTranslate && (loadingTranslation ? (
                            <span className="text-xs text-gray-400 italic">Translating...</span>
                          ) : translated ? (
                            <>
                              <span className="block text-primary-600 font-semibold">{translated}</span>
                              <span className="block text-xs text-gray-400 mt-1">(Original: {msg.text})</span>
                            </>
                          ) : (
                            msg.text
                          ))}
                          {!shouldTranslate && msg.text}
                        </div>
                      )}
                      {msg.fileUrl && (
                        msg.fileType && msg.fileType.startsWith('image') ? (
                          <img src={msg.fileUrl} alt="sent file" className="max-w-[180px] max-h-[180px] mt-2 rounded-xl border border-gray-200" />
                        ) : (
                          <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline mt-2 block">View File</a>
                        )
                      )}
                      {/* Delivery/Read status for your own messages */}
                      {isMe && (
                        <span className="absolute right-3 bottom-1 flex items-center gap-1 text-xs">
                          {msg.readBy && msg.readBy.length > 1 ? (
                            <FaCheckDouble className="text-green-400" title="Read" />
                          ) : msg.delivered ? (
                            <FaCheck className="text-gray-300" title="Delivered" />
                          ) : null}
                        </span>
                      )}
                      {/* Bubble tail */}
                      {!isMe && (
                        <span className="absolute left-[-8px] bottom-2 w-4 h-4">
                          <svg viewBox="0 0 20 20" fill="currentColor" className="text-white"><polygon points="20,0 0,0 0,20" /></svg>
                        </span>
                      )}
                      {/* Delete message popover */}
                      {isMe && deleteMsgId === msg._id && (
                        <div className="absolute right-0 top-8 bg-white border border-gray-300 rounded shadow p-2 z-30 flex flex-col">
                          <button className="text-red-600 text-xs font-semibold hover:underline" onClick={() => handleDeleteMessage(msg._id)}>Delete/Unsend</button>
                          <button className="text-xs mt-1 text-gray-500 hover:underline" onClick={() => setDeleteMsgId(null)}>Cancel</button>
                        </div>
                      )}
                    </div>
                    {isMe && (
                      <div className="w-8 h-8" />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-lg font-medium">Select a conversation or start a new chat</div>
            )}
          </div>
          {/* Typing Indicator */}
          {isOtherTyping && (
            <div className="px-6 pb-2 text-xs text-primary-500 animate-pulse font-medium">{otherTypingName} is typing...</div>
          )}
          {/* Chat Input */}
          {selectedConversation && (
            <form onSubmit={sendMessage} className="flex items-center gap-2 md:gap-3 px-2 md:px-6 py-3 md:py-4 border-t border-gray-200 bg-white sticky bottom-0 z-10 mt-0 md:mt-2" onClick={hideClue}>
              {/* Clue for double-click delete */}
              {showDeleteClue && (
                <span className="absolute left-1/2 -translate-x-1/2 bottom-16 bg-primary-50 text-primary-700 text-xs px-3 py-1 rounded-full shadow-sm animate-fade-in-out z-20 select-none pointer-events-none">
                  Tip: Double-click a message or chat to delete
                </span>
              )}
              <label className="flex items-center cursor-pointer">
                <input
                  type="file"
                  accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={e => setFile(e.target.files[0])}
                  className="hidden"
                />
                <span className="w-10 h-10 flex items-center justify-center rounded-full bg-primary-100 hover:bg-primary-200 transition text-primary-600 mr-2">
                  <FaImage />
                </span>
              </label>
              <input
                type="text"
                className="flex-1 border-none bg-white/80 rounded-2xl px-5 py-3 shadow focus:outline-none focus:ring-2 focus:ring-primary-200 text-gray-900 placeholder-gray-400"
                placeholder="Type a message..."
                value={message}
                onChange={handleInputChange}
                required={!file}
                autoFocus
              />
              <button type="submit" className="w-12 h-12 rounded-full bg-primary-600 hover:bg-primary-700 transition flex items-center justify-center shadow-lg text-white text-xl">
                <FaPaperPlane />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat; 