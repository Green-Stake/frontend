'use client';

import Link from 'next/link';
import Image from 'next/image';
import bgImage from '../app/assets/background.png';
import BackToTopButton from './components/backtoTopButton';

export default function Home() {
  return (
    <>
      {/* =================== HERO SECTION =================== */}
      <div className="relative w-full min-h-screen overflow-x-hidden">
        {/* Background Image */}
        <Image
          src={bgImage}
          alt="Hero background"
          fill
          className="absolute inset-0 object-cover w-full z-0"
          priority
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 z-10" />

        {/* Hero Content */}
        <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-6 text-center">
          <div className="bg-white/10 backdrop-blur-md p-10 mt-10 rounded-2xl shadow-xl max-w-3xl w-full animate-fade-in mb-5">
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
              Support Sustainable Projects{' '}
              <span className="text-green-600">on Web3</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mb-10 max-w-2xl mx-auto drop-shadow-md">
              Join our decentralized platform to discover, fund, and govern impactful sustainability projects using blockchain.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/projects"
                className="inline-flex items-center justify-center px-6 py-3 rounded-2xl text-base font-medium text-white bg-gradient-to-r from-green-500 to-green-600 hover:brightness-110 transition-all shadow-md"
              >
                Explore Projects
                <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>

              <Link
                href="/dao"
                className="inline-flex items-center justify-center px-6 py-2 rounded-2xl text-base font-medium text-white bg-white/20 border border-green-300 hover:bg-white/30 transition-all"
              >
                Join DAO
                <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* =================== ABOUT SECTION =================== */}
      <section className="relative bg-white py-20 px-6 text-center w-full">
  <div className="relative z-10 max-w-6xl mx-auto space-y-8 animate-fade-in">
    <h2 className="text-3xl sm:text-4xl font-bold text-green-600 mb-4">About Us</h2>

    <p className="text-lg sm:text-xl text-gray-800">
      We’re a Web3-powered platform helping fund real-world sustainability projects through decentralized governance and transparent donations.
      From eco-initiatives and clean energy to community education and tech access, we connect changemakers with passionate supporters around the world.
    </p>

    <p className="text-lg sm:text-xl text-gray-800">
      Everything runs on blockchain — secure, transparent, and owned by the community. Together, we fund solutions that make the planet and society better.
    </p>

    {/* About Highlight Cards */}
    <div className="flex flex-col sm:flex-row justify-between gap-8 pt-10">
      <div className="bg-green-100 p-6 rounded-xl shadow-lg hover:scale-105 transition-all duration-300">
        <h3 className="text-xl text-green-700 font-semibold mb-4">Decentralized Governance</h3>
        <p className="text-green-900">
          DAO-driven decisions empower the community to fund impactful projects in a truly transparent and democratic way.
        </p>
      </div>

      <div className="bg-green-100 p-6 rounded-xl shadow-lg hover:scale-105 transition-all duration-300">
        <h3 className="text-xl text-green-700 font-semibold mb-4">Transparent Transactions</h3>
        <p className="text-green-900">
          Blockchain ensures that all funds and decisions are traceable, creating accountability and trust with every donation.
        </p>
      </div>
    </div>
  </div>
</section>


      {/* =================== HOW IT WORKS SECTION =================== */}
      <section className="relative bg-gradient-to-r from-green-500 to-blue-400 py-20 px-6 text-center w-full">
  <div className="absolute inset-0 bg-black/60 z-0" />

  <div className="relative z-10 max-w-6xl mx-auto space-y-12 animate-fade-in">
    <h2 className="text-3xl sm:text-4xl font-bold text-white">How It Works</h2>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mt-12 text-white">
      {[
        {
          title: 'Discover Projects',
          desc: 'Browse through vetted sustainability projects looking for community support and funding.',
        },
        {
          title: 'Fund or Donate',
          desc: 'Contribute directly using crypto — your funds go to a transparent smart contract pool.',
        },
        {
          title: 'Vote & Govern',
          desc: 'DAO members vote on which projects receive funding and monitor progress transparently.',
        },
        {
          title: 'Track Impact',
          desc: 'See how your support creates real-world change with updates and reports on project progress.',
        },
      ].map((step, i) => (
        <div
          key={i}
          className="flex flex-col items-center bg-white/30 backdrop-blur-md p-6 rounded-xl shadow-md hover:scale-105 transition duration-300"
        >
          <div className="bg-green-100 text-green-700 w-14 h-14 flex items-center justify-center rounded-full mb-4 text-2xl font-bold">
            {i + 1}
          </div>
          <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
          <p className="text-sm text-white/90">{step.desc}</p>
        </div>
      ))}
    </div>
  </div>
</section>

{/* =================== CTA SECTION =================== */}
<section className="w-full bg-white py-20 px-6 text-center text-black">
  <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
    <h2 className="text-4xl font-bold text-green-600 drop-shadow-sm">
      Join the Movement. Fund the Future.
    </h2>

    <p className="text-lg text-gray-700">
      Be a part of the change — support sustainability, govern with the DAO, and track real-world impact through the power of Web3.
    </p>

    <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
      <Link
        href="/projects"
        className="inline-flex items-center justify-center px-6 py-3 rounded-2xl text-base font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 hover:brightness-110 transition-all shadow-md"
      >
        Explore Projects
      </Link>

      <Link
        href="/dao"
        className="inline-flex items-center justify-center px-6 py-3 rounded-2xl text-base font-semibold text-green-600 bg-gray-100 hover:bg-gray-200 transition-all"
      >
        Join DAO
      </Link>
    </div>
  </div>
</section>

<BackToTopButton/>
<section className="bg-gray-100 py-20 px-6 text-center">
  <div className="max-w-6xl mx-auto space-y-12">
    <h2 className="text-3xl sm:text-4xl font-bold text-green-600">What People Are Saying</h2>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
      {[
        {
          name: 'Ada from Nigeria',
          quote: 'GreenStake helped us fund a solar classroom for our school. This is the future!',
        },
        {
          name: 'DAO Member - Zubair',
          quote: 'I get to help decide where impact happens. It’s real power in the hands of the people.',
        },
        {
          name: 'Elena, Clean Water Project',
          quote: 'We raised $5,000 in under 48 hours with total transparency!',
        },
      ].map((item, i) => (
        <div
          key={i}
          className="bg-white p-6 rounded-xl shadow-md text-left space-y-4"
        >
          <p className="text-gray-700">“{item.quote}”</p>
          <p className="text-sm text-green-600 font-semibold">{item.name}</p>
        </div>
      ))}
    </div>
  </div>
</section>


<footer className="bg-black text-white py-10 px-6">
  <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10">
    {/* Brand Info */}
    <div className="space-y-4">
      <h3 className="text-2xl font-bold text-green-500">GreenStake</h3>
      <p className="text-gray-400 text-sm leading-relaxed">
        Powering sustainable impact through blockchain. Transparent. Decentralized. Community-led.
      </p>
    </div>

    {/* Quick Links */}
    <div className="space-y-2">
      <h4 className="text-lg font-semibold text-white">Quick Links</h4>
      <ul className="space-y-2 text-sm">
        <li><a href="/about" className="hover:text-green-400 transition">About Us</a></li>
        <li><a href="/projects" className="hover:text-green-400 transition">Projects</a></li>
        <li><a href="/dao" className="hover:text-green-400 transition">DAO</a></li>
        <li><a href="/contact" className="hover:text-green-400 transition">Contact</a></li>
      </ul>
    </div>

    {/* Social & Contact */}
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-white">Connect With Us</h4>
      <div className="flex gap-4">
        {/* Replace # with your actual social links */}
        <a href="#" className="hover:text-green-400 transition" aria-label="Twitter">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 19c11 0 17-9 17-17v-1a12.4 12.4 0 0 0 3-3.3 11.5 11.5 0 0 1-3.3.9A5.8 5.8 0 0 0 28 0a11.6 11.6 0 0 1-3.7 1.4A5.8 5.8 0 0 0 14 6c0 .4 0 .7.1 1A16.5 16.5 0 0 1 1 1s-4 9 5 13a12 12 0 0 1-6.5-2v.2a5.8 5.8 0 0 0 4.6 5.7A6 6 0 0 1 1 17v.1c1.6 1 3.6 1.5 5.7 1.5z"/>
          </svg>
        </a>
        <a href="#" className="hover:text-green-400 transition" aria-label="Discord">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.3 4.3A19.5 19.5 0 0 0 16.5 3a14.8 14.8 0 0 0-.8 1.6 18.3 18.3 0 0 0-6.3 0A14.8 14.8 0 0 0 8.5 3a19.5 19.5 0 0 0-3.8 1.3 21.7 21.7 0 0 0-3.7 16.3 19.7 19.7 0 0 0 4.7 2.3c.4-.6.8-1.2 1.1-1.8a13.3 13.3 0 0 1-2.1-1c.2-.1.3-.2.5-.3a14.6 14.6 0 0 0 13.1 0c.2.1.4.2.5.3a13.3 13.3 0 0 1-2.1 1c.3.6.7 1.2 1.1 1.8a19.7 19.7 0 0 0 4.7-2.3 21.7 21.7 0 0 0-3.7-16.3zM9.5 15.5c-1.2 0-2.2-1-2.2-2.2S8.3 11 9.5 11s2.2 1 2.2 2.2-1 2.3-2.2 2.3zm5 0c-1.2 0-2.2-1-2.2-2.2s1-2.2 2.2-2.2 2.2 1 2.2 2.2-1 2.3-2.2 2.3z"/>
          </svg>
        </a>
        <a href="#" className="hover:text-green-400 transition" aria-label="Email">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 2v.01L12 13 4 6.01V6h16zM4 18V8l8 5 8-5v10H4z"/>
          </svg>
        </a>
      </div>
    </div>
  </div>

  {/* Bottom line */}
  <div className="mt-10 text-center text-xs text-gray-500 border-t border-gray-700 pt-6">
    &copy; {new Date().getFullYear()} GreenStake. All rights reserved.
  </div>
</footer>



    </>
  );
}
