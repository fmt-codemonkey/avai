import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';

export interface LocalChatSession {
  id: number;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface LocalChatMessage {
  id: number;
  session_id: number;
  content: string;
  sender: string;
  created_at: string;
}

export function useLocalChatHistory() {
  const { user, isSignedIn } = useUser();
  const [sessions, setSessions] = useState<LocalChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<LocalChatSession | null>(null);
  const [messages, setMessages] = useState<LocalChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getStorageKey = useCallback((suffix: string) => {
    return `avai_${user?.id || 'anonymous'}_${suffix}`;
  }, [user?.id]);

  // Load all sessions for the authenticated user from localStorage
  const loadSessions = useCallback(() => {
    if (!isSignedIn || !user?.id) {
      setSessions([]);
      return;
    }

    setIsLoading(true);
    try {
      const stored = localStorage.getItem(getStorageKey('sessions'));
      const sessions = stored ? JSON.parse(stored) : [];
      setSessions(sessions);
      console.log('✅ Loaded sessions from localStorage:', sessions);
    } catch (error) {
      console.error('Failed to load sessions from localStorage:', error);
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, user?.id, getStorageKey]);

  // Save sessions to localStorage
  const saveSessions = useCallback((newSessions: LocalChatSession[]) => {
    if (!user?.id) return;
    
    try {
      localStorage.setItem(getStorageKey('sessions'), JSON.stringify(newSessions));
      setSessions(newSessions);
    } catch (error) {
      console.error('Failed to save sessions to localStorage:', error);
    }
  }, [user?.id, getStorageKey]);

  // Load messages for a specific session
  const loadMessages = useCallback((sessionId: number) => {
    setIsLoading(true);
    try {
      const stored = localStorage.getItem(getStorageKey(`messages_${sessionId}`));
      const messages = stored ? JSON.parse(stored) : [];
      setMessages(messages);
      console.log(`✅ Loaded messages for session ${sessionId}:`, messages);
    } catch (error) {
      console.error('Failed to load messages from localStorage:', error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [getStorageKey]);

  // Save messages for a session
  const saveMessages = useCallback((sessionId: number, newMessages: LocalChatMessage[]) => {
    try {
      localStorage.setItem(getStorageKey(`messages_${sessionId}`), JSON.stringify(newMessages));
      setMessages(newMessages);
    } catch (error) {
      console.error('Failed to save messages to localStorage:', error);
    }
  }, [getStorageKey]);

  // Create a new session
  const createSession = useCallback(async (title: string): Promise<LocalChatSession | null> => {
    if (!user?.id) return null;

    const newSession: LocalChatSession = {
      id: Date.now(), // Simple ID generation
      user_id: user.id,
      title,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const updatedSessions = [newSession, ...sessions];
    saveSessions(updatedSessions);
    setCurrentSession(newSession);
    setMessages([]); // Clear messages for new session
    
    console.log('✅ Created new session:', newSession);
    return newSession;
  }, [user?.id, sessions, saveSessions]);

  // Add a message to the current session
  const addMessage = useCallback(async (content: string, sender: string): Promise<LocalChatMessage | null> => {
    if (!currentSession) return null;

    const newMessage: LocalChatMessage = {
      id: Date.now(),
      session_id: currentSession.id,
      content,
      sender,
      created_at: new Date().toISOString()
    };

    const updatedMessages = [...messages, newMessage];
    saveMessages(currentSession.id, updatedMessages);

    // Update session's updated_at timestamp
    const updatedSession = {
      ...currentSession,
      updated_at: new Date().toISOString()
    };
    const updatedSessions = sessions.map(s => s.id === currentSession.id ? updatedSession : s);
    saveSessions(updatedSessions);
    setCurrentSession(updatedSession);

    console.log('✅ Added message:', newMessage);
    return newMessage;
  }, [currentSession, messages, sessions, saveMessages, saveSessions]);

  // Switch to a different session
  const switchToSession = useCallback(async (sessionId: number) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
      loadMessages(sessionId);
      console.log('✅ Switched to session:', session);
    }
  }, [sessions, loadMessages]);

  // Delete a session
  const deleteSession = useCallback(async (sessionId: number) => {
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    saveSessions(updatedSessions);
    
    // Clear messages from localStorage
    localStorage.removeItem(getStorageKey(`messages_${sessionId}`));
    
    // If we deleted the current session, clear it
    if (currentSession?.id === sessionId) {
      setCurrentSession(null);
      setMessages([]);
    }
    
    console.log(`✅ Deleted session ${sessionId}`);
  }, [sessions, currentSession, saveSessions, getStorageKey]);

  // Update session title
  const updateSessionTitle = useCallback(async (sessionId: number, newTitle: string) => {
    const updatedSessions = sessions.map(session => 
      session.id === sessionId 
        ? { ...session, title: newTitle, updated_at: new Date().toISOString() }
        : session
    );
    saveSessions(updatedSessions);
    
    // Update current session if it's the one being updated
    if (currentSession?.id === sessionId) {
      setCurrentSession(prev => prev ? { ...prev, title: newTitle, updated_at: new Date().toISOString() } : null);
    }
    
    console.log(`✅ Updated session ${sessionId} title to: ${newTitle}`);
  }, [sessions, currentSession, saveSessions]);

  // Load sessions on mount and when user changes
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return {
    sessions,
    currentSession,
    messages,
    isLoading,
    loadSessions,
    loadMessages,
    createSession,
    addMessage,
    switchToSession,
    deleteSession,
    updateSessionTitle
  };
}