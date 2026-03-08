import React from 'react';
import { ExternalLink } from 'lucide-react';

const GoogleFormPayment = ({ event, onComplete, onCancel }) => {
  const handleOpenForm = () => {
    // Open Google Form in new tab
    window.open(event.googleFormPayment?.formUrl, '_blank');
    
    // Show confirmation message
    setTimeout(() => {
      const confirmed = window.confirm(
        'Have you completed the payment form?\n\n' +
        'Click OK if you have submitted the form and completed payment.\n' +
        'Click Cancel if you need more time.'
      );
      
      if (confirmed) {
        onComplete();
      }
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <ExternalLink className="w-8 h-8 text-purple-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Complete Payment</h3>
        <p className="text-white/60 text-sm">
          {event.googleFormPayment?.instructions || 'Click the button below to open the payment form and complete your registration.'}
        </p>
      </div>

      {/* Event Details */}
      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
        <div className="text-xs text-white/40 uppercase tracking-wider mb-2">Event Details</div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-white/70 text-sm">Event</span>
            <span className="text-white font-medium text-sm">{event.title}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/70 text-sm">Registration Fee</span>
            <span className="text-green-400 font-bold text-lg">
              ₹{event.gstEnabled 
                ? Math.round(event.price * (1 + event.gstPercent / 100)) 
                : event.price}
            </span>
          </div>
          {event.gstEnabled && (
            <div className="text-xs text-white/50">
              (Includes {event.gstPercent}% GST)
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
        <div className="text-xs text-blue-400 uppercase tracking-wider mb-2 font-bold">📋 Instructions</div>
        <ol className="space-y-2 text-sm text-white/70">
          <li className="flex items-start gap-2">
            <span className="text-blue-400 font-bold">1.</span>
            <span>Click the button below to open the payment form</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 font-bold">2.</span>
            <span>Fill in all required details in the Google Form</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 font-bold">3.</span>
            <span>Complete the payment as per instructions in the form</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 font-bold">4.</span>
            <span>Submit the form and return here to confirm</span>
          </li>
        </ol>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={handleOpenForm}
          className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-purple-500/50 flex items-center justify-center gap-3"
        >
          <ExternalLink className="w-5 h-5" />
          {event.googleFormPayment?.buttonText || 'Open Payment Form'}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="w-full px-6 py-3 bg-white/5 text-white/70 font-medium rounded-xl hover:bg-white/10 transition-all border border-white/10"
        >
          Cancel Registration
        </button>
      </div>

      {/* Help Text */}
      <div className="text-center">
        <p className="text-xs text-white/40">
          Having trouble? Contact the organizers at{' '}
          <a 
            href={`mailto:${event.organizer?.email || 'teamvortexnce@gmail.com'}`}
            className="text-vortex-blue hover:underline"
          >
            {event.organizer?.email || 'teamvortexnce@gmail.com'}
          </a>
        </p>
      </div>
    </div>
  );
};

export default GoogleFormPayment;
