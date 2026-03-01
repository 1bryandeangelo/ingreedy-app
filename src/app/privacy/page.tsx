import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy – Ingreedie',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-400 mb-8">Last updated: February 28, 2026</p>

      <div className="prose prose-gray max-w-none text-gray-700 space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">1. Information We Collect</h2>
          <p>When you use Ingreedie, we collect the following information:</p>
          <p><strong>Account information:</strong> Your email address and name when you sign up directly or through Google Sign-In.</p>
          <p><strong>Pantry data:</strong> Ingredients, quantities, units, and expiration dates you add to your pantry.</p>
          <p><strong>Shopping list data:</strong> Items you add to your shopping list, including recipe associations.</p>
          <p><strong>Usage data:</strong> Recipes you view, dismiss, or add to your shopping list.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">2. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <p>Provide and maintain the Ingreedie service, including pantry tracking, recipe suggestions, and shopping list features. Personalize recipe recommendations based on your pantry contents and preferences. Improve our service and develop new features. Communicate with you about your account or service updates.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">3. Data Storage and Security</h2>
          <p>Your data is stored securely using Supabase, which provides enterprise-grade security with row-level access controls. Only you can access your pantry, shopping list, and recipe preferences. We use HTTPS encryption for all data transmitted between your device and our servers.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">4. Third-Party Services</h2>
          <p>Ingreedie uses the following third-party services:</p>
          <p><strong>Supabase:</strong> Database and authentication hosting.</p>
          <p><strong>Google Sign-In:</strong> Optional authentication method. Google receives your authentication request but does not receive your pantry or recipe data.</p>
          <p><strong>Edamam API:</strong> Recipe search and nutritional data. Search queries based on your ingredients are sent to Edamam to find matching recipes. No personally identifiable information is shared.</p>
          <p><strong>Render:</strong> Application hosting.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">5. Data Sharing</h2>
          <p>We do not sell, rent, or share your personal information with third parties for marketing purposes. We only share data with the third-party services listed above as necessary to provide the Ingreedie service.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">6. Your Rights</h2>
          <p>You can access, update, or delete your pantry data at any time through the app. You can delete your account by contacting us. Upon account deletion, all associated data will be permanently removed.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">7. Cookies</h2>
          <p>Ingreedie uses essential cookies for authentication and session management. We do not use tracking cookies or third-party advertising cookies.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">8. Children</h2>
          <p>Ingreedie is not directed at children under 13. We do not knowingly collect personal information from children under 13.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">9. Changes to This Policy</h2>
          <p>We may update this privacy policy from time to time. We will notify you of any material changes by updating the date at the top of this page.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">10. Contact</h2>
          <p>If you have questions about this privacy policy, contact us at hello@ingreedie.com.</p>
        </section>
      </div>
    </div>
  );
}
