"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, MessageCircle, Trash2, Edit2, Check, X } from 'lucide-react';
import { ChatSession } from '@/lib/supabase';

interface SessionListProps {
  sessions: ChatSession[];
  currentSessionId: number | null;
  onSessionSelect: (sessionId: number) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: number) => void;
  onUpdateSessionTitle: (sessionId: number, newTitle: string) => void;
  isLoading: boolean;
}

export function SessionList({ 
  sessions, 
  currentSessionId, 
  onSessionSelect, 
  onNewSession,
  onDeleteSession,
  onUpdateSessionTitle,
  isLoading 
}: SessionListProps) {
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleStartEdit = (session: ChatSession) => {
    setEditingSessionId(session.id);
    setEditTitle(session.title);
  };

  const handleSaveEdit = async () => {
    if (editingSessionId && editTitle.trim()) {
      await onUpdateSessionTitle(editingSessionId, editTitle.trim());
      setEditingSessionId(null);
      setEditTitle('');
    }
  };

  const handleCancelEdit = () => {
    setEditingSessionId(null);
    setEditTitle('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <Button 
          onClick={onNewSession}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          disabled={isLoading}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Sessions List */}
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          {isLoading && sessions.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Loading sessions...
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No chats yet</p>
              <p className="text-xs">Start a new conversation</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className={`
                  group relative p-3 rounded-lg cursor-pointer border transition-all duration-200
                  ${currentSessionId === session.id 
                    ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700' 
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'
                  }
                `}
                onClick={() => onSessionSelect(session.id)}
              >
                {/* Session Content */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {editingSessionId === session.id ? (
                      <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleSaveEdit}
                          className="p-1 h-6 w-6"
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelEdit}
                          className="p-1 h-6 w-6"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                          {session.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatDate(session.updated_at)}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {editingSessionId !== session.id && (
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(session);
                        }}
                        className="p-1 h-6 w-6 hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this chat?')) {
                            onDeleteSession(session.id);
                          }
                        }}
                        className="p-1 h-6 w-6 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Active Session Indicator */}
                {currentSessionId === session.id && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r"></div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {sessions.length} chat{sessions.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}