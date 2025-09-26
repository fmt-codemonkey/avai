import { useEffect, useState, useCallback, useMemo } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { createClerkSupabaseClient } from '@/lib/supabase';
import type { ChatSession, ChatMessage } from '@/lib/supabase';

export function useChatHistory() {
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Create Supabase client with Clerk authentication - memoized to prevent infinite re-creation
  const supabase = useMemo(() => createClerkSupabaseClient(getToken), [getToken]);

  // Load all sessions for the authenticated user
  const loadSessions = useCallback(async () => {
    if (!isSignedIn || !user?.id) {
      setSessions([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, user?.id, supabase]);

  // Load messages for a specific session
  const loadMessages = useCallback(async (sessionId: number) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // Create a new session
  const createSession = useCallback(async (title: string = 'New Chat') => {
    if (!isSignedIn || !user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          user_id: user.id,
          title,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Add to sessions list and set as current
      setSessions(prev => [data, ...prev]);
      setCurrentSession(data);
      setMessages([]);
      
      return data;
    } catch (error) {
      console.error('Failed to create session:', error);
      return null;
    }
  }, [isSignedIn, user?.id, supabase]);

  // Save a message to the current session
  const saveMessage = useCallback(async (content: string, sender: 'user' | 'ai') => {
    if (!currentSession) return null;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          session_id: currentSession.id,
          content,
          sender,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Add to messages list
      setMessages(prev => [...prev, data]);
      
      // Update session timestamp
      await supabase
        .from('sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', currentSession.id);
      
      return data;
    } catch (error) {
      console.error('Failed to save message:', error);
      // Still add to local state for immediate UI feedback
      const tempMessage: ChatMessage = {
        id: Date.now(), // Temporary ID
        session_id: currentSession.id,
        content,
        sender,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, tempMessage]);
      return null;
    }
  }, [currentSession, supabase]);

  // Update session title
  const updateSessionTitle = useCallback(async (sessionId: number, title: string) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ title })
        .eq('id', sessionId);

      if (error) throw error;
      
      // Update local state
      setSessions(prev => prev.map(session => 
        session.id === sessionId ? { ...session, title } : session
      ));
      
      if (currentSession?.id === sessionId) {
        setCurrentSession(prev => prev ? { ...prev, title } : null);
      }
    } catch (error) {
      console.error('Failed to update session title:', error);
    }
  }, [currentSession, supabase]);

  // Delete a session
  const deleteSession = useCallback(async (sessionId: number) => {
    try {
      // Delete messages first
      await supabase.from('messages').delete().eq('session_id', sessionId);
      
      // Then delete session
      const { error } = await supabase.from('sessions').delete().eq('id', sessionId);
      
      if (error) throw error;
      
      // Update local state
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  }, [currentSession, supabase]);

  // Load sessions when user signs in
  useEffect(() => {
    if (isSignedIn && user?.id) {
      loadSessions();
    } else {
      // Clear everything when signed out
      setSessions([]);
      setCurrentSession(null);
      setMessages([]);
    }
  }, [isSignedIn, user?.id, loadSessions]);

  return {
    // Session management
    sessions,
    currentSession,
    setCurrentSession,
    createSession,
    updateSessionTitle,
    deleteSession,
    loadSessions,
    
    // Message management
    messages,
    saveMessage,
    loadMessages,
    
    // State
    isLoading,
    isAuthenticated: isSignedIn,
  };
}