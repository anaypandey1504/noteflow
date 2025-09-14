'use client';

import { useState } from 'react';
import { CreditCard, Check, Star, Zap, Shield, Users } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  userRole: string;
}

export default function UpgradeModal({ isOpen, onClose, onUpgrade, userRole }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Plan selection, 2: Payment, 3: Success

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      await onUpgrade();
      setStep(3);
    } catch (error) {
      console.error('Upgrade failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {step === 1 && (
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold gradient-text mb-2">Upgrade to Pro</h2>
              <p className="text-gray-600">Unlock unlimited potential for your team</p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">Pro Plan</h3>
                <div className="text-right">
                  <div className="text-4xl font-bold gradient-text">$2,000</div>
                  <div className="text-sm text-gray-500">one-time payment</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <Zap className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-700">Unlimited Notes</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Advanced Security</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-purple-500" />
                  <span className="text-gray-700">Priority Support</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start space-x-3">
                <Check className="w-6 h-6 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">Unlimited Notes</h4>
                  <p className="text-gray-600">Create as many notes as your team needs</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-6 h-6 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">Advanced Analytics</h4>
                  <p className="text-gray-600">Detailed insights into your team's productivity</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-6 h-6 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">24/7 Priority Support</h4>
                  <p className="text-gray-600">Get help when you need it most</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-6 h-6 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">Advanced Integrations</h4>
                  <p className="text-gray-600">Connect with your favorite tools</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={onClose}
                className="btn-secondary flex-1"
              >
                Maybe Later
              </button>
              <button
                onClick={() => setStep(2)}
                className="btn-primary flex-1"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold gradient-text mb-2">Complete Your Payment</h2>
              <p className="text-gray-600">Secure payment powered by Stripe</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-gray-900">Pro Plan</span>
                <span className="text-2xl font-bold gradient-text">$2,000</span>
              </div>
              <div className="text-sm text-gray-500">One-time payment • No recurring charges</div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900">Secure Payment</h4>
                  <p className="text-blue-700 text-sm">Your payment information is encrypted and secure</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setStep(1)}
                className="btn-secondary flex-1"
              >
                Back
              </button>
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="btn-success flex-1"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  'Pay $2,000'
                )}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-slow">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold gradient-text mb-4">Payment Successful!</h2>
            <p className="text-gray-600 mb-8">Your team has been upgraded to Pro. Enjoy unlimited notes and all premium features!</p>
            
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8">
              <h4 className="font-semibold text-green-900 mb-2">What's Next?</h4>
              <ul className="text-green-700 text-sm space-y-1">
                <li>• Create unlimited notes</li>
                <li>• Access to advanced features</li>
                <li>• Priority customer support</li>
              </ul>
            </div>

            <button
              onClick={() => {
                setStep(1);
                onClose();
              }}
              className="btn-primary w-full"
            >
              Start Using Pro Features
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
