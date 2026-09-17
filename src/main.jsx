import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowLeft, Check, ChevronRight, ImagePlus, LogIn, LogOut, Minus,
  Pencil, Plus, Search, ShoppingBag, Sparkles, Trash2, X, ZoomIn, ZoomOut
} from "lucide-react";
import "./styles.css";

const DEMO_ADMIN_PASSWORD = "artist123";

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
          <img src="/logo.png" alt="Artist logo" onError={(e) => e.currentTarget.style.display = "none"} />
          <div className="brand-fallback">
            <span className="brand-script">Impressions By Swati</span>
            <span className="brand-sub">ORIGINAL ART • EST. 1998</span>
          </div>
        </div>

        <div className="header-actions">
          <div className="search-box">
            <Search size={17} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search artwork..." />
          </div>
          {admin ? (
            <button className="admin-pill" onClick={() => setAdmin(false)}><LogOut size={16}/> Exit Admin</button>
          ) : (
            <button className="icon-button" title="Admin login" onClick={() => setLoginOpen(true)}><LogIn size={19}/></button>
          )}
        </div>
      </header>

      {admin && <AdminBar onAddCategory={addCategory} />}

      <main>
        {!activeCategory ? (
          <>
            <section className="hero">
              <div className="hero-copy">
                <span className="eyebrow"><Sparkles size={15}/> Handmade • Original • One of a Kind</span>
                <h1>Art that makes<br/><em>space feel alive.</em></h1>
                <p>Explore a collection of thoughtful, handmade artworks created to bring warmth, character and a little wonder into your home.</p>
                <div className="hero-note"><span></span> Every piece is made with love and carries its own story.</div>
              </div>
              <div className="hero-art">
                <div className="arch">
                  <img src={allArt[0]?.image} alt="" />
                </div>
                <div className="hero-card">
                  <strong>{allArt.length}+</strong>
                  <span>original artworks</span>
                </div>
              </div>
            </section>

            <section className="section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">Explore the collection</span>
                  <h2>Browse by category</h2>
                </div>
                <span className="collection-count">{categories.length} collections</span>
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
        <div className="footer-brand">Impressions by Swati</div>
        <p>Original artwork, thoughtfully made.</p>
        <span>© 2026 All rights reserved.</span>
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
        {cover ? <img src={cover} alt={category.name}/> : <div className="empty-cover"><Sparkles size={35}/></div>}
        <span className="art-count">{category.artworks.length} {category.artworks.length === 1 ? "piece" : "pieces"}</span>
      </div>
      <div className="category-info">
        <span className="category-number">0{index + 1}</span>
        <div><h3>{category.name}</h3><p>{category.description || "A collection of original handmade art."}</p></div>
        <ChevronRight className="arrow" size={21}/>
      </div>
    </button>
  );
}

