'use client';

import { useState, useRef } from 'react';
import { Send, RotateCcw } from 'lucide-react';
import useSetupWizardStore from '@/stores/setupWizardStore';

export default function LinePreview({ components, businessName = 'Your Business' }) {
  const services = useSetupWizardStore((state) => state.services);
  const staff = useSetupWizardStore((state) => state.staff);
  const richMenu = useSetupWizardStore((state) => state.richMenu);
  const welcomeMessage = useSetupWizardStore((state) => state.welcomeMessage);
  const businessHours = useSetupWizardStore((state) => state.businessHours);
  const contactInfo = useSetupWizardStore((state) => state.contactInfo);
  const [conversation, setConversation] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [userInput, setUserInput] = useState('');
  const carouselRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const resetConversation = () => {
    setConversation([]);
    setCurrentStep(0);
    setUserInput('');
  };

  const processNextComponent = () => {
    const newMessages = [];

    // Show welcome message only at the start (currentStep === 0)
    if (currentStep === 0) {
      const welcomeMsg = welcomeMessage?.replace('{business_name}', businessName) ||
                        `Welcome to ${businessName}! I'm here to help you book appointments.`;
      newMessages.push({
        type: 'bot',
        content: welcomeMsg,
        timestamp: new Date(),
      });
    }

    // Process workflow component if available
    if (currentStep >= components.length) {
      if (newMessages.length > 0) {
        setConversation([...conversation, ...newMessages]);
        setCurrentStep(currentStep + 1);
      }
      return;
    }

    const component = components.sort((a, b) => a.order - b.order)[currentStep];

    switch (component.type) {
      case 'user-input':
        newMessages.push({
          type: 'bot',
          content: component.config?.question || 'Please provide your information',
          timestamp: new Date(),
        });
        break;

      case 'booking-menu':
        const menuOptions = component.config?.options || ['View My Bookings', 'Make New Booking'];
        newMessages.push({
          type: 'bot',
          content: component.config?.questionText || 'What would you like to do?',
          quickReplies: menuOptions.filter(opt => opt.trim() !== ''),
          timestamp: new Date(),
        });
        break;

      case 'service-list':
        const serviceData = services.length > 0
          ? services.map(s => ({
              name: s.name,
              price: s.price,
              duration: s.duration,
              description: s.description
            }))
          : null;

        newMessages.push({
          type: 'bot',
          content: services.length > 0 ? 'Please choose a service:' : 'Please add services in Step 2 first',
          serviceData: serviceData,
          displayStyle: component.config?.displayStyle || 'carousel',
          showPricing: component.config?.showPricing !== false,
          timestamp: new Date(),
        });
        break;

      case 'staff-selector':
        if (component.config?.enabled) {
          const selectedStaffIds = component.config?.selectedStaff || [];
          const availableStaff = selectedStaffIds.length > 0
            ? staff.filter(s => selectedStaffIds.includes(s.id))
            : staff;

          const staffOptions = availableStaff.length > 0
            ? [...availableStaff.map(s => s.name), 'Any Staff']
            : ['No staff configured'];

          newMessages.push({
            type: 'bot',
            content: availableStaff.length > 0
              ? 'Please choose a staff member:'
              : 'Please add staff in Step 3 first',
            quickReplies: staffOptions,
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

  const handleRichMenuAction = (itemType) => {
    const newMessages = [];

    // Add user's click as a message
    const item = richMenu.items.find(i => i.type === itemType);
    newMessages.push({
      type: 'user',
      content: item?.label || 'Action',
      timestamp: new Date(),
    });

    // Process the action
    switch (itemType) {
      case 'view-bookings':
        // Show sample bookings (no DB yet)
        newMessages.push({
          type: 'bot',
          content: 'Here are your upcoming bookings:',
          timestamp: new Date(),
        });
        newMessages.push({
          type: 'bot',
          content: '📅 No bookings found.\n\nWould you like to make a new booking?',
          quickReplies: ['Make New Booking', 'Go Back'],
          timestamp: new Date(),
        });
        break;

      case 'new-booking':
        // Restart the workflow
        newMessages.push({
          type: 'bot',
          content: 'Let\'s start a new booking! 🦊',
          timestamp: new Date(),
        });
        setConversation([...conversation, ...newMessages]);
        setCurrentStep(0);
        setTimeout(() => processNextComponent(), 500);
        return;

      case 'business-hours':
        // Display business hours
        let hoursText = '🕐 Business Hours:\n\n';
        if (businessHours.mode === '24/7') {
          hoursText += 'Open 24/7';
        } else if (businessHours.mode === 'same-daily') {
          hoursText += `Daily: ${businessHours.sameDaily.open} - ${businessHours.sameDaily.close}`;
        } else if (businessHours.mode === 'custom') {
          const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
          const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
          days.forEach((day, idx) => {
            const dayHours = businessHours.custom[day];
            if (dayHours.closed) {
              hoursText += `\n${dayNames[idx]}: Closed`;
            } else {
              hoursText += `\n${dayNames[idx]}: ${dayHours.open} - ${dayHours.close}`;
            }
          });
        }
        newMessages.push({
          type: 'bot',
          content: hoursText,
          timestamp: new Date(),
        });
        break;

      case 'contact-us':
        // Display contact information
        let contactText = '📞 Contact Information:\n\n';
        const hasContact = Object.values(contactInfo).some(v => v && v.trim().length > 0);

        if (!hasContact) {
          contactText += 'Contact information not available.';
        } else {
          if (contactInfo.phone) contactText += `📱 Phone: ${contactInfo.phone}\n`;
          if (contactInfo.email) contactText += `📧 Email: ${contactInfo.email}\n`;
          if (contactInfo.address) contactText += `📍 Address: ${contactInfo.address}\n`;
          if (contactInfo.website) contactText += `🌐 Website: ${contactInfo.website}`;
        }

        newMessages.push({
          type: 'bot',
          content: contactText.trim(),
          timestamp: new Date(),
        });
        break;

      default:
        break;
    }

    setConversation([...conversation, ...newMessages]);
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

  const handleMouseDown = (e) => {
    if (!carouselRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    carouselRef.current.scrollLeft = scrollLeft - walk;
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
          <div className="font-semibold">@kitsunebooking</div>
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
                  {message.serviceData && (
                    <div className={`mt-3 ${message.displayStyle === 'carousel' ? 'overflow-x-auto scrollbar-hide' : 'space-y-2'}`}>
                      {message.displayStyle === 'carousel' ? (
                        <div
                          ref={carouselRef}
                          onMouseDown={handleMouseDown}
                          onMouseLeave={handleMouseLeave}
                          onMouseUp={handleMouseUp}
                          onMouseMove={handleMouseMove}
                          className={`flex gap-2 pb-2 overflow-x-auto scrollbar-hide select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                          style={{ scrollBehavior: isDragging ? 'auto' : 'smooth' }}
                        >
                          {message.serviceData.map((service, idx) => (
                            <button
                              key={idx}
                              onClick={(e) => {
                                // Only trigger click if not dragging
                                if (!isDragging) {
                                  handleQuickReply(service.name);
                                }
                              }}
                              onMouseDown={(e) => {
                                // Prevent text selection during drag
                                if (isDragging) {
                                  e.preventDefault();
                                }
                              }}
                              className="flex-shrink-0 w-48 bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-lg p-3 hover:border-orange-400 hover:shadow-md transition-all cursor-pointer text-left"
                            >
                              <div className="font-semibold text-slate-900 text-sm mb-1">
                                {service.name}
                              </div>
                              {service.description && (
                                <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                                  {service.description}
                                </p>
                              )}
                              <div className="flex items-center justify-between text-xs">
                                {message.showPricing && service.price && (
                                  <span className="font-medium text-orange-600">
                                    ${service.price}
                                  </span>
                                )}
                                {service.duration && (
                                  <span className="text-slate-500">
                                    {service.duration} min
                                  </span>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {message.serviceData.map((service, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleQuickReply(service.name)}
                              className="w-full bg-slate-50 border-2 border-slate-200 rounded-lg p-3 hover:border-orange-400 hover:bg-orange-50 transition-all cursor-pointer text-left"
                            >
                              <div className="font-semibold text-slate-900 text-sm mb-1">
                                {service.name}
                              </div>
                              {service.description && (
                                <p className="text-xs text-slate-600 mb-2">
                                  {service.description}
                                </p>
                              )}
                              <div className="flex items-center gap-3 text-xs">
                                {message.showPricing && service.price && (
                                  <span className="font-medium text-orange-600">
                                    ${service.price}
                                  </span>
                                )}
                                {service.duration && (
                                  <span className="text-slate-500">
                                    {service.duration} min
                                  </span>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
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

      {/* Rich Menu */}
      {richMenu.enabled && (
        <div className="bg-white border-t-2 border-slate-300">
          <div className={`grid gap-0.5 bg-slate-200 ${
            richMenu.items.filter(item => item.enabled).length <= 4
              ? 'grid-cols-2'
              : 'grid-cols-3'
          }`}>
            {richMenu.items
              .filter((item) => item.enabled)
              .sort((a, b) => a.order - b.order)
              .map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleRichMenuAction(item.type)}
                  className="bg-white hover:bg-[#f0f4f8] py-3 px-2 text-center text-xs font-medium text-slate-700 hover:text-[#06c755] transition-colors"
                >
                  {item.label}
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
