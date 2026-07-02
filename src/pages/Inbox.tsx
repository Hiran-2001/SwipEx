import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { MessageSquare, Send, CheckCircle2, MapPin } from 'lucide-react';

const Inbox: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Selected thread mapping: "productId_counterpartId"
  const [activeThreadKey, setActiveThreadKey] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
    }
  }, [user, navigate]);

  // Fetch Conversations List
  const { data: conversationsData, refetch: refetchConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await api.get('/messages/conversations');
      return response.data;
    },
    enabled: !!user,
  });

  // Extract selected thread info
  const conversations = conversationsData?.data || [];
  const activeConversation = conversations.find((c: any) => c.id === activeThreadKey);

  // Fetch Message History for selected thread
  const { data: messagesData, refetch: refetchMessages } = useQuery({
    queryKey: ['messages', activeThreadKey],
    queryFn: async () => {
      if (!activeConversation) return null;
      const response = await api.get(
        `/messages/thread?counterpartId=${activeConversation.counterpart.id}&productId=${activeConversation.productId}`
      );
      return response.data;
    },
    enabled: !!activeThreadKey && !!activeConversation,
  });

  // Polling updates for incoming messages
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      refetchConversations();
      if (activeThreadKey) {
        refetchMessages();
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [user, activeThreadKey, refetchConversations, refetchMessages]);

  // Auto-scroll messages list on new additions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messagesData?.data) {
      scrollToBottom();
    }
  }, [messagesData]);

  // Mark messages as read when thread changes
  useEffect(() => {
    if (activeThreadKey && activeConversation) {
      api.patch('/messages/read', {
        counterpartId: activeConversation.counterpart.id,
        productId: activeConversation.productId,
      }).then(() => {
        refetchConversations();
      }).catch(err => console.error('Failed to mark read', err));
    }
  }, [activeThreadKey, activeConversation, refetchConversations]);

  // Send Message Mutation
  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!activeConversation) return;
      const response = await api.post('/messages', {
        receiverId: activeConversation.counterpart.id,
        productId: activeConversation.productId,
        message: newMessage,
      });
      return response.data;
    },
    onSuccess: () => {
      setNewMessage('');
      refetchMessages();
      refetchConversations();
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && activeConversation) {
      sendMessageMutation.mutate();
    }
  };

  return (
    <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden h-[calc(100vh-200px)] flex">
      {/* Left Pane: Conversations List */}
      <div className="w-full md:w-80 border-r border-slate-800 flex flex-col shrink-0 bg-slate-900/10">
        <div className="p-4 border-b border-slate-800 bg-slate-900/20">
          <h2 className="font-extrabold text-white text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary-400" /> Conversations
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-850">
          {conversations.length > 0 ? (
            conversations.map((conv: any) => {
              const isActive = conv.id === activeThreadKey;
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveThreadKey(conv.id)}
                  className={`w-full text-left p-4 flex gap-3 transition-colors cursor-pointer hover:bg-slate-900/40 ${
                    isActive ? 'bg-slate-900/60 border-l-4 border-primary-500' : ''
                  }`}
                >
                  <img
                    src={conv.product?.images?.[0]?.image_url || 'https://picsum.photos/80/60'}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-800 bg-slate-950"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex justify-between items-baseline">
                      <h4 className="text-xs font-extrabold text-white truncate">
                        {conv.counterpart?.full_name}
                      </h4>
                      <span className="text-[9px] text-slate-500">
                        {new Date(conv.lastMessageAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-350 truncate font-semibold">
                      {conv.product?.title}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{conv.lastMessage}</p>
                  </div>

                  {conv.unreadCount > 0 && (
                    <span className="self-center px-2 py-0.5 text-[9px] font-bold bg-primary-600 text-white rounded-full">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            <div className="py-20 text-center text-xs text-slate-500">No active conversations found.</div>
          )}
        </div>
      </div>

      {/* Right Pane: Chat Window */}
      <div className="hidden md:flex flex-col flex-1 bg-slate-950/20">
        {activeConversation ? (
          <>
            {/* Thread Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={
                    activeConversation.product?.images?.[0]?.image_url || 'https://picsum.photos/80/60'
                  }
                  alt=""
                  className="w-10 h-10 rounded-lg object-cover border border-slate-800 bg-slate-950"
                />
                <div>
                  <Link
                    to={`/products/${activeConversation.productId}`}
                    className="text-sm font-bold text-white hover:text-primary-400 truncate hover:underline block max-w-sm"
                  >
                    {activeConversation.product?.title}
                  </Link>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    Chat counterpart: <strong className="text-slate-300 font-semibold">{activeConversation.counterpart?.full_name}</strong>
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs font-bold text-emerald-400">
                  ₹{Number(activeConversation.product?.selling_price).toLocaleString('en-IN')}
                </p>
                <p className="text-[9px] text-slate-500 flex items-center justify-end gap-0.5">
                  <MapPin className="w-2.5 h-2.5" /> {activeConversation.product?.location}
                </p>
              </div>
            </div>

            {/* Message Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesData?.data?.map((msg: any) => {
                const isSentByMe = msg.sender_id === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="max-w-[70%] space-y-1">
                      <div
                        className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                          isSentByMe
                            ? 'bg-primary-650 text-white rounded-tr-none'
                            : 'bg-slate-900 text-slate-100 border border-slate-850 rounded-tl-none'
                        }`}
                      >
                        {msg.message}
                      </div>
                      <div
                        className={`text-[9px] text-slate-500 flex items-center gap-1 ${
                          isSentByMe ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <span>
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {isSentByMe && (
                          <CheckCircle2
                            className={`w-3.5 h-3.5 ${
                              msg.is_read ? 'text-primary-400 fill-primary-950/20' : 'text-slate-600'
                            }`}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-slate-800 bg-slate-900/20 flex gap-3"
            >
              <input
                type="text"
                placeholder="Type your message here..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={sendMessageMutation.isPending}
                className="gradient-btn px-5 rounded-xl flex items-center justify-center cursor-pointer shrink-0 disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-center p-8 space-y-3">
            <MessageSquare className="w-12 h-12 text-slate-650 animate-bounce" />
            <h3 className="font-bold text-slate-400">Select a conversation</h3>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              Choose a message thread from the left list to view pricing discussions and chat logs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
