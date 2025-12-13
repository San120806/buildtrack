import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Image as ImageIcon, 
  Menu, 
  X, 
  ArrowRight, 
  Building2, 
  Package, 
  AlertTriangle,
  FileBarChart,
  Bell,
  Hammer,
  HardHat,
  Users
} from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

// --- CAROUSEL COMPONENTS ---
const DRAG_BUFFER = 0;
const VELOCITY_THRESHOLD = 500;
const GAP = 16;
const SPRING_OPTIONS = { type: 'spring', stiffness: 300, damping: 30 };

function CarouselItem({ item, index, itemWidth, round, trackItemOffset, x, transition }) {
  const range = [-(index + 1) * trackItemOffset, -index * trackItemOffset, -(index - 1) * trackItemOffset];
  const outputRange = [90, 0, -90];
  const rotateY = useTransform(x, range, outputRange, { clamp: false });

  return (
    <motion.div
      key={`${item?.id ?? index}-${index}`}
      className={`carousel-item ${round ? 'round' : ''}`}
      style={{
        width: itemWidth,
        height: round ? itemWidth : '100%',
        rotateY: rotateY,
        ...(round && { borderRadius: '50%' })
      }}
      transition={transition}
    >
      <div className={`carousel-item-header ${round ? 'round' : ''}`}>
        <span className="carousel-icon-container">{item.icon}</span>
      </div>
      <div className="carousel-item-content">
        <div className="carousel-item-title">{item.title}</div>
        <p className="carousel-item-description">{item.description}</p>
        <div className="mt-4 text-xs text-blue-300 font-mono">{item.role}</div>
      </div>
    </motion.div>
  );
}

