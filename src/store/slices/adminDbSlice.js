import { createSlice } from '@reduxjs/toolkit'

const STORAGE_KEY = 'densova_admin_db_v3'

export const DEFAULT_DB = {
  categories: [
    { id:'c_hair',    name:'Hair Ritual',    slug:'hair-ritual',    parentId:null, description:'Cleansers, oils and treatments for the hair', order:1 },
    { id:'c_scalp',   name:'Scalp Ritual',   slug:'scalp-ritual',   parentId:null, description:'Tonics and serums for scalp health',         order:2 },
    { id:'c_grooming',name:'Grooming',       slug:'grooming',       parentId:null, description:'Beard and grooming essentials',              order:3 },
    { id:'c_gift',    name:'Gift Sets',      slug:'gift-sets',      parentId:null, description:'Curated bundles for special moments',        order:4 },
    { id:'c_inf',     name:'Hair Infusions', slug:'hair-infusions', parentId:'c_hair',     description:'Slow-pressed oil concentrates', order:1 },
    { id:'c_mask',    name:'Hair Masks',     slug:'hair-masks',     parentId:'c_hair',     description:'Deep treatments',              order:2 },
    { id:'c_elx',     name:'Elixirs',        slug:'elixirs',        parentId:'c_hair',     description:'Overnight rituals',            order:3 },
    { id:'c_serum',   name:'Serums',         slug:'serums',         parentId:'c_scalp',    description:'Stimulating treatments',       order:1 },
    { id:'c_tonic',   name:'Tonics',         slug:'tonics',         parentId:'c_scalp',    description:'Daily cleansing tonics',       order:2 },
    { id:'c_beard',   name:'Beard Oils',     slug:'beard-oils',     parentId:'c_grooming', description:'Density and definition',       order:1 },
  ],
  products: [
    { id:'p_hi250', name:'Advanced Herbal Hair Infusion', sku:'DNV-HI-250', barcode:'8800010010', description:'Slow-pressed botanical concentrate. Eight herbs for strength, growth and repair.', price:4950, oldPrice:6200, cost:1800, categoryId:'c_inf',   stock:134, threshold:30, status:'active', featured:true,  bottle:'cream', sold:286, size:'250 ml' },
    { id:'p_ss50',  name:'Rosemary Scalp Serum',         sku:'DNV-SS-050', barcode:'8800010011', description:'Stimulates scalp circulation. Awakens dormant follicles.',                        price:3200, oldPrice:null, cost:1100, categoryId:'c_serum', stock:4,   threshold:20, status:'active', featured:false, bottle:'green', sold:142, size:'50 ml'  },
    { id:'p_bo30',  name:'Black Seed Beard Oil',         sku:'DNV-BO-030', barcode:'8800010012', description:'Nigella sativa concentrate for density and definition.',                          price:2400, oldPrice:null, cost:850,  categoryId:'c_beard', stock:0,   threshold:15, status:'active', featured:false, bottle:'amber', sold:88,  size:'30 ml'  },
    { id:'p_hm200', name:'Botanical Hair Mask',          sku:'DNV-HM-200', barcode:'8800010013', description:'Hibiscus-rich deep treatment.',                                                   price:3800, oldPrice:4400, cost:1300, categoryId:'c_mask',  stock:56,  threshold:25, status:'active', featured:false, bottle:'mint',  sold:104, size:'200 ml' },
    { id:'p_ct150', name:'Cleansing Tonic',              sku:'DNV-CT-150', barcode:'8800010014', description:'Reetha-based daily refresh tonic.',                                               price:2900, oldPrice:null, cost:950,  categoryId:'c_tonic', stock:11,  threshold:20, status:'active', featured:false, bottle:'cream', sold:62,  size:'150 ml' },
    { id:'p_oe100', name:'Overnight Elixir',             sku:'DNV-OE-100', barcode:'8800010015', description:'Concentrated overnight ritual.',                                                  price:5400, oldPrice:6900, cost:2000, categoryId:'c_elx',   stock:38,  threshold:20, status:'active', featured:false, bottle:'amber', sold:74,  size:'100 ml' },
    { id:'p_gd',    name:'Grooming Duo Set',             sku:'DNV-GD-SET', barcode:'8800010016', description:'Beard + Hair pairing.',                                                           price:4800, oldPrice:null, cost:1700, categoryId:'c_gift',  stock:22,  threshold:10, status:'draft',  featured:false, bottle:'mint',  sold:0,   size:'Box'    },
    { id:'p_gt',    name:'Gift Trio Box',                sku:'DNV-GT-SET', barcode:'8800010017', description:'Three rituals, one box.',                                                         price:9900, oldPrice:11800,cost:3400, categoryId:'c_gift',  stock:18,  threshold:10, status:'draft',  featured:false, bottle:'cream', sold:0,   size:'Box'    },
  ],
  customers: [
    { id:'cu_1', name:'Amaira Khan',   email:'amaira.k@gmail.com',  phone:'+92 333 1234567', city:'Lahore',     country:'Pakistan', address:'House #14, Street 8, DHA Phase 6', tier:'VIP',    orders:4, ltv:18200, lastOrder:'2026-05-11', joined:'2025-08-12', notes:'' },
    { id:'cu_2', name:'Sara Memon',    email:'sara.m@gmail.com',    phone:'+92 321 2345678', city:'Karachi',    country:'Pakistan', address:'Apt 5B, Sea View Apartments',      tier:'VIP',    orders:6, ltv:24600, lastOrder:'2026-05-11', joined:'2025-06-08', notes:'' },
    { id:'cu_3', name:'Hina Rashid',   email:'hina.r@gmail.com',    phone:'+92 345 3456789', city:'Islamabad',  country:'Pakistan', address:'Street 23, F-7/2',                tier:'VIP',    orders:8, ltv:42100, lastOrder:'2026-05-10', joined:'2025-04-22', notes:'Regular gift orders' },
    { id:'cu_4', name:'Faiza Iqbal',   email:'faiza@gmail.com',     phone:'+92 312 4567890', city:'Lahore',     country:'Pakistan', address:'12 Gulberg III',                  tier:'New',    orders:1, ltv:3200,  lastOrder:'2026-05-10', joined:'2026-05-08', notes:'' },
    { id:'cu_5', name:'Bilal Ahmed',   email:'bilal@gmail.com',     phone:'+971 50 1234567', city:'Dubai',      country:'UAE',      address:'Marina Tower, Dubai Marina',      tier:'Repeat', orders:2, ltv:7350,  lastOrder:'2026-05-09', joined:'2026-02-14', notes:'' },
    { id:'cu_6', name:'Mariam Bhatti', email:'mariam@gmail.com',    phone:'+92 333 6789012', city:'Karachi',    country:'Pakistan', address:'House 22, Clifton Block 4',       tier:'Repeat', orders:3, ltv:10240, lastOrder:'2026-05-08', joined:'2025-11-30', notes:'' },
    { id:'cu_7', name:'Adeel Khan',    email:'adeel@gmail.com',     phone:'+92 321 7890123', city:'Lahore',     country:'Pakistan', address:'Cantt area',                      tier:'VIP',    orders:5, ltv:19800, lastOrder:'2026-05-08', joined:'2025-09-15', notes:'' },
    { id:'cu_8', name:'Nida Hassan',   email:'nida@gmail.com',      phone:'+92 312 8901234', city:'Faisalabad', country:'Pakistan', address:'Madina Town',                     tier:'Repeat', orders:2, ltv:9050,  lastOrder:'2026-05-07', joined:'2026-01-20', notes:'' },
  ],
  orders: [
    { id:'DNS-1042', date:'2026-05-11', customerId:'cu_1', items:[{productId:'p_hi250',qty:1,price:4950},{productId:'p_bo30',qty:1,price:2400}], shipping:0, discount:1470, discountCode:'WELCOME20', total:5880,  payment:'COD',       status:'pending',   notes:'' },
    { id:'DNS-1041', date:'2026-05-11', customerId:'cu_2', items:[{productId:'p_hi250',qty:1,price:4950}],                                       shipping:0, discount:0,    discountCode:'',          total:4950,  payment:'Stripe',    status:'paid',      notes:'' },
    { id:'DNS-1040', date:'2026-05-10', customerId:'cu_3', items:[{productId:'p_gt',   qty:1,price:9900}],                                       shipping:0, discount:0,    discountCode:'',          total:9900,  payment:'Easypaisa', status:'shipped',   notes:'' },
    { id:'DNS-1039', date:'2026-05-10', customerId:'cu_4', items:[{productId:'p_ss50', qty:1,price:3200}],                                       shipping:0, discount:0,    discountCode:'',          total:3200,  payment:'COD',       status:'pending',   notes:'' },
    { id:'DNS-1038', date:'2026-05-09', customerId:'cu_5', items:[{productId:'p_hi250',qty:1,price:4950},{productId:'p_ct150',qty:1,price:2900}], shipping:0, discount:500,  discountCode:'GIFT500',   total:7350,  payment:'Stripe',    status:'delivered', notes:'' },
    { id:'DNS-1037', date:'2026-05-09', customerId:'cu_6', items:[{productId:'p_bo30', qty:1,price:2400}],                                       shipping:0, discount:0,    discountCode:'',          total:2400,  payment:'COD',       status:'cancelled', notes:'Customer cancelled at door' },
    { id:'DNS-1036', date:'2026-05-08', customerId:'cu_7', items:[{productId:'p_hm200',qty:1,price:3800},{productId:'p_ct150',qty:1,price:2900}], shipping:0, discount:0,    discountCode:'',          total:6700,  payment:'JazzCash',  status:'delivered', notes:'' },
    { id:'DNS-1035', date:'2026-05-08', customerId:'cu_8', items:[{productId:'p_hi250',qty:1,price:4950}],                                       shipping:0, discount:0,    discountCode:'',          total:4950,  payment:'Stripe',    status:'delivered', notes:'' },
  ],
  reviews: [
    { id:'r_1', customerId:'cu_1', productId:'p_hi250', rating:5, text:"After eight weeks of consistent use, my edges have come back. Quietly remarkable.",                    date:'2026-05-10', status:'approved' },
    { id:'r_2', customerId:'cu_2', productId:'p_hi250', rating:5, text:"My favourite Sunday ritual. Calmer scalp than in years.",                                               date:'2026-05-09', status:'approved' },
    { id:'r_3', customerId:'cu_3', productId:'p_hm200', rating:4, text:"Absorbs cleanly, doesn't feel heavy. Loving the texture.",                                             date:'2026-05-08', status:'approved' },
    { id:'r_4', customerId:'cu_5', productId:'p_bo30',  rating:5, text:"Subtle scent, dense feel by week 4.",                                                                   date:'2026-05-07', status:'pending'  },
    { id:'r_5', customerId:'cu_4', productId:'p_ss50',  rating:3, text:"Good, but takes time. Will continue.",                                                                  date:'2026-05-06', status:'pending'  },
    { id:'r_6', customerId:'cu_6', productId:'p_hi250', rating:5, text:"Worth every rupee. Recommended to all my sisters.",                                                     date:'2026-05-05', status:'pending'  },
  ],
  discounts: [
    { id:'d_1', code:'WELCOME20', type:'percent',  value:20,  usageLimit:0,   used:342, expiresAt:'',           status:'active',    scope:'all', minOrder:0,    description:'First order discount'       },
    { id:'d_2', code:'RITUAL15',  type:'percent',  value:15,  usageLimit:500, used:89,  expiresAt:'2026-06-30', status:'active',    scope:'all', minOrder:3000, description:'Newsletter subscribers'     },
    { id:'d_3', code:'GIFT500',   type:'amount',   value:500, usageLimit:200, used:26,  expiresAt:'2026-07-15', status:'active',    scope:'all', minOrder:5000, description:'Gift card credit'            },
    { id:'d_4', code:'VIPRITUAL', type:'percent',  value:25,  usageLimit:50,  used:4,   expiresAt:'2026-12-31', status:'active',    scope:'all', minOrder:0,    description:'VIP customers only'         },
    { id:'d_5', code:'FREESHIP',  type:'shipping', value:0,   usageLimit:0,   used:120, expiresAt:'2026-08-31', status:'scheduled', scope:'all', minOrder:2000, description:'Free shipping campaign'     },
  ],
  campaigns: [
    { id:'cp_1', name:'Letters from the Apothecary — May', subject:'A quiet note from Densova',    content:'Dear ritualist, this month we share...',  audience:'subscribers', scheduledAt:'2026-05-01', status:'sent',      sent:1842, opens:62.4, clicks:14.2, revenue:28400 },
    { id:'cp_2', name:'Ramadan Gift Sets',                 subject:'Curated for the season',       content:'Slow rituals make thoughtful gifts...',    audience:'all',         scheduledAt:'2026-03-15', status:'sent',      sent:2104, opens:58.1, clicks:11.8, revenue:47200 },
    { id:'cp_3', name:'Scalp Serum Launch',                subject:'Awaken — now available',       content:'Our scalp serum returns...',               audience:'vip',         scheduledAt:'2026-05-20', status:'scheduled', sent:0,    opens:0,    clicks:0,    revenue:0    },
  ],
  content: {
    announce: 'Free Shipping over Rs 5,000',
    hero: {
      eyebrow:'Densova Apothecary · Est. 2024',
      headline:"Botanicals, bottled in {em}quiet ritual.{/em}",
      pillars:'Strength · Growth · Repair',
      description:"Slow-pressed in small batches with eight time-honoured herbs. Densova is a modern apothecary built around one belief — that nature, given time, knows what it's doing.",
      ctaText:'Shop the Collection',
      ctaLink:'#shop',
      videoFile:'densova-reel.mp4'
    },
    quote: {
      text:'Old hands. {em}Good plants.{/em} Slow rituals returned, untouched, to a faster world.',
      signed:'— The Densova Apothecary'
    },
    about: {
      eyebrow:'The Hero Ritual',
      headline:"A botanical concentrate, {em}built to reach the root.{/em}",
      body:'Densova Advanced Herbal Hair Infusion is a rare-grade botanical concentrate, slow-pressed and matured under low heat — the way oils were prepared long before laboratories. Eight herbs, no fillers, no noise.',
    },
    ingredients: [
      { name:'Amla',          latin:'Phyllanthus emblica',         desc:'Tannin-rich keeper of pigment. Deepens colour and fortifies the strand.'           },
      { name:'Reetha',        latin:'Sapindus mukorossi',          desc:'The gentle cleanser. Lifts impurity without stripping natural oils.'               },
      { name:'Shikakai',      latin:'Acacia concinna',             desc:'"Fruit for the hair." Softens, untangles, slowly brings lustre.'                  },
      { name:'Rosemary',      latin:'Salvia rosmarinus',           desc:'Stimulates circulation. The most studied botanical for hair growth.'               },
      { name:'Aloe Vera',     latin:'Aloe barbadensis',            desc:'A cooling balm. Calms scalp, hydrates deeply, prepares for absorption.'           },
      { name:'Hibiscus',      latin:'Hibiscus rosa-sinensis',      desc:'A flower revered for thickness. Encourages density and softens cuticle.'          },
      { name:'Fenugreek',     latin:'Trigonella foenum-graecum',   desc:'Protein-rich seed. Fortifies thinning strands, quiets shedding.'                  },
      { name:'Nigella Sativa',latin:'Black seed',                  desc:'The seed of blessing. A revered tonic for resilience and density.'                },
    ],
    howTo: [
      { num:'01', title:'Intensive Care', sub:'Direct application · 2–3 times a week', steps:'Warm 1–2 teaspoons between palms.\nSection hair and massage into scalp 3–5 minutes.\nSmooth through mid-lengths to ends.\nLeave 45 minutes — ideally overnight — then cleanse.' },
      { num:'02', title:'Daily Boost',    sub:'Mix-in · everyday strengthening',       steps:'Add a few drops to shampoo or conditioner.\nWork into wet hair and scalp, let settle 60 seconds.\nRinse with cool water to seal the cuticle.\nUse consistently — the ritual rewards patience.' },
    ],
    testimonials: [
      { name:'Amaira K.', city:'Lahore, Pakistan',    rating:5, text:"After eight weeks of consistent use, my edges have come back. I never thought I'd say that about a hair oil — it's quietly remarkable." },
      { name:'Sara M.',   city:'Karachi, Pakistan',   rating:5, text:"The scent alone has become my favourite part of Sundays. My hair is shinier, but more than that — my scalp feels calmer than it has in years." },
      { name:'Hina R.',   city:'Islamabad, Pakistan', rating:4, text:"I bought this for my mother and ended up keeping one for myself. It absorbs cleanly, doesn't feel heavy, and the bottle itself feels like a small ceremony." },
    ],
    faq: [
      { q:'How long before I see results?',                           a:'Botanicals work in seasons, not days. Most notice a calmer scalp within two weeks, visibly stronger strands by week six, and a meaningful difference at the 90-day mark.' },
      { q:'Is it suitable for coloured or chemically-treated hair?',  a:"Yes. The infusion is free of sulfates, silicones and parabens, so it doesn't strip pigment or interact with most treatments." },
      { q:'Will it leave my hair greasy?',                            a:"No. The cold-pressed base is unusually light — it absorbs into the scalp rather than sitting on it." },
      { q:'Where is Densova made?',                                   a:"Densova is hand-blended in small batches in Pakistan, drawing on the herbal heritage of the region." },
      { q:'Do you ship internationally?',                             a:"We ship across Pakistan with free delivery on orders above Rs 5,000. International shipping is coming soon." },
      { q:'What is your return policy?',                              a:"Our 30-day Ritual Promise: if you don't see a difference, return your bottle — even half-used — for a full refund." },
    ],
    footer: {
      philosophy:'"We believe in old hands and good plants — in formulas earned through patience, and rituals returned, untouched, to a faster world."',
      email:'care@densova.com',
      phone:'+92 300 000 0000',
      hours:'Mon — Sat, 10am–6pm PKT',
      instagram:'https://instagram.com/densova',
      facebook:'https://facebook.com/densova',
      tiktok:'',
      whatsapp:''
    }
  },
  appearance: {
    colors: { forest:'#2E3A1F', cream:'#FAF6EC', gold:'#C9A24E', beige:'#EDE1CC', moss:'#5C6B3F', ink:'#1B1A15' },
    fonts:  { display:'Fraunces', body:'Inter' },
    announceBg:'#1F2814',
    announceColor:'#F3EBDA'
  },
  settings: {
    brand: { name:'Densova', tagline:'Inspired by Nature', email:'care@densova.com', phone:'+92 300 000 0000', currency:'PKR', timezone:'Asia/Karachi', story:'We believe in old hands and good plants — in formulas earned through patience, and rituals returned, untouched, to a faster world.' },
    shipping: [
      { id:'sh_1', zone:'Pakistan',      rate:350,  freeAbove:5000, delivery:'2–4 days'   },
      { id:'sh_2', zone:'UAE',           rate:1500, freeAbove:0,    delivery:'5–7 days'   },
      { id:'sh_3', zone:'International', rate:2800, freeAbove:0,    delivery:'10–14 days' },
    ],
    payment: { cod:true, stripe:true, easypaisa:true, paypal:false },
    notifications: { emailOnOrder:true, daily:true, lowStock:true, sms:false, push:true },
    team: [
      { id:'t_1', name:'Syed Husnain', email:'syedhusnain.ali@abacus-global.com', role:'Owner',   lastActive:'Now'     },
      { id:'t_2', name:'Mariam Khan',  email:'mariam@densova.com',                role:'Manager', lastActive:'2 h ago' },
      { id:'t_3', name:'Faisal Ahmed', email:'faisal@densova.com',                role:'Staff',   lastActive:'1 d ago' },
    ],
    store: { live:true }
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
export const newId = (prefix = 'id') =>
  prefix + '_' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4)

export const slugify = (s) =>
  String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export const fmt = (n) => 'Rs ' + Number(n || 0).toLocaleString('en-PK')

export const initials = (name) =>
  (name || '?').split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()

export const bottleStyle = (b) => {
  const colors = {
    cream: 'linear-gradient(180deg,#EADFCB,#B9A781)',
    green: 'linear-gradient(180deg,#7B8761,#424E2E)',
    amber: 'linear-gradient(180deg,#D2A766,#8A6526)',
    mint:  'linear-gradient(180deg,#A1E0B8,#5BAF7C)',
  }
  return colors[b] || colors.cream
}

export const today = () => new Date().toISOString().slice(0, 10)

// ─── Load / save ───────────────────────────────────────────────────────────────
function loadDb() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(DEFAULT_DB)
    const saved = JSON.parse(raw)
    // Forward-compat: merge any missing top-level keys
    const db = { ...structuredClone(DEFAULT_DB), ...saved }
    return db
  } catch {
    return structuredClone(DEFAULT_DB)
  }
}

