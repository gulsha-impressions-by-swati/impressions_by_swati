import React, { useEffect, useMemo, useState } from "react";
import { uploadArtworkToDrive } from './services/driveService';
import { createRoot } from "react-dom/client";
import {
  ArrowLeft, Check, ChevronRight, ImagePlus, LogIn, LogOut,
  Pencil, Plus, Search, ShoppingBag, Sparkles, Trash2, X, ZoomIn, ZoomOut, Filter
} from "lucide-react";
import "./styles.css";

const DEMO_ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

const starterCategories = [
  {
    id: "pebble-art",
    name: "Pebble Art Paintings",
    description: "Nature-inspired artwork created with pebbles, textures and delicate hand-painted details.",
    artworks: [
      {
        id: "pebble-1",
        title: "Little Tree",
        description: "A peaceful little tree created with natural pebbles and hand-painted details.",
        price: 2800,
        sold: false,
        image: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=1200&q=85"
      },
      {
        id: "pebble-2",
        title: "Together",
        description: "A warm family-inspired pebble composition, made as a one-of-a-kind original.",
        price: 3500,
        sold: false,
        image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1200&q=85"
      },
      {
        id: "pebble-3",
        title: "Quiet Evening",
        description: "Soft lavender tones and natural stones capture a calm evening landscape.",
        price: 4200,
        sold: true,
        image: "https://images.unsplash.com/photo-1577083552431-6e5fd01988e5?auto=format&fit=crop&w=1200&q=85"
      }
    ]
  },
  {
    id: "canvas",
    name: "Canvas Paintings",
    description: "Original paintings created on canvas, from expressive abstracts to serene landscapes.",
    artworks: []
  },
  {
    id: "mixed-media",
    name: "Mixed Media",
    description: "Textural works combining paint, natural materials and found elements.",
    artworks: []
  }
];

function loadData() {
  try {
    const saved = localStorage.getItem("artist-gallery-data");
    return saved ? JSON.parse(saved) : starterCategories;
  } catch {
    return starterCategories;
  }
}

