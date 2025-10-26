'use client';

import { useState } from 'react';
import { Send, RotateCcw } from 'lucide-react';

export default function LinePreview({ components, businessName = 'Your Business' }) {
  const [conversation, setConversation] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [userInput, setUserInput] = useState('');

  const resetConversation = () => {
    setConversation([]);
    setCurrentStep(0);
    setUserInput('');
  };

  const processNextComponent = () => {
    if (currentStep >= components.length) return;

    const component = components.sort((a, b) => a.order - b.order)[currentStep];
    const newMessages = [];

    switch (component.type) {
      case 'greeting':
        newMessages.push({
          type: 'bot',
          content: component.config?.message?.replace('{business_name}', businessName) || 'Hello!',
          timestamp: new Date(),
        });
        break;

      case 'user-input':
        newMessages.push({
          type: 'bot',
          content: component.config?.question || 'Please provide your information',
          timestamp: new Date(),
        });
        break;

      case 'booking-menu':
        newMessages.push({
          type: 'bot',
          content: 'What would you like to do?',
          quickReplies: ['View My Bookings', 'Make New Booking'],
          timestamp: new Date(),
        });
        break;

      case 'service-list':
        newMessages.push({
          type: 'bot',
          content: 'Please choose a service:',
          services: ['Service 1', 'Service 2', 'Service 3'],
          timestamp: new Date(),
        });
        break;

      case 'staff-selector':
        if (component.config?.enabled) {
          newMessages.push({
            type: 'bot',
            content: 'Would you like to choose a staff member?',
            quickReplies: component.config?.staff?.map(s => s.name) || ['Staff Member 1', 'Any Staff'],
            timestamp: new Date(),
          });
        }
        break;

      case 'availability':
        newMessages.push({
          type: 'bot',
          content: 'Please select a date:',
          quickReplies: ['Today', 'Tomorrow', 'Jan 15', 'Jan 16'],
          timestamp: new Date(),
        });
        break;

      default:
        break;
    }

    setConversation([...conversation, ...newMessages]);
    setCurrentStep(currentStep + 1);
  };

  const handleQuickReply = (reply) => {
    setConversation([
      ...conversation,
      { type: 'user', content: reply, timestamp: new Date() },
    ]);
    setTimeout(() => processNextComponent(), 500);
  };

  const handleSendInput = () => {
    if (!userInput.trim()) return;

    setConversation([
      ...conversation,
      { type: 'user', content: userInput, timestamp: new Date() },
    ]);
    setUserInput('');
    setTimeout(() => processNextComponent(), 500);
  };

  const currentComponent = components.sort((a, b) => a.order - b.order)[currentStep - 1];
  const showQuickReplies = conversation[conversation.length - 1]?.quickReplies;
  const showServices = conversation[conversation.length - 1]?.services;
  const needsUserInput = currentComponent?.type === 'user-input';

  return (
    <div className="flex flex-col h-full">
      {/* LINE Header */}
      <div className="bg-[#06c755] text-white px-4 py-3 flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
          <span className="text-xl">🦊</span>
        </div>
        <div className="flex-1">
          <div className="font-semibold">@kitsunebook</div>
          <div className="text-xs text-green-100">LINE Official Account</div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 bg-[#f0f4f8] p-4 overflow-y-auto">
        {conversation.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500 mb-4">
              Preview your conversation flow
            </p>
            <button
              onClick={processNextComponent}
              className="px-6 py-2 bg-[#06c755] text-white rounded-full font-medium hover:bg-[#05b34b] transition-colors"
            >
              Start Conversation
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {conversation.map((message, index) => (
              <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`
                    max-w-[70%] rounded-2xl px-4 py-2 shadow-sm
                    ${message.type === 'user' ? 'bg-[#06c755] text-white rounded-tr-sm' : 'bg-white text-slate-900 rounded-tl-sm'}
                  `}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>

                  {/* Services display */}
                  {message.services && (
                    <div className="mt-2 space-y-1">
                      {message.services.map((service, idx) => (
                        <div
                          key={idx}
                          className="text-xs bg-slate-50 px-3 py-2 rounded-lg border border-slate-200"
                        >
                          {service}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick replies */}
      {showQuickReplies && (
        <div className="bg-white border-t border-slate-200 px-4 py-3">
          <div className="flex flex-wrap gap-2">
            {showQuickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => handleQuickReply(reply)}
                className="px-4 py-2 bg-white border-2 border-[#06c755] text-[#06c755] rounded-full text-sm font-medium hover:bg-[#06c755] hover:text-white transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="bg-white border-t border-slate-200 px-4 py-3 flex items-center gap-3">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendInput()}
          placeholder={needsUserInput ? 'Type your response...' : 'Type a message...'}
          className="flex-1 px-4 py-2 border border-slate-300 rounded-full focus:outline-none focus:border-[#06c755]"
        />
        <button
          onClick={handleSendInput}
          className="w-10 h-10 bg-[#06c755] text-white rounded-full flex items-center justify-center hover:bg-[#05b34b] transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
        <button
          onClick={resetConversation}
          className="w-10 h-10 bg-slate-200 text-slate-700 rounded-full flex items-center justify-center hover:bg-slate-300 transition-colors"
          title="Reset conversation"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
