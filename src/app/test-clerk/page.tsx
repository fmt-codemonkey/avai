'use client';

import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import ClerkIntegrationDemo from '@/components/ClerkIntegrationDemo';

export default function TestClerkPage() {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
    >
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🔐 Clerk Authentication Integration
            </h1>
            <p className="text-xl text-gray-600">
              Complete Next.js + Fastify + WebSocket Authentication Demo
            </p>
          </div>
          
          <ClerkIntegrationDemo />
          
          <div className="mt-12 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">🎯 What This Demo Shows</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-green-600 mb-2">✅ Frontend Features</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Clerk authentication with sign-in/sign-out</li>
                  <li>• User profile display with avatar</li>
                  <li>• Real-time WebSocket connection status</li>
                  <li>• Automatic token-based authentication</li>
                  <li>• Anonymous fallback authentication</li>
                  <li>• Live activity logging</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-blue-600 mb-2">🔧 Backend Features</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Clerk token verification with official SDK</li>
                  <li>• Protected API routes (/api/auth/me)</li>
                  <li>• WebSocket authentication middleware</li>
                  <li>• Security event logging</li>
                  <li>• Rate limiting and error handling</li>
                  <li>• Database user synchronization</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">🔗 API Endpoints Available:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm font-mono text-gray-600">
                <div>GET /api/auth/me</div>
                <div>GET /api/user/profile</div>
                <div>POST /api/auth/test</div>
                <div>WebSocket: /ws</div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">📚 Implementation Guide:</h4>
              <p className="text-sm text-blue-700">
                Check out <code className="bg-blue-100 px-1 rounded">docs/clerk-integration-guide.md</code> for 
                complete implementation details, code examples, and best practices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ClerkProvider>
  );
}