function App() {
  const [categories, setCategories] = useState(loadData);
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedArt, setSelectedArt] = useState(null);
  const [admin, setAdmin] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    localStorage.setItem("artist-gallery-data", JSON.stringify(categories));
  }, [categories]);

  const allArt = useMemo(
    () => categories.flatMap(c => c.artworks.map(a => ({ ...a, categoryId: c.id, categoryName: c.name }))),
    [categories]
  );

  const visibleCategories = categories.map(c => ({
    ...c,
    artworks: c.artworks.filter(a =>
      `${a.title} ${a.description}`.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(c => !search || c.artworks.length);

  function updateCategory(categoryId, updater) {
    setCategories(prev => prev.map(c => c.id === categoryId ? updater(c) : c));
  }

  function addCategory(name, description) {
    const clean = name.trim();
    if (!clean) return;
    setCategories(prev => [...prev, {
      id: `${Date.now()}`,
      name: clean,
      description: description.trim(),
      artworks: []
    }]);
  }

  function deleteCategory(id) {
    if (!confirm("Delete this category and all its artworks?")) return;
    setCategories(prev => prev.filter(c => c.id !== id));
    if (activeCategory?.id === id) setActiveCategory(null);
  }

  function addArtwork(categoryId, artwork) {
    updateCategory(categoryId, c => ({
      ...c,
      artworks: [{ ...artwork, id: `${Date.now()}-${Math.random()}` }, ...c.artworks]
    }));
  }

  function deleteArtwork(categoryId, artworkId) {
    if (!confirm("Delete this artwork?")) return;
    updateCategory(categoryId, c => ({
      ...c, artworks: c.artworks.filter(a => a.id !== artworkId)
    }));
    setSelectedArt(null);
  }

  function toggleSold(categoryId, artworkId) {
    updateCategory(categoryId, c => ({
      ...c,
      artworks: c.artworks.map(a => a.id === artworkId ? { ...a, sold: !a.sold } : a)
    }));
  }

  return (
    <div className="app">
      <header className="site-header">
        <div className="brand" onClick={() => setActiveCategory(null)}>
          <img src="/logo.png" alt="Artist logo" />
          <div className="brand-fallback">
            <span className="brand-script">Impressions By Swati</span>
            <span className="brand-sub">ORIGINAL FINE ART • EST. 1998</span>
          </div>
        </div>

        <div className="header-actions">
          <div className="search-box">
            <Search size={16} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search gallery..." />
          </div>
          {admin ? (
            <button className="admin-pill active" onClick={() => setAdmin(false)}><LogOut size={15}/> Exit Admin</button>
          ) : (
            <button className="icon-button" title="Admin login" onClick={() => setLoginOpen(true)}><LogIn size={18}/></button>
          )}
        </div>
      </header>

      {admin && <AdminBar onAddCategory={addCategory} />}

      <main>
        {!activeCategory ? (
          <>
            <section className="hero">
              <div className="hero-copy">
                <span className="eyebrow"><Sparkles size={14}/> Curated Collection</span>
                <h1>Art that makes<br/><em>space feel alive.</em></h1>
                <p>Explore a collection of thoughtful, handmade artworks created to bring warmth, character, and quiet wonder into your sanctuary.</p>
                <div className="hero-note"><span></span> Every piece is original and carries its own distinct narrative.</div>
              </div>
              <div className="hero-art">
                <div className="arch">
                  <img src={allArt[0]?.image || "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=1200&q=85"} alt="Featured Artwork" />
                </div>
                <div className="hero-card">
                  <strong>{allArt.length}+</strong>
                  <span>Original Artworks</span>
                </div>
              </div>
            </section>

            <section className="section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">Portfolios</span>
                  <h2>Browse by category</h2>
                </div>
                <span className="collection-count">{categories.length} active collections</span>
              </div>

              <div className="category-grid">
                {visibleCategories.map((cat, i) => (
                  <CategoryCard key={cat.id} category={cat} index={i} onClick={() => setActiveCategory(cat)} />
                ))}
              </div>
            </section>
          </>
        ) : (
          <CategoryPage
            category={categories.find(c => c.id === activeCategory.id) || activeCategory}
            admin={admin}
            onBack={() => setActiveCategory(null)}
            onSelect={setSelectedArt}
            onDelete={deleteArtwork}
            onToggleSold={toggleSold}
            onAdd={addArtwork}
          />
        )}
      </main>

      <footer>
        <div className="footer-content">
          <div className="footer-brand">Impressions by Swati</div>
          <p>Original handmade artwork, crafted with intention.</p>
          <span>© 2026 Swati Gallery. All rights reserved.</span>
        </div>
      </footer>

      {selectedArt && (
        <ArtworkModal
          artwork={selectedArt}
          onClose={() => setSelectedArt(null)}
        />
      )}

      {loginOpen && (
        <LoginModal
          onClose={() => setLoginOpen(false)}
          onSuccess={() => { setAdmin(true); setLoginOpen(false); }}
        />
      )}
    </div>
  );
}

function CategoryCard({ category, index, onClick }) {
  const cover = category.artworks[0]?.image;
  return (
    <button className={`category-card card-${index % 3}`} onClick={onClick}>
      <div className="category-cover">
        {cover ? <img src={cover} alt={category.name}/> : <div className="empty-cover"><Sparkles size={32}/></div>}
        <span className="art-count">{category.artworks.length} {category.artworks.length === 1 ? "piece" : "pieces"}</span>
      </div>
      <div className="category-info">
        <span className="category-number">0{index + 1}</span>
        <div><h3>{category.name}</h3><p>{category.description || "A curated series of original handmade pieces."}</p></div>
        <div className="arrow-wrapper"><ChevronRight size={18}/></div>
      </div>
    </button>
  );
}

function CategoryPage({ category, admin, onBack, onSelect, onDelete, onToggleSold, onAdd }) {
  const [uploadOpen, setUploadOpen] = useState(false);
  return (
    <section className="category-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={16}/> All Collections</button>
      <div className="category-title">
        <div>
          <span className="eyebrow">Exhibition</span>
          <h1>{category.name}</h1>
          <p>{category.description}</p>
        </div>
        {admin && <button className="primary-button" onClick={() => setUploadOpen(true)}><Plus size={16}/> Add Artwork</button>}
      </div>

      {category.artworks.length ? (
        <div className="art-grid">
          {category.artworks.map((art) => (
            <article className="art-card" key={art.id}>
              <div className="art-image-container" onClick={() => onSelect(art)}>
                <img src={art.image} alt={art.title}/>
                <span className={`status-pill ${art.sold ? "sold" : "available"}`}>{art.sold ? "Sold Out" : "Available"}</span>
                <div className="image-overlay-action">
                  <span>View Details <ZoomIn size={15}/></span>
                </div>
              </div>
              <div className="art-details">
                <div>
                  <h3>{art.title}</h3>
                  <p>{art.description}</p>
                </div>
                <div className="price">{art.sold ? <span className="sold-label">Sold</span> : `₹${Number(art.price || 0).toLocaleString("en-IN")}`}</div>
              </div>
              {admin && (
                <div className="admin-art-actions">
                  <button onClick={() => onToggleSold(category.id, art.id)}>
                    {art.sold ? <Check size={14}/> : <ShoppingBag size={14}/>} 
                    {art.sold ? "Mark Available" : "Mark Sold"}
                  </button>
                  <button className="danger" onClick={() => onDelete(category.id, art.id)}><Trash2 size={14}/> Delete</button>
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <ImagePlus size={40}/>
          <h3>No artworks found</h3>
          <p>This collection is currently empty. Add the first piece to showcase.</p>
          {admin && <button className="primary-button" onClick={() => setUploadOpen(true)}><Plus size={16}/> Add Artwork</button>}
        </div>
      )}

      {uploadOpen && <ArtworkForm onClose={() => setUploadOpen(false)} onSave={(art) => { onAdd(category.id, art); setUploadOpen(false); }} />}
    </section>
  );
}

function ArtworkForm({ categoryId, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) {
      alert("Please select an image file to upload.");
      return;
    }

    setUploading(true);

    try {
      // 1. Upload to Google Drive via your Apps Script backend
      const driveImageUrl = await uploadArtworkToDrive(file);

      // 2. Save the artwork with the Google Drive image URL
      onSave({
        id: Date.now(),
        title,
        description,
        price: Number(price),
        image: driveImageUrl, // Permanent Google Drive link!
        sold: false
      });

      onClose();
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload image to Google Drive. Check console for details.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="overlay">
      <div className="form-modal animate-in">
        <h2>Add New Artwork</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Artwork Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Price (₹)</label>
            <input 
              type="number" 
              value={price} 
              onChange={e => setPrice(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Select Image File</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={e => setFile(e.target.files[0])} 
              required 
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} disabled={uploading}>Cancel</button>
            <button type="submit" className="primary-button" disabled={uploading}>
              {uploading ? "Uploading to Drive..." : "Save Artwork"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminBar({ onAddCategory }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  return (
    <div className="admin-bar">
      <span><Pencil size={14}/> Curator Mode Active — changes persist locally.</span>
      <button onClick={() => setOpen(!open)}><Plus size={14}/> New Collection</button>
      {open && (
        <div className="mini-form animate-in">
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Collection Name"/>
          <input value={description} onChange={e=>setDescription(e.target.value)} placeholder="Short Subtitle"/>
          <button onClick={() => {onAddCategory(name,description);setName("");setDescription("");setOpen(false)}}>Create</button>
        </div>
      )}
    </div>
  );
}

function LoginModal({ onClose, onSuccess }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  function login() {
    if (password === DEMO_ADMIN_PASSWORD) onSuccess();
    else setError("Incorrect studio password.");
  }
  return (
    <div className="overlay">
      <div className="login-modal animate-in">
        <button className="close-button" onClick={onClose}><X size={18}/></button>
        <div className="login-icon"><Sparkles size={20}/></div>
        <span className="eyebrow">Restricted Access</span>
        <h2>Curator Login</h2>
        <p>Enter your password to manage gallery collections and artworks.</p>
        <input autoFocus type="password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="Password"/>
        {error && <small className="error">{error}</small>}
        <button className="primary-button wide" onClick={login}>Enter Studio</button>
        <small className="demo-hint">For Password: <b>Contact to Admin</b></small>
      </div>
    </div>
  );
}

function ArtworkModal({ artwork, onClose }) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  function handleWheel(e) {
    e.preventDefault();
    setZoom(prev => {
      const next = prev + (e.deltaY < 0 ? 0.15 : -0.15);
      const clamped = Math.min(Math.max(next, 1.0), 3.5);
      if (clamped === 1.0) setPosition({ x: 0, y: 0 });
      return clamped;
    });
  }

  function handleMouseDown(e) {
    if (zoom <= 1.0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  }

  function handleMouseMove(e) {
    if (!isDragging || zoom <= 1.0) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }

  function handleMouseUp() {
    setIsDragging(false);
  }

  return (
    <div className="overlay art-overlay" onClick={onClose}>
      <div className="viewer animate-in" onClick={e => e.stopPropagation()}>
        <button type="button" className="close-button viewer-close" onClick={onClose}>
          <X size={20} />
        </button>
        
        <div 
          className="viewer-stage" 
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in' }}
        >
          <div className="gallery-framed-container">
            <img 
              src={artwork.image} 
              alt={artwork.title} 
              referrerPolicy="no-referrer"
              style={{ 
                transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                transition: isDragging ? 'none' : 'transform 0.1s ease-out'
              }} 
            />
          </div>
        </div>

        {/* Compact text bar occupying minimal height/space */}
        <div className="viewer-info">
          <div>
            <h2>{artwork.title}</h2>
            <p>{artwork.description}</p>
          </div>
          <div className="viewer-price">
            {artwork.sold ? <span className="sold-text">SOLD OUT</span> : `₹${Number(artwork.price || 0).toLocaleString("en-IN")}`}
          </div>
        </div>

        <div className="zoom-controls">
          <button type="button" onClick={() => { setZoom(z => Math.max(1.0, z - 0.15)); if(zoom <= 1.15) setPosition({x:0, y:0}); }} title="Zoom out"><ZoomOut size={16}/></button>
          <span>{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => setZoom(z => Math.min(3.5, z + 0.15))} title="Zoom in"><ZoomIn size={16}/></button>
          <button type="button" className="reset" onClick={() => { setZoom(1); setPosition({ x: 0, y: 0 }); }}>Reset</button>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);