function Carousel({
  items,
  baseWidth = 300,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = false,
  loop = false,
  round = false
}) {
  const containerPadding = 16;
  const itemWidth = baseWidth - containerPadding * 2;
  const trackItemOffset = itemWidth + GAP;
  const itemsForRender = loop && items.length > 0 
    ? [items[items.length - 1], ...items, items[0]] 
    : items;

  const [position, setPosition] = useState(loop ? 1 : 0);
  const x = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!autoplay || itemsForRender.length <= 1 || (pauseOnHover && isHovered)) return;

    const timer = setInterval(() => {
      setPosition(prev => Math.min(prev + 1, itemsForRender.length - 1));
    }, autoplayDelay);

    return () => clearInterval(timer);
  }, [autoplay, autoplayDelay, isHovered, pauseOnHover, itemsForRender.length]);

  useEffect(() => {
    const startingPosition = loop ? 1 : 0;
    setPosition(startingPosition);
    x.set(-startingPosition * trackItemOffset);
  }, [items.length, loop, trackItemOffset, x]);

  const effectiveTransition = isJumping ? { duration: 0 } : SPRING_OPTIONS;

  const handleAnimationComplete = () => {
    if (!loop || itemsForRender.length <= 1) {
      setIsAnimating(false);
      return;
    }
    
    if (position === itemsForRender.length - 1) {
      setIsJumping(true);
      const target = 1;
      setPosition(target);
      x.set(-target * trackItemOffset);
      requestAnimationFrame(() => {
        setIsJumping(false);
        setIsAnimating(false);
      });
      return;
    }

    if (position === 0) {
      setIsJumping(true);
      const target = items.length;
      setPosition(target);
      x.set(-target * trackItemOffset);
      requestAnimationFrame(() => {
        setIsJumping(false);
        setIsAnimating(false);
      });
      return;
    }

    setIsAnimating(false);
  };

  const handleDragEnd = (_, info) => {
    const { offset, velocity } = info;
    const direction =
      offset.x < -DRAG_BUFFER || velocity.x < -VELOCITY_THRESHOLD ? 1
        : offset.x > DRAG_BUFFER || velocity.x > VELOCITY_THRESHOLD ? -1
        : 0;

    if (direction === 0) return;

    setPosition(prev => {
      const next = prev + direction;
      const max = itemsForRender.length - 1;
      return Math.max(0, Math.min(next, max));
    });
  };

  const dragProps = loop ? {} : {
    dragConstraints: {
      left: -trackItemOffset * Math.max(itemsForRender.length - 1, 0),
      right: 0
    }
  };

  const activeIndex = items.length === 0 ? 0 : loop ? (position - 1 + items.length) % items.length : Math.min(position, items.length - 1);

  return (
    <div
      className={`carousel-container ${round ? 'round' : ''}`}
      style={{
        width: '100%',
        maxWidth: `${baseWidth * 3}px`,
        margin: '0 auto',
        ...(round && { height: `${baseWidth}px`, borderRadius: '50%' })
      }}
      onMouseEnter={() => pauseOnHover && setIsHovered(true)}
      onMouseLeave={() => pauseOnHover && setIsHovered(false)}
    >
      <motion.div
        className="carousel-track"
        drag={isAnimating ? false : 'x'}
        {...dragProps}
        style={{
          width: itemWidth,
          gap: `${GAP}px`,
          perspective: 1000,
          perspectiveOrigin: `${position * trackItemOffset + itemWidth / 2}px 50%`,
          x
        }}
        onDragEnd={handleDragEnd}
        animate={{ x: -(position * trackItemOffset) }}
        transition={effectiveTransition}
        onAnimationStart={() => setIsAnimating(true)}
        onAnimationComplete={handleAnimationComplete}
      >
        {itemsForRender.map((item, index) => (
          <CarouselItem
            key={`${item?.id ?? index}-${index}`}
            item={item}
            index={index}
            itemWidth={itemWidth}
            round={round}
            trackItemOffset={trackItemOffset}
            x={x}
            transition={effectiveTransition}
          />
        ))}
      </motion.div>
      <div className={`carousel-indicators-container ${round ? 'round' : ''}`}>
        <div className="carousel-indicators">
          {items.map((_, index) => (
            <motion.div
              key={index}
              className={`carousel-indicator ${activeIndex === index ? 'active' : 'inactive'}`}
              animate={{ scale: activeIndex === index ? 1.2 : 1 }}
              onClick={() => setPosition(loop ? index + 1 : index)}
              transition={{ duration: 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// --- MAIN LANDING PAGE ---
const LandingPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const colors = {
    navyDark: '#03045E',
    navy: '#023E8A',
    blueMedium: '#0077B6',
    blueSky: '#0096C7',
    blueBright: '#00B4D8',
    cyan: '#48CAE4',
    cyanLight: '#90E0EF',
    bluePale: '#ADE8F4',
    whiteIce: '#CAF0F8',
  };

  const feedbackItems = [
    {
      id: 1,
      title: 'Ar. Rajesh Verma',
      description: 'BuildTrack transformed how we handle milestone approvals. No more endless email chains—just clear, visual confirmations.',
      role: 'Senior Architect',
      icon: <Building2 className="carousel-icon" />
    },
    {
      id: 2,
      title: 'Amit Patel',
      description: 'The low-stock alerts are a lifesaver. We haven\'t had a single site stoppage due to cement or steel shortages since switching.',
      role: 'General Contractor',
      icon: <Hammer className="carousel-icon" />
    },
    {
      id: 3,
      title: 'Sarah D\'Souza',
      description: 'Seeing the daily budget vs actual spend in real-time gives me complete peace of mind. The transparency is unmatched.',
      role: 'Property Developer',
      icon: <FileBarChart className="carousel-icon" />
    },
    {
      id: 4,
      title: 'Vikram Singh',
      description: 'The mobile daily logs for my site supervisors have saved us 10+ hours of admin work every week.',
      role: 'Site Manager',
      icon: <HardHat className="carousel-icon" />
    },
    {
      id: 5,
      title: 'Priya Sharma',
      description: 'Finally, a dashboard that my clients can understand. It makes explaining project delays or budget changes so much easier.',
      role: 'Client Liaison',
      icon: <Users className="carousel-icon" />
    }
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <FileBarChart className="w-8 h-8" style={{ color: colors.blueBright }} />,
      title: "Project Status Tracking",
      description: "Monitor overall completion percentage in real-time. Track daily progress against the estimated timeline."
    },
    {
      icon: <Building2 className="w-8 h-8" style={{ color: colors.blueBright }} />,
      title: "Contractor Management",
      description: "Centralized logs for daily reports and site activity. Keep contractors aligned with the master schedule."
    },
    {
      icon: <CheckSquare className="w-8 h-8" style={{ color: colors.blueBright }} />,
      title: "Architect Milestones",
      description: "Streamlined milestone reviews and approvals. Ensure design integrity before moving to the next phase."
    },
    {
      icon: <Package className="w-8 h-8" style={{ color: colors.blueBright }} />,
      title: "Inventory Control",
      description: "Live inventory tracking with automated low-stock alerts. Prevent delays caused by material shortages."
    }
  ];

  return (
    <div className="min-h-screen font-sans text-slate-800 bg-slate-50">
      <style>{`
        .carousel-container {
          position: relative;
          overflow: hidden;
          padding: 16px;
          --outer-r: 24px;
          --p-distance: 12px;
        }

        .carousel-track {
          display: flex;
          padding-left: 20px;
        }

        .carousel-item {
          position: relative;
          display: flex;
          flex-shrink: 0;
          flex-direction: column;
          align-items: flex-start;
          justify-content: space-between;
          border: 1px solid #334155;
          border-radius: calc(var(--outer-r) - var(--p-distance));
          background-color: #1e293b;
          overflow: hidden;
          cursor: grab;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .carousel-item:active {
          cursor: grabbing;
        }

        .carousel-item-header {
          margin-bottom: 8px;
          padding: 20px;
          padding-top: 20px;
        }

        .carousel-icon-container {
          display: flex;
          height: 40px;
          width: 40px;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background-color: ${colors.blueSky};
        }

        .carousel-icon {
          height: 20px;
          width: 20px;
          color: #fff;
        }

        .carousel-item-content {
          padding: 20px;
          padding-top: 0;
        }

        .carousel-item-title {
          margin-bottom: 4px;
          font-weight: 700;
          font-size: 18px;
          color: #fff;
        }

        .carousel-item-description {
          font-size: 14px;
          color: #94a3b8;
          line-height: 1.5;
        }

        .carousel-indicators-container {
          display: flex;
          width: 100%;
          justify-content: center;
          margin-top: 20px;
        }

        .carousel-indicators {
          display: flex;
          gap: 12px;
        }

        .carousel-indicator {
          height: 8px;
          width: 8px;
          border-radius: 50%;
          cursor: pointer;
          transition: background-color 150ms;
        }

        .carousel-indicator.active {
          background-color: ${colors.blueBright};
        }

        .carousel-indicator.inactive {
          background-color: #475569;
        }
      `}</style>

      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-4' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg" style={{ backgroundColor: colors.navy }}>
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight" style={{ color: colors.navyDark }}>
              BuildTrack
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Solutions', 'About'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`}
                className="font-medium hover:text-blue-600 transition-colors"
                style={{ color: colors.navyDark }}
              >
                {item}
              </a>
            ))}
          </div>

          <button 
            className="md:hidden p-2 text-slate-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white shadow-xl py-8 px-6 flex flex-col gap-6 md:hidden border-t border-slate-100">
            {['Features', 'Solutions', 'About'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-lg font-medium text-slate-700">{item}</a>
            ))}
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full opacity-10 blur-3xl -translate-y-1/2 translate-x-1/4" style={{ backgroundColor: colors.blueSky }}></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl translate-y-1/3 -translate-x-1/4" style={{ backgroundColor: colors.cyan }}></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            <div className="lg:w-5/12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-8 text-sm font-semibold border" style={{ borderColor: colors.bluePale, backgroundColor: 'white', color: colors.navy }}>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                v2.4 Live: Improved Architect Workflows
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6 text-slate-900">
                Building control, <br/>
                <span style={{ color: colors.blueSky }}>simplified.</span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                The complete operating system for modern construction. Track progress, manage inventory, and streamline milestone reviews between architects and contractors.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => navigate('/register')}
                  className="px-8 py-4 rounded-xl font-bold text-white text-lg flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-900/10 hover:shadow-blue-900/20 hover:scale-105"
                  style={{ backgroundColor: colors.navyDark }}
                >
                  Sign Up Free <ArrowRight className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => navigate('/login')}
                  className="px-8 py-4 rounded-xl font-bold border border-slate-200 bg-white text-lg flex items-center justify-center gap-2 transition-all hover:bg-slate-50 text-slate-700"
                >
                  Login
                </button>
              </div>
            </div>

            {/* Dashboard Mockup */}
            <div className="lg:w-7/12 relative">
              <div className="relative rounded-xl shadow-2xl bg-slate-50 border border-slate-200 overflow-hidden transform hover:scale-[1.02] transition-all duration-700">
                
                <div className="bg-white border-b border-slate-200 p-4 flex justify-between items-center">
                   <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white">
                        <LayoutDashboard size={18} />
                      </div>
                      <span className="font-bold text-slate-800">BuildTrack</span>
                   </div>
                   <div className="flex items-center gap-4">
                      <Bell className="text-slate-500 w-5 h-5" />
                      <div className="flex items-center gap-2 text-right">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">D</div>
                        <div className="hidden sm:block">
                          <div className="font-bold text-slate-800 text-xs">disha</div>
                          <div className="text-slate-400 text-[10px] uppercase">Architect</div>
                        </div>
                      </div>
                   </div>
                </div>

                <div className="flex">
                  <div className="w-56 bg-white border-r border-slate-200 hidden md:block min-h-[500px] p-4">
                    <div className="space-y-1">
                      {[
                        { icon: <LayoutDashboard size={16}/>, label: 'Dashboard', active: true },
                        { icon: <FolderKanban size={16}/>, label: 'Projects', active: false },
                        { icon: <CheckSquare size={16}/>, label: 'Milestone Reviews', active: false },
                        { icon: <ImageIcon size={16}/>, label: 'Photo Gallery', active: false },
                      ].map((item, i) => (
                        <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${item.active ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}>
                          {item.icon}
                          {item.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 p-6 bg-slate-50 font-sans">
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-slate-800">Welcome back, disha!</h3>
                      <p className="text-sm text-slate-500">Here's what's happening with your projects today.</p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-semibold text-slate-500">Total Projects</span>
                          <div className="p-1 rounded bg-blue-50 text-blue-600"><FolderKanban size={14}/></div>
                        </div>
                        <div className="text-2xl font-bold text-slate-800">1</div>
                        <div className="text-xs text-slate-400 mt-1">1 active</div>
                        <div className="text-xs text-blue-500 mt-2 font-medium">View details →</div>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-semibold text-slate-500">Total Budget</span>
                          <div className="p-1 rounded bg-emerald-50 text-emerald-600"><span className="font-bold text-xs">₹</span></div>
                        </div>
                        <div className="text-2xl font-bold text-slate-800">₹5,00,000</div>
                        <div className="text-xs text-slate-400 mt-1">70% utilized</div>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-semibold text-slate-500">Pending Milestones</span>
                          <div className="p-1 rounded bg-amber-50 text-amber-600"><CheckSquare size={14}/></div>
                        </div>
                        <div className="text-2xl font-bold text-slate-800">1</div>
                        <div className="text-xs text-slate-400 mt-1">0 awaiting approval</div>
                      </div>

                       <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-semibold text-slate-500">Low Stock Alerts</span>
                          <div className="p-1 rounded bg-red-50 text-red-600"><AlertTriangle size={14}/></div>
                        </div>
                        <div className="text-2xl font-bold text-slate-800">0</div>
                        <div className="text-xs text-slate-400 mt-1">Items need attention</div>
                        <div className="text-xs text-blue-500 mt-2 font-medium">View details →</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                        <h4 className="font-bold text-slate-800 mb-6 text-sm">Budget Overview</h4>
                        <div className="flex items-end gap-8 h-40 px-4 border-l border-b border-slate-100 relative ml-6">
                          <div className="absolute -left-10 top-0 text-[10px] text-slate-400 h-full flex flex-col justify-between py-0">
                             <span>₹6.00L</span>
                             <span>₹4.50L</span>
                             <span>₹3.00L</span>
                             <span>₹1.50L</span>
                             <span>₹0</span>
                          </div>
                          
                          <div className="w-1/3 bg-blue-300 h-[80%] relative group"></div>
                          <div className="w-1/3 bg-blue-600 h-[55%] relative group"></div>
                        </div>
                        <div className="text-center mt-2 text-xs text-slate-500">spark project</div>
                        <div className="flex justify-center gap-6 mt-4 text-xs font-medium">
                           <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-blue-300 rounded-sm"></div> <span className="text-blue-300">Estimated</span>
                           </div>
                           <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-blue-600 rounded-sm"></div> <span className="text-blue-600">Actual</span>
                           </div>
                        </div>
                      </div>

                      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                         <h4 className="font-bold text-slate-800 mb-4 text-sm">Recent Activity</h4>
                         <div className="space-y-4">
                            <div className="flex gap-3 items-start">
                               <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                  <FileBarChart size={14} className="text-slate-500"/>
                               </div>
                               <div>
                                  <div className="text-sm font-semibold text-slate-800">spark project</div>
                                  <div className="text-xs text-slate-400">Report by pooja - 11/12/2025</div>
                               </div>
                            </div>
                            <div className="w-full h-px bg-slate-50"></div>
                            <div className="text-xs text-blue-600 font-medium cursor-pointer hover:underline">
                               View all reports →
                            </div>
                         </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white relative">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-900">End-to-End Construction Management</h2>
            <p className="text-slate-600 text-lg">From the first milestone to final handover, keep your team, materials, and budget in perfect sync.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all duration-300 hover:shadow-lg group"
              >
                <div className="mb-6 p-4 rounded-xl bg-white shadow-sm group-hover:bg-blue-50 transition-colors inline-block">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-3 text-slate-800">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deep Dive Section */}
      <section className="py-24 overflow-hidden" style={{ backgroundColor: colors.whiteIce }}>
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="md:w-1/2">
               <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 rotate-1 hover:rotate-0 transition-transform duration-500">
                  <div className="flex justify-between items-center mb-6">
                     <div>
                        <h3 className="text-xl font-bold text-slate-800">Spark 5floor Building</h3>
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium">In Progress</span>
                     </div>
                     <button className="text-sm border border-slate-300 px-3 py-1 rounded text-slate-600">Edit Project</button>
                  </div>
                  
                  <div className="mb-6">
                     <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold text-slate-700">Overall Completion</span>
                        <span className="font-bold text-blue-600">35%</span>
                     </div>
                     <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 w-[35%] rounded-full"></div>
                     </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                         <div className="text-xs text-slate-500 mb-1">Budget</div>
                         <div className="font-bold text-slate-800">₹5,00,000</div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                         <div className="text-xs text-slate-500 mb-1">Milestones</div>
                         <div className="font-bold text-slate-800">2</div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                         <div className="text-xs text-slate-500 mb-1">Days Left</div>
                         <div className="font-bold text-slate-800">908</div>
                      </div>
                  </div>

                  <div className="space-y-3">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">A</div>
                        <div>
                           <div className="text-sm font-semibold text-slate-700">Ajay Kapure</div>
                           <div className="text-xs text-slate-400">Client</div>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">P</div>
                        <div>
                           <div className="text-sm font-semibold text-slate-700">Pooja</div>
                           <div className="text-xs text-slate-400">Contractor</div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="md:w-1/2">
              <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-slate-900">
                Seamless Collaboration for <br/>
                <span style={{ color: colors.blueSky }}>Architects & Contractors</span>
              </h2>
              <p className="text-slate-600 text-lg mb-8">
                Break down the silos. Give your team a single source of truth for timelines, budgets, and daily site reports.
              </p>
              
              <ul className="space-y-4">
                {[
                  "Visual progress tracking with photo galleries",
                  "Automated daily reporting for contractors",
                  "Real-time material consumption logs",
                  "Client-facing dashboard views"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="rounded-full p-1 bg-white text-blue-500 shadow-sm">
                      <CheckSquare className="w-4 h-4" />
                    </div>
                    <span className="text-base font-medium text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feedback Carousel */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full opacity-10 blur-3xl translate-x-1/3 -translate-y-1/3"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Trusted by Industry Leaders</h2>
            <p className="text-slate-400">See what construction professionals are saying about BuildTrack.</p>
          </div>

          <div className="flex justify-center w-full min-h-[400px]">
            <Carousel 
              items={feedbackItems} 
              baseWidth={320} 
              autoplay={true} 
              autoplayDelay={4000}
              loop={true}
              pauseOnHover={true}
            />
          </div>

          <div className="mt-20 text-center border-t border-slate-800 pt-16">
             <h3 className="text-2xl lg:text-3xl font-bold mb-8 text-white">Ready to streamline your builds?</h3>
             <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button 
                  onClick={() => navigate('/register')}
                  className="px-8 py-4 rounded-xl font-bold text-slate-900 text-lg hover:shadow-lg transition-all transform hover:-translate-y-1"
                  style={{ backgroundColor: colors.cyan }}
                >
                  Sign Up Now
                </button>
                <button 
                  onClick={() => navigate('/login')}
                  className="px-8 py-4 rounded-xl font-bold text-lg border-2 border-slate-700 text-white hover:bg-slate-800 transition-all"
                >
                  Login to Dashboard
                </button>
             </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-950 text-slate-500 text-sm">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
               <span className="font-bold text-slate-300 text-lg">BuildTrack</span>
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