function CategoryPage({ category, admin, onBack, onSelect, onDelete, onToggleSold, onAdd }) {
  const [uploadOpen, setUploadOpen] = useState(false);
  return (
    <section className="category-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18}/> All collections</button>
      <div className="category-title">
        <div><span className="eyebrow">Collection</span><h1>{category.name}</h1><p>{category.description}</p></div>
        {admin && <button className="primary-button" onClick={() => setUploadOpen(true)}><Plus size={18}/> Add artwork</button>}
      </div>

      {category.artworks.length ? (
        <div className="art-grid">
          {category.artworks.map((art, i) => (
            <article className="art-card" key={art.id}>
              <button className="art-image-button" onClick={() => onSelect(art)}>
                <img src={art.image} alt={art.title}/>
                <span className={`sold-badge ${art.sold ? "sold" : ""}`}>{art.sold ? "SOLD OUT" : "AVAILABLE"}</span>
                <span className="view-art">View artwork <ZoomIn size={16}/></span>
              </button>
              <div className="art-details">
                <div><h3>{art.title}</h3><p>{art.description}</p></div>
                <div className="price">{art.sold ? "Sold" : `₹${Number(art.price || 0).toLocaleString("en-IN")}`}</div>
              </div>
              {admin && (
                <div className="admin-art-actions">
                  <button onClick={() => onToggleSold(category.id, art.id)}>{art.sold ? <Check size={15}/> : <ShoppingBag size={15}/>} {art.sold ? "Mark available" : "Mark sold"}</button>
                  <button className="danger" onClick={() => onDelete(category.id, art.id)}><Trash2 size={15}/> Delete</button>
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state"><ImagePlus size={40}/><h3>No artworks yet</h3><p>Add the first piece to this collection.</p>{admin && <button className="primary-button" onClick={() => setUploadOpen(true)}><Plus size={18}/> Add artwork</button>}</div>
      )}

      {uploadOpen && <ArtworkForm onClose={() => setUploadOpen(false)} onSave={(art) => { onAdd(category.id, art); setUploadOpen(false); }} />}
    </section>
  );
}

function ArtworkForm({ onClose, onSave }) {
  const [form, setForm] = useState({ title: "", description: "", price: "", sold: false, image: "" });

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm(f => ({ ...f, image: reader.result }));
    reader.readAsDataURL(file);
  }

  return (
    <div className="overlay">
      <div className="form-modal">
        <button className="close-button" onClick={onClose}><X/></button>
        <span className="eyebrow">New artwork</span>
        <h2>Add a painting</h2>
        <div className="upload-zone">
          {form.image ? <img src={form.image} alt="Preview"/> : <><ImagePlus size={30}/><span>Choose artwork photo</span></>}
          <input type="file" accept="image/*" onChange={handleFile}/>
        </div>
        <label>Title<input value={form.title} onChange={e => setForm({...form,title:e.target.value})} placeholder="e.g. Moonlit Garden"/></label>
        <label>Short description<textarea rows="3" value={form.description} onChange={e => setForm({...form,description:e.target.value})} placeholder="A short story about this painting..."/></label>
        <label>Price (₹)<input type="number" value={form.price} onChange={e => setForm({...form,price:e.target.value})} placeholder="2500"/></label>
        <label className="checkbox"><input type="checkbox" checked={form.sold} onChange={e => setForm({...form,sold:e.target.checked})}/> Mark as sold out</label>
        <button className="primary-button wide" disabled={!form.image || !form.title} onClick={() => onSave(form)}>Publish artwork</button>
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
      <span><Pencil size={15}/> Admin mode — changes are saved in this browser.</span>
      <button onClick={() => setOpen(!open)}><Plus size={15}/> New category</button>
      {open && <div className="mini-form">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Category name"/>
        <input value={description} onChange={e=>setDescription(e.target.value)} placeholder="Short description"/>
        <button onClick={() => {onAddCategory(name,description);setName("");setDescription("");setOpen(false)}}>Create</button>
      </div>}
    </div>
  );
}

function LoginModal({ onClose, onSuccess }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  function login() {
    if (password === DEMO_ADMIN_PASSWORD) onSuccess();
    else setError("Incorrect password.");
  }
  return (
    <div className="overlay">
      <div className="login-modal">
        <button className="close-button" onClick={onClose}><X/></button>
        <div className="login-icon"><Sparkles/></div>
        <span className="eyebrow">Private studio</span>
        <h2>Admin access</h2>
        <p>Sign in to manage categories and artworks.</p>
        <input autoFocus type="password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="Admin password"/>
        {error && <small className="error">{error}</small>}
        <button className="primary-button wide" onClick={login}>Enter studio <ArrowLeft className="flip" size={17}/></button>
        <small className="demo-hint">Demo password: <b>{DEMO_ADMIN_PASSWORD}</b></small>
      </div>
    </div>
  );
}

function ArtworkModal({ artwork, onClose }) {
  const [zoom, setZoom] = useState(1);
  return (
    <div className="overlay art-overlay" onClick={onClose}>
      <div className="viewer" onClick={e=>e.stopPropagation()}>
        <button className="close-button viewer-close" onClick={onClose}><X/></button>
        <div className="viewer-stage">
          <div className="easel">
            <div className="frame">
              <img src={artwork.image} alt={artwork.title} style={{transform:`scale(${zoom})`}}/>
            </div>
            <div className="easel-leg left"></div><div className="easel-leg right"></div><div className="easel-cross"></div>
          </div>
        </div>
        <div className="viewer-info">
          <div><span className="eyebrow">Original artwork</span><h2>{artwork.title}</h2><p>{artwork.description}</p></div>
          <div className="viewer-price">{artwork.sold ? <span className="sold-text">SOLD OUT</span> : `₹${Number(artwork.price || 0).toLocaleString("en-IN")}`}</div>
        </div>
        <div className="zoom-controls">
          <button onClick={()=>setZoom(z=>Math.max(.7,z-.15))}><ZoomOut size={18}/></button>
          <span>{Math.round(zoom*100)}%</span>
          <button onClick={()=>setZoom(z=>Math.min(2.2,z+.15))}><ZoomIn size={18}/></button>
          <button className="reset" onClick={()=>setZoom(1)}>Reset</button>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
