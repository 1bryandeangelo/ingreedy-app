import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service – Ingreedie',
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-400 mb-8">Last updated: February 28, 2026</p>

      <div className="prose prose-gray max-w-none text-gray-700 space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">1. Acceptance of Terms</h2>
          <p>By accessing or using Ingreedie ((&ldquo;the Service&rdquo;)), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">2. Description of Service</h2>
          <p>Ingreedie is a pantry management and recipe discovery application that helps users track their ingredients, find recipes based on what they have, and reduce food waste. The Service includes pantry tracking, recipe suggestions, shopping list management, and related features.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">3. User Accounts</h2>
          <p>You must create an account to use Ingreedie. You are responsible for maintaining the security of your account credentials. You are responsible for all activity that occurs under your account. You must provide accurate information when creating your account.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">4. Acceptable Use</h2>
          <p>You agree not to misuse the Service. This includes but is not limited to: attempting to gain unauthorized access to the Service or its systems, using the Service to transmit harmful or malicious content, interfering with other users&apos; access to the Service, and using automated tools to scrape or extract data from the Service.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">5. Recipe and Nutritional Information</h2>
          <p>Recipes and nutritional data provided through Ingreedie are sourced from third-party providers and user-submitted content. Ingreedie does not guarantee the accuracy, completeness, or safety of any recipe or nutritional information. Users with food allergies or dietary restrictions should independently verify ingredient lists and nutritional content. Ingreedie is not responsible for any adverse reactions or health issues resulting from recipes accessed through the Service.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">6. Intellectual Property</h2>
          <p>The Ingreedie application, including its design, code, and branding, is owned by Ingreedie. Recipes displayed in the Service may be owned by their respective creators and sources. Your pantry data, shopping lists, and preferences remain your property.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">7. Availability and Modifications</h2>
          <p>We strive to keep Ingreedie available at all times but do not guarantee uninterrupted access. We may modify, suspend, or discontinue any part of the Service at any time. We may update these terms from time to time and will notify users of material changes.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">8. Limitation of Liability</h2>
          <p>Ingreedie is provided &ldquo;as is&rdquo; without warranties of any kind, either express or implied. To the fullest extent permitted by law, Ingreedie shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">9. Termination</h2>
          <p>You may stop using the Service at any time. We reserve the right to suspend or terminate accounts that violate these terms. Upon termination, your right to use the Service ceases immediately.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">10. Governing Law</h2>
          <p>These terms shall be governed by the laws of the United States. Any disputes shall be resolved in the appropriate courts.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">11. Contact</h2>
          <p>If you have questions about these terms, contact us at hello@ingreedie.com.</p>
        </section>
      </div>
    </div>
  );
}