// ─── Slice ─────────────────────────────────────────────────────────────────────
const adminDbSlice = createSlice({
  name: 'adminDb',
  initialState: loadDb(),
  reducers: {
    // Categories
    addCategory(state, { payload }) {
      state.categories.push({ id: newId('c'), ...payload })
    },
    updateCategory(state, { payload: { id, data } }) {
      const i = state.categories.findIndex((x) => x.id === id)
      if (i !== -1) state.categories[i] = { ...state.categories[i], ...data }
    },
    deleteCategory(state, { payload: id }) {
      const subs = state.categories.filter((c) => c.parentId === id).map((c) => c.id)
      // uncategorize products
      state.products.forEach((p) => {
        if (p.categoryId === id || subs.includes(p.categoryId)) p.categoryId = null
      })
      state.categories = state.categories.filter((c) => c.id !== id && c.parentId !== id)
    },

    // Products
    addProduct(state, { payload }) {
      state.products.push({ id: newId('p'), sold: 0, ...payload, featured: !!payload.featured })
    },
    updateProduct(state, { payload: { id, data } }) {
      const i = state.products.findIndex((x) => x.id === id)
      if (i !== -1) state.products[i] = { ...state.products[i], ...data, featured: !!data.featured }
    },
    duplicateProduct(state, { payload: id }) {
      const p = state.products.find((x) => x.id === id)
      if (p) state.products.push({ ...p, id: newId('p'), name: p.name + ' (Copy)', sku: p.sku + '-2', status: 'draft', sold: 0 })
    },
    deleteProduct(state, { payload: id }) {
      state.products = state.products.filter((x) => x.id !== id)
    },

    // Orders
    addOrder(state, { payload }) {
      const orderId = 'DNS-' + (1000 + state.orders.length + 1)
      state.orders.unshift({ id: orderId, ...payload })
    },
    updateOrder(state, { payload: { id, data } }) {
      const i = state.orders.findIndex((x) => x.id === id)
      if (i !== -1) state.orders[i] = { ...state.orders[i], ...data }
    },
    updateOrderStatus(state, { payload: { id, status } }) {
      const o = state.orders.find((x) => x.id === id)
      if (o) o.status = status
    },
    saveOrderNotes(state, { payload: { id, notes } }) {
      const o = state.orders.find((x) => x.id === id)
      if (o) o.notes = notes
    },
    deleteOrder(state, { payload: id }) {
      state.orders = state.orders.filter((x) => x.id !== id)
    },

    // Customers
    addCustomer(state, { payload }) {
      state.customers.push({ id: newId('cu'), orders: 0, ltv: 0, lastOrder: '', ...payload })
    },
    updateCustomer(state, { payload: { id, data } }) {
      const i = state.customers.findIndex((x) => x.id === id)
      if (i !== -1) state.customers[i] = { ...state.customers[i], ...data }
    },
    deleteCustomer(state, { payload: id }) {
      state.customers = state.customers.filter((x) => x.id !== id)
    },

    // Reviews
    addReview(state, { payload }) {
      state.reviews.push({ id: newId('r'), ...payload })
    },
    updateReview(state, { payload: { id, data } }) {
      const i = state.reviews.findIndex((x) => x.id === id)
      if (i !== -1) state.reviews[i] = { ...state.reviews[i], ...data }
    },
    approveReview(state, { payload: id }) {
      const r = state.reviews.find((x) => x.id === id)
      if (r) r.status = 'approved'
    },
    rejectReview(state, { payload: id }) {
      const r = state.reviews.find((x) => x.id === id)
      if (r) r.status = 'rejected'
    },
    deleteReview(state, { payload: id }) {
      state.reviews = state.reviews.filter((x) => x.id !== id)
    },

    // Discounts
    addDiscount(state, { payload }) {
      state.discounts.push({ id: newId('d'), used: 0, ...payload, code: (payload.code || '').toUpperCase() })
    },
    updateDiscount(state, { payload: { id, data } }) {
      const i = state.discounts.findIndex((x) => x.id === id)
      if (i !== -1) state.discounts[i] = { ...state.discounts[i], ...data, code: (data.code || '').toUpperCase() }
    },
    deleteDiscount(state, { payload: id }) {
      state.discounts = state.discounts.filter((x) => x.id !== id)
    },

    // Campaigns
    addCampaign(state, { payload }) {
      state.campaigns.push({ id: newId('cp'), sent: 0, opens: 0, clicks: 0, revenue: 0, ...payload })
    },
    updateCampaign(state, { payload: { id, data } }) {
      const i = state.campaigns.findIndex((x) => x.id === id)
      if (i !== -1) state.campaigns[i] = { ...state.campaigns[i], ...data }
    },
    deleteCampaign(state, { payload: id }) {
      state.campaigns = state.campaigns.filter((x) => x.id !== id)
    },
    saveAnnouncement(state, { payload: { text, bg, color } }) {
      state.content.announce = text
      state.appearance.announceBg = bg
      state.appearance.announceColor = color
    },

    // Content
    updateContent(state, { payload: { section, data } }) {
      if (section === 'hero')         state.content.hero         = { ...state.content.hero,  ...data }
      else if (section === 'quote')   state.content.quote        = data
      else if (section === 'about')   state.content.about        = data
      else if (section === 'ingredients')  state.content.ingredients  = data
      else if (section === 'howTo')        state.content.howTo        = data
      else if (section === 'testimonials') state.content.testimonials = data
      else if (section === 'faq')          state.content.faq          = data
      else if (section === 'footer')       state.content.footer       = data
    },
    resetContent(state) {
      state.content = structuredClone(DEFAULT_DB.content)
    },

    // Appearance
    updateAppearance(state, { payload }) {
      state.appearance = { ...state.appearance, ...payload }
    },
    resetAppearance(state) {
      state.appearance = structuredClone(DEFAULT_DB.appearance)
    },

    // Settings
    updateSettingsBrand(state, { payload }) {
      state.settings.brand    = { ...state.settings.brand, ...payload.brand }
      state.settings.store    = { ...state.settings.store, live: payload.live }
    },
    updateSettingsPayment(state, { payload }) {
      state.settings.payment = payload
    },
    updateSettingsNotifications(state, { payload }) {
      state.settings.notifications = payload
    },
    addShippingZone(state, { payload }) {
      state.settings.shipping.push({ id: newId('sh'), ...payload })
    },
    updateShippingZone(state, { payload: { id, data } }) {
      const i = state.settings.shipping.findIndex((x) => x.id === id)
      if (i !== -1) state.settings.shipping[i] = { ...state.settings.shipping[i], ...data }
    },
    deleteShippingZone(state, { payload: id }) {
      state.settings.shipping = state.settings.shipping.filter((x) => x.id !== id)
    },
    addTeamMember(state, { payload }) {
      state.settings.team.push({ id: newId('t'), lastActive: 'Just invited', ...payload })
    },
    updateTeamMember(state, { payload: { id, data } }) {
      const i = state.settings.team.findIndex((x) => x.id === id)
      if (i !== -1) state.settings.team[i] = { ...state.settings.team[i], ...data }
    },
    deleteTeamMember(state, { payload: id }) {
      state.settings.team = state.settings.team.filter((x) => x.id !== id)
    },

    // Danger zone
    resetDb() {
      return structuredClone(DEFAULT_DB)
    },
  },
})

