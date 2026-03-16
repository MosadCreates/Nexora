import React from 'react';
import { BackgroundBeams } from './ui/aceternity/background-beams';
import { Highlight } from './ui/aceternity/hero-highlight';
import { motion } from 'framer-motion';

export const Refund: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-black pt-20 relative overflow-hidden">
      <BackgroundBeams className="absolute inset-0 z-0" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        <header className="mb-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-black dark:text-white mb-4">
            <Highlight className="text-black dark:text-white from-blue-500/20 to-indigo-500/20 dark:from-blue-500/30 dark:to-indigo-500/30">
              REFUND POLICY
            </Highlight>
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 font-medium">
            Last Updated: February 13, 2026
          </p>
        </header>

        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="prose dark:prose-invert max-w-none"
        >
          <section>
            <h2>1. General Policy</h2>
            <p>
              At <strong>Nexora Intelligence</strong>, we strive to provide the highest quality AI-powered competitive intelligence. Due to the high compute costs associated with running our specialized agent swarms and the immediate delivery of strategic foresight, we generally do not offer refunds once credits have been consumed.
            </p>
          </section>

          <section>
            <h2>2. Subscription Cancellations</h2>
            <p>
              You can cancel your subscription at any time via your Profile settings or the Polar.sh billing portal. Upon cancellation:
            </p>
            <ul>
              <li>You will retain access to your remaining credits until the end of the current billing cycle.</li>
              <li>No further charges will be applied to your account.</li>
              <li>Cancellations do not trigger an automatic refund of the current billing period's fees.</li>
            </ul>
          </section>

          <section>
            <h2>3. Exceptions & Disputes</h2>
            <p>
              While our standard policy is no-refunds, we value our customers and will consider refund requests on a case-by-case basis in the following scenarios:
            </p>
            <ul>
              <li><strong>Technical Failures:</strong> If a persistent system error prevented you from accessing the service for more than 48 hours.</li>
              <li><strong>Billing Errors:</strong> Proven cases of duplicate billing or incorrect plan charges.</li>
              <li><strong>Model Unavailability:</strong> Prolonged downtime of our core intelligence models that significantly impacted service delivery.</li>
            </ul>
          </section>

          <section>
            <h2>4. Refund Requests</h2>
            <p>
              To request a refund review, please contact <strong>support@nexora.ai</strong> within 7 days of the billing event. Please include your account email, the date of the transaction, and a detailed explanation of the issue.
            </p>
          </section>

          <section>
            <h2>5. Process</h2>
            <p>
              Approved refunds will be processed via our payment partner, Polar.sh, and may take 5-10 business days to appear on your original payment method.
            </p>
          </section>

          <section className="mt-16 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 backdrop-blur-xl">
            <h3 className="mt-0">Need Assistance?</h3>
            <p className="mb-0">
              Our support team is here to help you maximize the value of your strategic credits. Reach out if you're experiencing any friction with your intelligence reports.
            </p>
          </section>
        </motion.article>
      </div>
    </div>
  );
};

export default Refund;
