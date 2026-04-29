export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-16">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 px-6">

        <div>
          <h3 className="text-white font-bold mb-2">FranchiFi</h3>
          <p className="text-sm">
            Smart franchise marketplace connecting investors and Franchisors.
          </p>
        </div>

        <div>
          <h4 className="text-white mb-2 font-semibold">Platform</h4>
          <ul className="text-sm space-y-1">
            <li>Marketplace</li>
            <li>Analytics</li>
            <li>Verification</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white mb-2 font-semibold">Company</h4>
          <ul className="text-sm space-y-1">
            <li>About</li>
            <li>Careers</li>
            <li>Contact</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white mb-2 font-semibold">Legal</h4>
          <ul className="text-sm space-y-1">
            <li>Privacy</li>
            <li>Terms</li>
          </ul>
        </div>

      </div>

      <p className="text-center text-xs mt-10 text-gray-500">
        © 2025 FranchiFi. All rights reserved.
      </p>
    </footer>
  );
}