// ─── Selectors ─────────────────────────────────────────────────────────────────
export const selectDb           = (s) => s.adminDb
export const selectCategories   = (s) => s.adminDb.categories
export const selectProducts     = (s) => s.adminDb.products
export const selectOrders       = (s) => s.adminDb.orders
export const selectCustomers    = (s) => s.adminDb.customers
export const selectReviews      = (s) => s.adminDb.reviews
export const selectDiscounts    = (s) => s.adminDb.discounts
export const selectCampaigns    = (s) => s.adminDb.campaigns
export const selectContent      = (s) => s.adminDb.content
export const selectAppearance   = (s) => s.adminDb.appearance
export const selectSettings     = (s) => s.adminDb.settings

export const selectPendingOrdersCount  = (s) => s.adminDb.orders.filter((o) => o.status === 'pending').length
export const selectPendingReviewsCount = (s) => s.adminDb.reviews.filter((r) => r.status === 'pending').length

export const {
  addCategory, updateCategory, deleteCategory,
  addProduct, updateProduct, duplicateProduct, deleteProduct,
  addOrder, updateOrder, updateOrderStatus, saveOrderNotes, deleteOrder,
  addCustomer, updateCustomer, deleteCustomer,
  addReview, updateReview, approveReview, rejectReview, deleteReview,
  addDiscount, updateDiscount, deleteDiscount,
  addCampaign, updateCampaign, deleteCampaign, saveAnnouncement,
  updateContent, resetContent,
  updateAppearance, resetAppearance,
  updateSettingsBrand, updateSettingsPayment, updateSettingsNotifications,
  addShippingZone, updateShippingZone, deleteShippingZone,
  addTeamMember, updateTeamMember, deleteTeamMember,
  resetDb,
} = adminDbSlice.actions

export default adminDbSlice.reducer
