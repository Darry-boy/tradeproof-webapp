
import { Link, NavLink, Route, Routes, useParams } from "react-router-dom";
import { supabase } from "./supabase";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Search,
  MapPin,
  Store,
  UserRound,
  ArrowRight,
  Menu,
  X,
  ShieldCheck,
  Scissors,
  Smartphone,
  Wrench,
  Shirt,
  CookingPot,
  PlugZap,
  Sparkles,
  Star, 
  Image, 
  Pencil, 
  Eye
} from "lucide-react";
import { useState, useEffect } from "react";
import "./App.css";



function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Session error:", error.message);
      }

      if (mounted) {
        setUser(data?.session?.user ?? null);
        setCheckingAuth(false);
      }
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setCheckingAuth(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function checkAdminAccess() {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc("is_tradeproof_admin");
        if (error) throw error;
        if (active) setIsAdmin(data === true);
      } catch (error) {
        console.error("Admin navigation check failed:", error.message);
        if (active) setIsAdmin(false);
      }
    }

    checkAdminAccess();
    return () => { active = false; };
  }, [user]);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error.message);
      return;
    }

    setMenuOpen(false);
    window.location.href = "/";
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <div className="container nav-container">
        <Link to="/" className="brand" onClick={closeMenu}>
          <span className="brand-icon">
            <Store size={23} />
          </span>
          <span>TradeProof</span>
        </Link>

        <button
          className="menu-toggle"
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>

        <nav className={menuOpen ? "nav-links open" : "nav-links"}>
          <NavLink to="/" onClick={closeMenu}>
            Home
          </NavLink>

          <NavLink to="/search" onClick={closeMenu}>
            Explore businesses
          </NavLink>

          {!checkingAuth && (
            <>
              {user ? (
                <>
                  <NavLink to="/profile" onClick={closeMenu}>
                    Profile
                  </NavLink>

                  {isAdmin && (
                    <NavLink to="/admin" onClick={closeMenu}>
                      Admin
                    </NavLink>
                  )}

                  <Link
                    className="button button-primary nav-cta"
                    to="/register-business"
                    onClick={closeMenu}
                  >
                    Register a Business
                  </Link>

                  <button
                    className="button button-secondary"
                    type="button"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/signin" onClick={closeMenu}>
                    Sign in
                  </NavLink>

                  <Link
                    className="button button-primary nav-cta"
                    to="/signup"
                    onClick={closeMenu}
                  >
                    Get started
                  </Link>
                </>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">
              <ShieldCheck size={16} /> Discover trusted local businesses
            </span>
            <h1>Find the right local business, <span>closer to you.</span></h1>
            <p>
              Discover registered shops, skilled professionals and local
              services around your neighbourhood.
            </p>

            <form
              className="hero-search"
              onSubmit={(event) => {
                event.preventDefault();
                const query = new FormData(event.currentTarget).get("query");
                window.location.href = `/search?q=${encodeURIComponent(query || "")}`;
              }}
            >
              <Search size={21} />
              <input
                name="query"
                placeholder="Try tailors, plumbers, phone shops..."
                aria-label="Search businesses"
              />
              <button className="button button-primary" type="submit">
                Search
              </button>
            </form>

            <div className="hero-note">
              <MapPin size={16} />
              Find services by business name, profession or location.
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-circle circle-one" />
            <div className="visual-circle circle-two" />
            <div className="visual-card main-visual-card">
              <div className="visual-icon"><Store size={30} /></div>
              <span className="visual-label">LOCAL BUSINESS</span>
              <h3>Good businesses.</h3>
              <h3 className="blue-text">Closer to home.</h3>
              <p>Discover. Connect. Support local.</p>
            </div>
            <div className="floating-card floating-top">
              <MapPin size={18} />
              <span>Find services nearby</span>
            </div>
            <div className="floating-card floating-bottom">
              <ShieldCheck size={19} />
              <span>Approved businesses</span>
            </div>
          </div>
        </div>
      </section>
      
      <ServicesCarousel />

      <section className="how-section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">HOW IT WORKS</span>
            <h2>Your next discovery starts here.</h2>
            <p>Three simple steps to connect with local businesses.</p>
          </div>

          <div className="steps-grid">
            <Step number="01" icon={<Search />} title="Search"
              description="Search for a profession, shop or service you need." />
            <Step number="02" icon={<MapPin />} title="Discover"
              description="Explore business details and locations near you." />
            <Step number="03" icon={<UserRound />} title="Connect"
              description="View contact details and reach the right business." />
          </div>
        </div>
      </section>

      <section className="owner-banner">
        <div className="container owner-banner-inner">
          <div>
            <span className="eyebrow light-eyebrow">FOR BUSINESS OWNERS</span>
            <h2>Help more people discover your business.</h2>
            <p>Create a profile to showcase your services, location and work.</p>
          </div>
          <Link to="/signup" className="button button-light">
            Get started <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}

function Step({ number, icon, title, description }) {
  return (
    <article className="step-card">
      <div className="step-top">
        <span className="step-icon">{icon}</span>
        <span className="step-number">{number}</span>
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}


const serviceCategories = [
  { name: "Hair Stylist", description: "Hair and styling", icon: Scissors },
  { name: "Nail Technician", description: "Nail care", icon: Sparkles },
  { name: "GSM & Repairs", description: "Phones and repairs", icon: Smartphone },
  { name: "Tailors", description: "Fashion and clothing", icon: Shirt },
  { name: "Plumbers", description: "Plumbing services", icon: Wrench },
  { name: "Food Vendors", description: "Food and catering", icon: CookingPot },
  { name: "Electricians", description: "Electrical services", icon: PlugZap },
];

function ServicesCarousel() {
  return (
    <section className="services-section">
      <div className="container">
        <div className="services-heading">
          <div>
            <span className="eyebrow">DISCOVER LOCAL SERVICES</span>
            <h2>Explore services</h2>
            <p>Find the right professional for what you need.</p>
          </div>
          <Link to="/search" className="services-view-all">
            View all <ArrowRight size={16} />
          </Link>
        </div>

        <div
          className="services-carousel"
          aria-label="Browse service categories"
        >
          {serviceCategories.map((service) => {
            const Icon = service.icon;

            return (
              <Link
                key={service.name}
                to={`/search?q=${encodeURIComponent(service.name)}`}
                className="service-card"
              >
                <span className="service-card-icon">
                  <Icon size={25} strokeWidth={1.8} />
                </span>

                <span className="service-card-title">
                  {service.name}
                </span>

                <span className="service-card-description">
                  {service.description}
                </span>

                <span className="service-card-arrow">
                  <ArrowRight size={17} />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}




function SearchPage() {
  const initialParams = new URLSearchParams(window.location.search);

  const [query, setQuery] = useState(initialParams.get("q") || "");
  const [location, setLocation] = useState(initialParams.get("location") || "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function searchBusinesses() {
      if (!query.trim() && !location.trim()) {
        setResults([]);
        setSearched(false);
        setError("");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      let searchTerm = query.trim();
      let locationTerm = location.trim();

      // Support searches like "Tailors in Abesan Estate".
      if (!locationTerm) {
        const match = searchTerm.match(/^(.+?)\s+in\s+(.+)$/i);

        if (match) {
          searchTerm = match[1].trim();
          locationTerm = match[2].trim();
        }
      }

      const clean = (value) =>
        value.replace(/[,%()]/g, " ").trim();

      searchTerm = clean(searchTerm);
      locationTerm = clean(locationTerm);

      try {
        const { data, error: searchError } = await supabase.rpc(
          "search_approved_businesses",
          {
            query_text: searchTerm || null,
            location_text: locationTerm || null,
          }
        );

        if (searchError) throw searchError;

        if (!cancelled) {
          setResults(data || []);
          setSearched(true);
        }
      } catch (err) {
        console.error("Business search error:", err.message);

        if (!cancelled) {
          setResults([]);
          setError("We couldn't load businesses. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    searchBusinesses();

    return () => {
      cancelled = true;
    };
  }, [query, location]);

  function handleSearch(event) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    setQuery(form.get("query") || "");
    setLocation(form.get("location") || "");
  }

  function formatServices(value) {
    if (!value) return "Local services";

    // PostgreSQL text[] arrives as a JavaScript array.
    if (Array.isArray(value)) {
      return value.join(", ");
    }

    // Also support JSON-formatted strings.
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.join(", ") : value;
    } catch {
      return value;
    }
  }

  return (
    <main className="container page-content">
      <span className="eyebrow">BUSINESS DIRECTORY</span>

      <h1>Explore local businesses</h1>

      <p className="page-intro">
        Search for a profession, shop or service and discover businesses in your area.
      </p>

      <form className="directory-search" onSubmit={handleSearch}>
        <label>
          <span>What are you looking for?</span>

          <div className="input-with-icon">
            <Search size={19} />

            <input
              name="query"
              defaultValue={query}
              placeholder="e.g. Tailors, plumbers, phone shops"
            />
          </div>
        </label>

        <label>
          <span>Where?</span>

          <div className="input-with-icon">
            <MapPin size={19} />

            <input
              name="location"
              defaultValue={location}
              placeholder="e.g. Abesan Estate, Lagos"
            />
          </div>
        </label>

        <button className="button button-primary" type="submit">
          Search businesses
        </button>
      </form>

      {loading && (
        <p className="search-message">Searching businesses...</p>
      )}

      {error && (
        <p className="search-error">{error}</p>
      )}

      {!loading && searched && !error && (
        <section className="search-results">
          <h2>{results.length} businesses found</h2>

          {results.length === 0 ? (
            <p className="search-message">
              No approved businesses matched your search.
              Try another service or location.
            </p>
          ) : (
            <div className="business-results-grid">
              {results.map((business) => (
                <Link
                  to={`/business/${business.id}`}
                  className="business-result-card"
                  key={business.id}
                >
                  {business.cover_image_url ? (
                    <img
                      className="business-result-image"
                      src={business.cover_image_url}
                      alt={business.name}
                    />
                  ) : (
                    <div className="business-result-placeholder">
                      <Store size={30} />
                    </div>
                  )}

                  <div className="business-result-content">
                    <h3>{business.name}</h3>

                    <p>{formatServices(business.services)}</p>

                    <span className="business-result-location">
                      <MapPin size={15} />

                      {[
                        business.area,
                        business.city,
                        business.state,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </span>

                    <span className="business-result-rating">
                      ★ {Number(business.average_rating || 0).toFixed(1)}
                      {" "}({business.review_count || 0} reviews)
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}


function BusinessDetailPage() {
  const { id } = useParams();

  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    async function loadBusiness() {
      try {
        setLoading(true);
        setError("");

        const { data: authData, error: authError } =
          await supabase.auth.getUser();

        if (authError) throw authError;

        const user = authData.user;

        let data = null;
        let fetchError = null;

        // First check whether the signed-in user owns this business.
        if (user) {
          const ownerResult = await supabase
            .from("businesses")
            .select("*")
            .eq("id", id)
            .eq("owner_id", user.id)
            .maybeSingle();

          if (ownerResult.error) throw ownerResult.error;

          if (ownerResult.data) {
            data = ownerResult.data;
            setIsOwner(true);
          }
        }

        // If the user isn't the owner, only load a public business.
        if (!data) {
          const publicResult = await supabase
            .from("businesses")
            .select("*")
            .eq("id", id)
            .eq("status", "published")
            .eq("owner_verified", true)
            .maybeSingle();

          data = publicResult.data;
          fetchError = publicResult.error;
        }

        if (fetchError) throw fetchError;

        if (!data) {
          setError(
            "This business is unavailable or has not been approved."
          );
        } else {
          setBusiness(data);
        }
      } catch (err) {
        console.error("Business loading error:", err);
        setError(err.message || "Unable to load this business.");
      } finally {
        setLoading(false);
      }
    }

    loadBusiness();
  }, [id]);

  function formatServices(value) {
    if (!value) return "Not provided";

    if (Array.isArray(value)) {
      return value.join(", ");
    }

    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.join(", ") : value;
    } catch {
      return value;
    }
  }

  if (loading) {
    return (
      <main className="container page-content">
        Loading business...
      </main>
    );
  }

  if (error || !business) {
    return (
      <main className="container page-content">
        <h1>Business unavailable</h1>
        <p>{error || "Unable to load this business."}</p>

        <Link to="/search" className="button button-primary">
          Back to search
        </Link>
      </main>
    );
  }

  const fullLocation = [
    business.address,
    business.area,
    business.city,
    business.state,
    business.country
  ].filter(Boolean).join(", ");

  const projectImages = Array.isArray(business.project_images)
    ? business.project_images
    : [];

  return (
    <main className="container page-content business-detail">
      <Link to={isOwner ? "/profile" : "/search"} className="back-link">
        ← Back
      </Link>

      {business.cover_image_url && (
        <img
          className="business-detail-image"
          src={business.cover_image_url}
          alt={business.name}
        />
      )}

      {isOwner && (
        <div className="owner-business-notice">
          Your business status:{" "}
          <strong>
            {business.status.replaceAll("_", " ")}
          </strong>
        </div>
      )}

      <span className="eyebrow">
        {isOwner
          ? "YOUR BUSINESS"
          : "APPROVED BUSINESS"}
      </span>

      <h1>{business.name}</h1>

      <p>
        {business.description || "No business description provided."}
      </p>

      <div className="business-detail-info">
        <h3>Services</h3>
        <p>{formatServices(business.services)}</p>

        <h3>Location</h3>
        <p>{fullLocation || "Location not provided"}</p>

        <h3>Customer rating</h3>
        <p>
          ★ {Number(business.average_rating || 0).toFixed(1)}
          {" "}({business.review_count || 0} reviews)
        </p>

        <h3>Contact</h3>

        {business.phone && (
          <a
            className="button button-primary"
            href={`tel:${business.phone}`}
          >
            Call business
          </a>
        )}

        {business.email && (
          <p>
            Email: <a href={`mailto:${business.email}`}>
              {business.email}
            </a>
          </p>
        )}

        {!business.phone && !business.email && (
          <p>Contact details not available.</p>
        )}

        {projectImages.length > 0 && (
          <>
            <h3>Project photos</h3>

            <div className="business-project-gallery">
              {projectImages.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`${business.name} project ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {isOwner && (
        <div className="business-owner-actions">
          <Link
            to={`/edit-business/${business.id}`}
            className="button button-primary"
          >
            Edit Business
          </Link>
        </div>
      )}
    </main>
  );
}



function AuthPage({ mode }) {
  const isSignup = mode === "signup";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setErrorMessage("");

    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });

        if (error) throw error;

        if (data.user && data.user.identities?.length === 0) {
          setErrorMessage(
            "An account with this email already exists. Please sign in instead."
          );
          return;
        }

        console.log("Signup response:", data);

        if (data.user && !data.session) {
          setMessage(
            "Account created! Please check your email to confirm your account."
          );
        } else {
          setMessage("Your account has been created successfully!");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;
    
        setMessage("Sign in successful!");

        window.location.href = "/";
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container auth-layout">
      <section className="auth-intro">
        <span className="eyebrow">WELCOME TO TRADEPROOF</span>

        <h1>
          {isSignup ? "Create your account." : "Welcome back."}
        </h1>

        <p>
          {isSignup
            ? "Join TradeProof to discover local services and create your business profile."
            : "Sign in to access your customer profile and manage your business."}
        </p>

        <div className="auth-benefit">
          <ShieldCheck size={21} />
          <span>
            One account for customer features and business ownership.
          </span>
        </div>
      </section>

      <section className="auth-card">
        <h2>{isSignup ? "Create an account" : "Sign in"}</h2>

        <p className="muted">
          {isSignup
            ? "It only takes a few steps to get started."
            : "Enter your account details below."}
        </p>

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <label>
              <span>Full name</span>
              <input
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
              />
            </label>
          )}

          <label>
            <span>Email address</span>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label>
            <span>Password</span>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              required
            />
          </label>

          {errorMessage && (
            <p className="auth-error" role="alert">
              {errorMessage}
            </p>
          )}

          {message && (
            <p className="auth-success" role="status">
              {message}
            </p>
          )}

          <button
            className="button button-primary full-width"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isSignup
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        <p className="auth-switch">
          {isSignup ? "Already have an account? " : "New to TradeProof? "}
          <Link to={isSignup ? "/signin" : "/signup"}>
            {isSignup ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </section>
    </main>
  );
}

function NotFoundPage() {
  return (
    <main className="container page-content not-found">
      <h1>Page not found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/" className="button button-primary">Return home</Link>
    </main>
  );
}



function ProfilePage() {
  const [user, setUser] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();

        if (authError) throw authError;

        const currentUser = authData.user;

        if (!currentUser) {
          window.location.href = "/signin";
          return;
        }

        setUser(currentUser);

        const { data, error: businessError } = await supabase
          .from("businesses")
          .select(`
            id,
            name,
            city,
            area,
            status,
            average_rating,
            review_count,
            project_images
          `)
          .eq("owner_id", currentUser.id)
          .order("created_at", { ascending: false });

        if (businessError) throw businessError;

        setBusinesses(data || []);
      } catch (err) {
        setError(err.message || "Could not load dashboard.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) return <main className="page-container">Loading dashboard...</main>;
  if (!user) return null;

  const fullName =
    user.user_metadata?.full_name || "Business Owner";

  return (
    <main className="owner-dashboard">
      <header className="owner-dashboard-header">
        <div>
          <h1>My Dashboard</h1>
          <p>Welcome, {fullName}</p>
        </div>

        <Link to="/register-business" className="primary-button">
          + Add Business
        </Link>
      </header>

      {error && <p className="auth-error">{error}</p>}

      <div className="owner-business-list">
        {businesses.length === 0 ? (
          <div className="empty-business-state">
            <h2>No businesses yet</h2>
            <p>Register your first business to get started.</p>
            <Link to="/register-business" className="primary-button">
              Register a Business
            </Link>
          </div>
        ) : (
          businesses.map(business => (
            <section className="owner-business-card" key={business.id}>
              <div className="owner-business-top">
                <div>
                  <h2>{business.name}</h2>
                  <p>{business.area || business.city || "Location not added"}</p>
                </div>

                <span className={`status-${business.status}`}>
                  {business.status.replaceAll("_", " ")}
                </span>
              </div>

              <div className="owner-business-stats">
                <div>
                  <strong>
                    {Number(business.average_rating || 0).toFixed(1)}/5
                  </strong>
                  <span>Average rating</span>
                </div>

                <div>
                  <strong>{business.review_count || 0}</strong>
                  <span>Reviews</span>
                </div>

                <div>
                  <strong>
                    {business.project_images?.length || 0}
                  </strong>
                  <span>Project photos</span>
                </div>
              </div>

              {business.project_images?.length > 0 && (
                <div className="owner-project-images">
                  {business.project_images.slice(0, 4).map((url, index) => (
                    <img
                      key={`${business.id}-${index}`}
                      src={url}
                      alt={`${business.name} project ${index + 1}`}
                    />
                  ))}
                </div>
              )}

              <div className="owner-business-actions">
                <Link to={`/business/${business.id}`}>
                  View Business
                </Link>
              </div>
            </section>
          ))
        )}
      </div>
    </main>
  );
}


function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(event) {
      setPosition([
        event.latlng.lat,
        event.latlng.lng
      ]);
    }
  });

  return position ? <Marker position={position} /> : null;
}

function RegisterBusinessPage() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    services: "",
    phone: "",
    email: "",
    state: "",
    city: "",
    area: "",
    address: ""
  });

  const [position, setPosition] = useState([6.5244, 3.3792]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const states = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi",
    "Bayelsa", "Benue", "Borno", "Cross River", "Delta",
    "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo",
    "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi",
    "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger",
    "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers",
    "Sokoto", "Taraba", "Yobe", "Zamfara",
    "Federal Capital Territory"
  ];

  function updateField(event) {
    const { name, value } = event.target;
    setForm(previous => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError) throw authError;

      const user = authData.user;

      if (!user) {
        window.location.href = "/signin";
        return;
      }

      const serviceList = form.services
        .split(",")
        .map(service => service.trim())
        .filter(Boolean);

      if (serviceList.length === 0) {
        throw new Error("Please enter at least one service.");
      }

      const uploadedPhotos = [];

      for (const photo of photos) {
        const safeName = photo.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        const filePath =
          `${user.id}/${crypto.randomUUID()}-${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from("business-projects")
          .upload(filePath, photo, { upsert: false });

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage
          .from("business-projects")
          .getPublicUrl(filePath);

        uploadedPhotos.push(publicData.publicUrl);
      }

      const { error: insertError } = await supabase
        .from("businesses")
        .insert({
          owner_id: user.id,
          name: form.name.trim(),
          description: form.description.trim(),
          services: serviceList,
          phone: form.phone.trim(),
          email: form.email.trim() || null,
          country: "Nigeria",
          state: form.state,
          city: form.city.trim(),
          area: form.area.trim(),
          address: form.address.trim(),
          latitude: position[0],
          longitude: position[1],
          project_images: uploadedPhotos,
          cover_image_url: uploadedPhotos[0] || null,
          status: "pending_review",
          owner_verified: false
        });

      if (insertError) throw insertError;

      setMessage(
        "Your business registration has been submitted for review."
      );

      setForm({
        name: "",
        description: "",
        services: "",
        phone: "",
        email: "",
        state: "",
        city: "",
        area: "",
        address: ""
      });

      setPhotos([]);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="register-page">
      <div className="register-heading">
        <h1>Register your business</h1>
        <p>
          Add your business details so people can discover your services
          on TradeProof.
        </p>
      </div>

      <form className="register-form" onSubmit={handleSubmit}>
        <label>
          Business name *
          <input
            name="name"
            value={form.name}
            onChange={updateField}
            placeholder="Enter your business name"
            required
          />
        </label>

        <label>
          Business description
          <textarea
            name="description"
            value={form.description}
            onChange={updateField}
            placeholder="Briefly describe your business"
            rows="3"
          />
        </label>

        <label>
          Services offered *
          <input
            name="services"
            value={form.services}
            onChange={updateField}
            placeholder="e.g. Fashion Design, Alterations"
            required
          />
          <small>Separate each service with a comma.</small>
        </label>

        <div className="register-two-columns">
          <label>
            Phone number *
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={updateField}
              placeholder="e.g. 080..."
              required
            />
          </label>

          <label>
            Email address
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              placeholder="Optional"
            />
          </label>
        </div>

        <h2>Business location</h2>

        <label>
          State *
          <select
            name="state"
            value={form.state}
            onChange={updateField}
            required
          >
            <option value="">Select state</option>
            {states.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </label>

        <div className="register-two-columns">
          <label>
            City / LGA *
            <input
              name="city"
              value={form.city}
              onChange={updateField}
              placeholder="Enter city or LGA"
              required
            />
          </label>

          <label>
            Area / Estate *
            <input
              name="area"
              value={form.area}
              onChange={updateField}
              placeholder="e.g. Ayetoro"
              required
            />
          </label>
        </div>

        <label>
          Street address *
          <input
            name="address"
            value={form.address}
            onChange={updateField}
            placeholder="Enter a clear business address"
            required
          />
        </label>

        <div className="map-picker">
          <h2>Pinpoint your business</h2>
          <p>Click the map to place the pin at your business location.</p>

          <MapContainer
            center={position}
            zoom={12}
            scrollWheelZoom={true}
            style={{ height: "320px", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker
              position={position}
              setPosition={setPosition}
            />
          </MapContainer>

          <small>
            Selected coordinates: {position[0].toFixed(5)},{" "}
            {position[1].toFixed(5)}
          </small>
        </div>

        <label>
          Project photos
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={event => {
              setPhotos(Array.from(event.target.files || []).slice(0, 5));
            }}
          />
          <small>You can upload up to 5 photos.</small>
        </label>

        {photos.length > 0 && (
          <p>{photos.length} photo(s) selected.</p>
        )}

        {error && <p className="auth-error">{error}</p>}
        {message && <p className="register-success">{message}</p>}

        <button
          type="submit"
          className="button button-primary"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit for review"}
        </button>
      </form>
    </main>
  );
}



function EditBusinessPage() {
  const { id } = useParams();

  const [form, setForm] = useState({
    name: "",
    description: "",
    services: "",
    phone: "",
    email: "",
    state: "",
    city: "",
    area: "",
    address: ""
  });

  const [position, setPosition] = useState(null);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const states = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi",
    "Bayelsa", "Benue", "Borno", "Cross River", "Delta",
    "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo",
    "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi",
    "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger",
    "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers",
    "Sokoto", "Taraba", "Yobe", "Zamfara",
    "Federal Capital Territory"
  ];

  useEffect(() => {
    async function loadBusiness() {
      try {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();

        if (authError) throw authError;

        const user = authData.user;

        if (!user) {
          window.location.href = "/signin";
          return;
        }

        const { data, error: fetchError } = await supabase
          .from("businesses")
          .select("*")
          .eq("id", id)
          .eq("owner_id", user.id)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (!data) {
          throw new Error(
            "Business not found or you do not have permission to edit it."
          );
        }

        setForm({
          name: data.name || "",
          description: data.description || "",
          services: Array.isArray(data.services)
            ? data.services.join(", ")
            : data.services || "",
          phone: data.phone || "",
          email: data.email || "",
          state: data.state || "",
          city: data.city || "",
          area: data.area || "",
          address: data.address || ""
        });

        setPosition([
          Number(data.latitude) || 6.5244,
          Number(data.longitude) || 3.3792
        ]);

        setExistingPhotos(
          Array.isArray(data.project_images)
            ? data.project_images
            : []
        );
      } catch (err) {
        setError(err.message || "Could not load business.");
      } finally {
        setLoading(false);
      }
    }

    loadBusiness();
  }, [id]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm(previous => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError) throw authError;

      const user = authData.user;

      if (!user) {
        throw new Error("Please sign in again.");
      }

      const services = form.services
        .split(",")
        .map(item => item.trim())
        .filter(Boolean);

      if (!services.length) {
        throw new Error("Please enter at least one service.");
      }

      const uploadedPhotos = [];

      for (const photo of newPhotos) {
        const safeName = photo.name.replace(
          /[^a-zA-Z0-9._-]/g,
          "-"
        );

        const filePath =
          `${user.id}/${crypto.randomUUID()}-${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from("business-projects")
          .upload(filePath, photo);

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage
          .from("business-projects")
          .getPublicUrl(filePath);

        uploadedPhotos.push(publicData.publicUrl);
      }

      const allPhotos = [...existingPhotos, ...uploadedPhotos];

      const { error: updateError } = await supabase
        .from("businesses")
        .update({
          name: form.name.trim(),
          description: form.description.trim(),
          services,
          phone: form.phone.trim(),
          email: form.email.trim() || null,
          state: form.state,
          city: form.city.trim(),
          area: form.area.trim(),
          address: form.address.trim(),
          latitude: position[0],
          longitude: position[1],
          project_images: allPhotos,
          cover_image_url: allPhotos[0] || null
        })
        .eq("id", id)
        .eq("owner_id", user.id);

      if (updateError) throw updateError;

      setExistingPhotos(allPhotos);
      setNewPhotos([]);
      setMessage("Business details updated successfully.");
    } catch (err) {
      setError(err.message || "Could not update business.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="container page-content">
        Loading business details...
      </main>
    );
  }

  if (error && !position) {
    return (
      <main className="container page-content">
        <h1>Unable to edit business</h1>
        <p>{error}</p>
        <Link to="/profile">Back to dashboard</Link>
      </main>
    );
  }

  return (
    <main className="register-page">
      <div className="register-heading">
        <h1>Edit Business</h1>
        <p>Update your business information on TradeProof.</p>
      </div>

      <form className="register-form" onSubmit={handleSubmit}>
        <label>
          Business name *
          <input
            name="name"
            value={form.name}
            onChange={updateField}
            required
          />
        </label>

        <label>
          Description
          <textarea
            name="description"
            value={form.description}
            onChange={updateField}
            rows="3"
          />
        </label>

        <label>
          Services offered *
          <input
            name="services"
            value={form.services}
            onChange={updateField}
            placeholder="Separate services with commas"
            required
          />
        </label>

        <div className="register-two-columns">
          <label>
            Phone number *
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={updateField}
              required
            />
          </label>

          <label>
            Email address
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
            />
          </label>
        </div>

        <h2>Business location</h2>

        <label>
          State *
          <select
            name="state"
            value={form.state}
            onChange={updateField}
            required
          >
            <option value="">Select state</option>
            {states.map(state => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </label>

        <div className="register-two-columns">
          <label>
            City / LGA *
            <input
              name="city"
              value={form.city}
              onChange={updateField}
              required
            />
          </label>

          <label>
            Area / Estate *
            <input
              name="area"
              value={form.area}
              onChange={updateField}
              required
            />
          </label>
        </div>

        <label>
          Street address *
          <input
            name="address"
            value={form.address}
            onChange={updateField}
            required
          />
        </label>

        <div className="map-picker">
          <h2>Update map location</h2>
          <p>Click the map to move your business pin.</p>

          {position && (
            <MapContainer
              key={id}
              center={position}
              zoom={14}
              scrollWheelZoom
              style={{ height: "320px", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <LocationMarker
                position={position}
                setPosition={setPosition}
              />
            </MapContainer>
          )}

          {position && (
            <small>
              Coordinates: {position[0].toFixed(5)},{" "}
              {position[1].toFixed(5)}
            </small>
          )}
        </div>

        <h2>Project photos</h2>

        {existingPhotos.length > 0 ? (
          <div className="business-project-gallery">
            {existingPhotos.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Existing project ${index + 1}`}
              />
            ))}
          </div>
        ) : (
          <p>No project photos uploaded yet.</p>
        )}

        <label>
          Add more project photos
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={event => {
              setNewPhotos(
                Array.from(event.target.files || []).slice(0, 5)
              );
            }}
          />
          <small>
            Select up to 5 additional photos at a time.
          </small>
        </label>

        {newPhotos.length > 0 && (
          <p>{newPhotos.length} new photo(s) selected.</p>
        )}

        {error && <p className="auth-error">{error}</p>}
        {message && <p className="register-success">{message}</p>}

        <button
          type="submit"
          className="button button-primary"
          disabled={saving}
        >
          {saving ? "Saving changes..." : "Save Changes"}
        </button>

        <Link to={`/business/${id}`} className="back-link">
          Cancel and return to business
        </Link>
      </form>
    </main>
  );
}




function AdminDashboardPage() {
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState("businesses");
  const [businesses, setBusinesses] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [actionId, setActionId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;

    async function verifyAdmin() {
      try {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();

        if (authError) throw authError;

        if (!authData.user) {
          window.location.href = "/signin";
          return;
        }

        // This check is performed by the database, not by frontend profile data.
        const { data: adminResult, error: adminError } =
          await supabase.rpc("is_tradeproof_admin");

        if (adminError) throw adminError;

        if (active) setAuthorized(adminResult === true);
      } catch (err) {
        if (active) setError(err.message || "Unable to verify admin access.");
      } finally {
        if (active) setChecking(false);
      }
    }

    verifyAdmin();
    return () => { active = false; };
  }, []);

  async function loadAdminData() {
    setLoadingData(true);
    setError("");

    try {
      const [businessResult, suggestionResult, reviewResult] =
        await Promise.all([
          supabase.from("businesses").select("*").order("created_at", { ascending: false }),
          supabase.from("business_suggestions").select("*").order("created_at", { ascending: false }),
          supabase.from("reviews").select("*").order("created_at", { ascending: false })
        ]);

      if (businessResult.error) throw businessResult.error;
      if (suggestionResult.error) throw suggestionResult.error;
      if (reviewResult.error) throw reviewResult.error;

      setBusinesses(businessResult.data || []);
      setSuggestions(suggestionResult.data || []);
      setReviews(reviewResult.data || []);
    } catch (err) {
      setError(
        err.message ||
        "Could not load admin records. Check the admin database policies."
      );
    } finally {
      setLoadingData(false);
    }
  }

  useEffect(() => {
    if (authorized) loadAdminData();
  }, [authorized]);

  async function updateBusiness(business, approve) {
    const label = approve ? "approve" : "reject";
    if (!window.confirm(`Are you sure you want to ${label} "${business.name}"?`)) return;

    setActionId(business.id);
    setError("");
    setNotice("");

    try {
      const { error: updateError } = await supabase
        .from("businesses")
        .update({
          status: approve ? "published" : "rejected",
          owner_verified: approve
        })
        .eq("id", business.id);

      if (updateError) throw updateError;

      setNotice(approve
        ? `${business.name} has been approved and published.`
        : `${business.name} has been rejected.`);
      await loadAdminData();
    } catch (err) {
      setError(err.message || "Could not update this business.");
    } finally {
      setActionId("");
    }
  }

  async function updateSuggestion(suggestion, status) {
    setActionId(suggestion.id);
    setError("");
    setNotice("");

    try {
      const { error: updateError } = await supabase
        .from("business_suggestions")
        .update({ status })
        .eq("id", suggestion.id);

      if (updateError) throw updateError;

      setNotice(`Suggestion marked as ${status}.`);
      await loadAdminData();
    } catch (err) {
      setError(err.message || "Could not update this suggestion.");
    } finally {
      setActionId("");
    }
  }

  async function updateReview(review, status) {
    setActionId(review.id);
    setError("");
    setNotice("");

    try {
      const { error: updateError } = await supabase
        .from("reviews")
        .update({ status })
        .eq("id", review.id);

      if (updateError) throw updateError;

      setNotice(`Review marked as ${status}.`);
      await loadAdminData();
    } catch (err) {
      setError(err.message || "Could not moderate this review.");
    } finally {
      setActionId("");
    }
  }

  if (checking) {
    return <main className="container page-content"><p>Checking admin access...</p></main>;
  }

  if (!authorized) {
    return (
      <main className="container page-content">
        <h1>Access restricted</h1>
        <p>This account does not have TradeProof administrator access.</p>
        {error && <p className="auth-error">{error}</p>}
        <Link className="button button-primary" to="/">Return home</Link>
      </main>
    );
  }

  const pendingBusinesses = businesses.filter(item => item.status === "pending_review");
  const pendingSuggestions = suggestions.filter(item => item.status === "pending");
  const pendingReviews = reviews.filter(item => item.status === "pending");

  return (
    <main className="container admin-page">
      <div className="admin-heading">
        <div>
          <span className="eyebrow">TRADEPROOF CONTROL PANEL</span>
          <h1>Admin dashboard</h1>
          <p>Review registrations, community suggestions and customer feedback.</p>
        </div>
        <button className="button button-secondary" onClick={loadAdminData} disabled={loadingData}>
          {loadingData ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <section className="admin-stats">
        <article><strong>{businesses.length}</strong><span>Total businesses</span></article>
        <article><strong>{pendingBusinesses.length}</strong><span>Pending registrations</span></article>
        <article><strong>{pendingSuggestions.length}</strong><span>Pending suggestions</span></article>
        <article><strong>{pendingReviews.length}</strong><span>Pending reviews</span></article>
      </section>

      {error && <p className="auth-error admin-alert">{error}</p>}
      {notice && <p className="register-success admin-alert">{notice}</p>}

      <div className="admin-tabs" role="tablist" aria-label="Admin sections">
        <button className={activeTab === "businesses" ? "active" : ""} onClick={() => setActiveTab("businesses")}>Businesses ({businesses.length})</button>
        <button className={activeTab === "suggestions" ? "active" : ""} onClick={() => setActiveTab("suggestions")}>Suggestions ({suggestions.length})</button>
        <button className={activeTab === "reviews" ? "active" : ""} onClick={() => setActiveTab("reviews")}>Reviews ({reviews.length})</button>
      </div>

      {loadingData && <p className="search-message">Loading admin records...</p>}

      {!loadingData && activeTab === "businesses" && (
        <section className="admin-record-list">
          {businesses.length === 0 ? <p>No business registrations found.</p> : businesses.map(business => (
            <article className="admin-record" key={business.id}>
              <div className="admin-record-main">
                {business.cover_image_url && <img src={business.cover_image_url} alt="" />}
                <div>
                  <h2>{business.name}</h2>
                  <p>{business.services?.join ? business.services.join(", ") : business.services || "Services not listed"}</p>
                  <small>{[business.area, business.city, business.state].filter(Boolean).join(", ")}</small>
                  <span className={`admin-status status-${business.status}`}>{String(business.status || "unknown").replaceAll("_", " ")}</span>
                  <p className="admin-description">{business.description || "No description provided."}</p>
                  {Array.isArray(business.project_images) && business.project_images.length > 0 && (
                    <div className="admin-photo-row">
                      {business.project_images.map((url, index) => <a key={index} href={url} target="_blank" rel="noreferrer"><img src={url} alt={`${business.name} project ${index + 1}`} /></a>)}
                    </div>
                  )}
                  <small>Phone: {business.phone || "Not provided"} · Email: {business.email || "Not provided"}</small>
                  <small>Owner verified: {business.owner_verified ? "Yes" : "No"}</small>
                </div>
              </div>
              <div className="admin-actions">
                <Link to={`/business/${business.id}`}>Open details</Link>
                {business.status !== "published" && (
                  <button className="button button-primary" disabled={actionId === business.id} onClick={() => updateBusiness(business, true)}>
                    {actionId === business.id ? "Saving..." : "Approve & publish"}
                  </button>
                )}
                {business.status !== "rejected" && (
                  <button className="button button-danger" disabled={actionId === business.id} onClick={() => updateBusiness(business, false)}>Reject</button>
                )}
              </div>
            </article>
          ))}
        </section>
      )}

      {!loadingData && activeTab === "suggestions" && (
        <section className="admin-record-list">
          {suggestions.length === 0 ? <p>No community suggestions yet.</p> : suggestions.map(item => (
            <article className="admin-record" key={item.id}>
              <div>
                <h2>{item.business_name}</h2>
                <p>{item.profession || "Profession not specified"} · {item.area || "Area not specified"}</p>
                <p>{item.contact_details || "No contact details"} </p>
                {item.notes && <p>{item.notes}</p>}
                <span className="admin-status">{item.status}</span>
              </div>
              <div className="admin-actions">
                {item.status === "pending" && <>
                  <button className="button button-primary" disabled={actionId === item.id} onClick={() => updateSuggestion(item, "approved")}>Approve suggestion</button>
                  <button className="button button-danger" disabled={actionId === item.id} onClick={() => updateSuggestion(item, "rejected")}>Reject</button>
                </>}
              </div>
            </article>
          ))}
        </section>
      )}

      {!loadingData && activeTab === "reviews" && (
        <section className="admin-record-list">
          {reviews.length === 0 ? <p>No customer reviews yet.</p> : reviews.map(review => (
            <article className="admin-record" key={review.id}>
              <div>
                <h2>{"★".repeat(Math.max(0, Math.min(5, Number(review.rating) || 0)))} <small>{review.rating}/5</small></h2>
                <p>{review.comment || "No written comment."}</p>
                <small>Business ID: {review.business_id}</small>
                <span className="admin-status">{review.status}</span>
              </div>
              <div className="admin-actions">
                {review.status !== "published" && <button className="button button-primary" disabled={actionId === review.id} onClick={() => updateReview(review, "published")}>Publish review</button>}
               </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}


export default function App() {
  useEffect(() => {
  async function testConnection() {
    const { error } = await supabase
      .from("businesses")
      .select("id")
      .limit(1);

    if (error) {
      console.error("Supabase connection test:", error.message);
    } else {
      console.log("TradeProof Supabase connection successful!");
    }
  }

  testConnection();
  }, []);


  return (
    <div className="app-shell">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/business/:id" element={<BusinessDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/register-business" element={<RegisterBusinessPage />} />
        <Route path="/edit-business/:id" element={<EditBusinessPage />} />
        <Route path="/signin" element={<AuthPage mode="signin" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <footer className="site-footer">
        <div className="container footer-inner">
          <Link to="/" className="brand footer-brand">
            <span className="brand-icon"><Store size={21} /></span>
            <span>TradeProof</span>
          </Link>
          <p>Helping people discover local businesses and services.</p>
          <span>© {new Date().getFullYear()} TradeProof</span>
        </div>
      </footer>
    </div>
  );


  
}
