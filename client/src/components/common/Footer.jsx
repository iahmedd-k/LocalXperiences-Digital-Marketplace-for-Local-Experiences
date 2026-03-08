import { Link } from 'react-router-dom'

const Footer = () => (
  <footer className="bg-gray-900 text-gray-400">
    <div className="max-w-7xl mx-auto px-6 pt-12 pb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-8 border-b border-gray-800">

        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="font-clash text-xl font-bold text-white">
            Local<span className="text-orange-500">X</span>periences
          </Link>
          <p className="text-sm mt-3 leading-relaxed max-w-xs">
            Discover, book, and share unique local experiences worldwide.
          </p>
        </div>

        <div>
          <h4 className="text-white text-sm font-bold mb-4">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/search"   className="hover:text-orange-500 transition-colors">Find Experiences</Link></li>
            <li><Link to="/search"   className="hover:text-orange-500 transition-colors">Top Cities</Link></li>
            <li><Link to="/search"   className="hover:text-orange-500 transition-colors">Categories</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-sm font-bold mb-4">Host</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/signup"         className="hover:text-orange-500 transition-colors">Become a Host</Link></li>
            <li><Link to="/host/dashboard" className="hover:text-orange-500 transition-colors">Host Dashboard</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-sm font-bold mb-4">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-orange-500 transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-orange-500 transition-colors">Blog</a></li>
            <li><a href="#" className="hover:text-orange-500 transition-colors">Contact</a></li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between pt-6 gap-4">
        <p className="text-xs">© 2026 LocalXperiences. All rights reserved.</p>
        <div className="flex gap-3">
          {['𝕏','in','ig','tk'].map((s) => (
            <a key={s} href="#" className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-xs hover:bg-orange-500 hover:text-white transition-all">{s}</a>
          ))}
        </div>
      </div>
    </div>
  </footer>
)

export default Footer