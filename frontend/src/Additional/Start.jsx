import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, Wallet, TrendingUp, Shield, BarChart3, ArrowRight } from "lucide-react";

function Start() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRegDropdownOpen, setIsRegDropdownOpen] = useState(false);
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleRegDropdown = () => setIsRegDropdownOpen(!isRegDropdownOpen);
  const toggleLoginDropdown = () => setIsLoginDropdownOpen(!isLoginDropdownOpen);

  const handleLinkClick = (e) => {
    e.preventDefault();
    // Do nothing as requested for footer links
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <div className="shrink-0">
              <span className="font-geist text-2xl font-semibold text-sky-600">PMTS</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {/* Registration Dropdown */}
              <div className="relative">
                <button
                  onClick={toggleRegDropdown}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-sky-600 transition-colors"
                >
                  Registration
                  <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${isRegDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isRegDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg">
                    <button
                      onClick={() => navigate("/register")}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      New registration
                    </button>
                    <button
                      onClick={() => navigate("/registrationinfo")}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Registration Status
                    </button>
                  </div>
                )}
              </div>

              {/* Login Dropdown */}
              <div className="relative">
                <button
                  onClick={toggleLoginDropdown}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors"
                >
                  Login
                  <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${isLoginDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isLoginDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-lg">
                    <button
                      onClick={() => navigate("/login")}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Admin
                    </button>
                    <button
                      onClick={() => navigate("/userlogin")}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      User
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="p-2 text-gray-700 hover:text-sky-600"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100">
            <div className="px-4 pt-2 pb-3 space-y-1">
              <button
                onClick={() => {
                  navigate("/register");
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                New Registration
              </button>
              <button
                onClick={() => {
                  navigate("/registrationinfo");
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Registration Status
              </button>
              <button
                onClick={() => {
                  navigate("/login");
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Admin Login
              </button>
              <button
                onClick={() => {
                  navigate("/userlogin");
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                User Login
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-geist text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
            Welcome to PMTS
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Your all-in-one solution for managing personal finances with clarity and control.
          </p>
          <button
            onClick={() => navigate("/register")}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-base font-medium text-white bg-sky-600 hover:bg-sky-700"
          >
            Get Started
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-geist text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to manage your finances
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple, powerful tools to track your money and make informed decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg border border-gray-100">
              <div className="w-12 h-12 bg-sky-50 rounded-lg flex items-center justify-center mb-4">
                <Wallet className="h-6 w-6 text-sky-600" />
              </div>
              <h3 className="font-geist text-xl font-semibold text-gray-900 mb-2">
                Expense Tracking
              </h3>
              <p className="text-gray-600">
                Track all your expenses effortlessly and categorize them for better insights.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg border border-gray-100">
              <div className="w-12 h-12 bg-sky-50 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-sky-600" />
              </div>
              <h3 className="font-geist text-xl font-semibold text-gray-900 mb-2">
                Budget Planning
              </h3>
              <p className="text-gray-600">
                Create and manage budgets to stay on track with your financial goals.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg border border-gray-100">
              <div className="w-12 h-12 bg-sky-50 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-sky-600" />
              </div>
              <h3 className="font-geist text-xl font-semibold text-gray-900 mb-2">
                Analytics & Reports
              </h3>
              <p className="text-gray-600">
                Visualize your financial data with comprehensive reports and charts.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-lg border border-gray-100">
              <div className="w-12 h-12 bg-sky-50 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-sky-600" />
              </div>
              <h3 className="font-geist text-xl font-semibold text-gray-900 mb-2">
                Secure & Private
              </h3>
              <p className="text-gray-600">
                Your financial data is encrypted and stored securely with enterprise-grade security.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Company */}
            <div>
              <h3 className="font-geist text-xs font-medium text-gray-900 mb-4 uppercase tracking-wider">Company</h3>
              <ul className="space-y-2">
                <li>
                  <button onClick={handleLinkClick} className="text-sm text-gray-600 hover:text-sky-600">
                    About
                  </button>
                </li>
                <li>
                  <button onClick={handleLinkClick} className="text-sm text-gray-600 hover:text-sky-600">
                    Blog
                  </button>
                </li>
                <li>
                  <button onClick={handleLinkClick} className="text-sm text-gray-600 hover:text-sky-600">
                    Careers
                  </button>
                </li>
              </ul>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-geist text-xs font-medium text-gray-900 mb-4 uppercase tracking-wider">Product</h3>
              <ul className="space-y-2">
                <li>
                  <button onClick={handleLinkClick} className="text-sm text-gray-600 hover:text-sky-600">
                    Features
                  </button>
                </li>
                <li>
                  <button onClick={handleLinkClick} className="text-sm text-gray-600 hover:text-sky-600">
                    Pricing
                  </button>
                </li>
                <li>
                  <button onClick={handleLinkClick} className="text-sm text-gray-600 hover:text-sky-600">
                    Documentation
                  </button>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-geist text-xs font-medium text-gray-900 mb-4 uppercase tracking-wider">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <button onClick={handleLinkClick} className="text-sm text-gray-600 hover:text-sky-600">
                    Help Center
                  </button>
                </li>
                <li>
                  <button onClick={handleLinkClick} className="text-sm text-gray-600 hover:text-sky-600">
                    Guides
                  </button>
                </li>
                <li>
                  <button onClick={handleLinkClick} className="text-sm text-gray-600 hover:text-sky-600">
                    Support
                  </button>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-geist text-xs font-medium text-gray-900 mb-4 uppercase tracking-wider">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <button onClick={handleLinkClick} className="text-sm text-gray-600 hover:text-sky-600">
                    Privacy
                  </button>
                </li>
                <li>
                  <button onClick={handleLinkClick} className="text-sm text-gray-600 hover:text-sky-600">
                    Terms
                  </button>
                </li>
                <li>
                  <button onClick={handleLinkClick} className="text-sm text-gray-600 hover:text-sky-600">
                    Security
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-600">
                © {new Date().getFullYear()} PMTS. All rights reserved.
              </p>
              <div className="mt-4 md:mt-0">
                <span className="font-geist text-sm font-semibold text-sky-600">PMTS</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Close dropdowns when clicking outside */}
      {(isRegDropdownOpen || isLoginDropdownOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsRegDropdownOpen(false);
            setIsLoginDropdownOpen(false);
          }}
        />
      )}
    </div>
  );
}

export default Start;
