# Graph Report - .  (2026-07-01)

## Corpus Check
- 89 files · ~60,367 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 502 nodes · 839 edges · 39 communities (29 shown, 10 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.81)
- Token cost: 44,939 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Components trustbadge|Components: trustbadge]]
- [[_COMMUNITY_App assistantwidget|App: assistantwidget]]
- [[_COMMUNITY_Root 1|Root #1]]
- [[_COMMUNITY_Components searchresults|Components: searchresults]]
- [[_COMMUNITY_Pages saathidashboard|Pages: saathidashboard]]
- [[_COMMUNITY_API Layer admin 1|API Layer: admin #1]]
- [[_COMMUNITY_Pages sellers|Pages: sellers]]
- [[_COMMUNITY_Pages home|Pages: home]]
- [[_COMMUNITY_API Layer admin 2|API Layer: admin #2]]
- [[_COMMUNITY_API Layer protect|API Layer: protect]]
- [[_COMMUNITY_API Layer saathiprofile|API Layer: saathiprofile]]
- [[_COMMUNITY_API Layer account|API Layer: account]]
- [[_COMMUNITY_Pages saathi|Pages: saathi]]
- [[_COMMUNITY_Pages admin 1|Pages: admin #1]]
- [[_COMMUNITY_Content guideseo|Content: guideseo]]
- [[_COMMUNITY_Pages admin 2|Pages: admin #2]]
- [[_COMMUNITY_Components reviewspanel|Components: reviewspanel]]
- [[_COMMUNITY_API Layer admin 3|API Layer: admin #3]]
- [[_COMMUNITY_API Layer recentlyviewedrail|API Layer: recentlyviewedrail]]
- [[_COMMUNITY_Docs 1|Docs #1]]
- [[_COMMUNITY_API Layer admin 4|API Layer: admin #4]]
- [[_COMMUNITY_API Layer admin 5|API Layer: admin #5]]
- [[_COMMUNITY_Pages admin 3|Pages: admin #3]]
- [[_COMMUNITY_Pages submitshop|Pages: submitshop]]
- [[_COMMUNITY_Docs 2|Docs #2]]
- [[_COMMUNITY_Pages admin 4|Pages: admin #4]]
- [[_COMMUNITY_API Layer admin 6|API Layer: admin #6]]
- [[_COMMUNITY_Components worldcuprail|Components: worldcuprail]]
- [[_COMMUNITY_Components searchbar|Components: searchbar]]
- [[_COMMUNITY_Deploy|Deploy]]
- [[_COMMUNITY_Components trendingstrip|Components: trendingstrip]]
- [[_COMMUNITY_Components newslettersection|Components: newslettersection]]
- [[_COMMUNITY_Docs 3|Docs #3]]
- [[_COMMUNITY_Docs 4|Docs #4]]
- [[_COMMUNITY_Docs 5|Docs #5]]

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 17 edges
2. `SmartVerdict()` - 9 edges
3. `deliveryText()` - 9 edges
4. `api` - 7 edges
5. `LoadingSpinner()` - 7 edges
6. `tierOf()` - 7 edges
7. `ProductDetail()` - 7 edges
8. `getShopTrust()` - 6 edges
9. `ServiceUnavailable()` - 6 edges
10. `valueScore()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Bangla Brand Line in Hero` --references--> `Google Fonts (Fraunces, DM Sans, JetBrains Mono, Hind Siliguri)`  [INFERRED]
  LANDING_STANDOUT_CHANGES.md → index.html
- `AdminLayout()` --calls--> `useAuth()`  [EXTRACTED]
  src/pages/admin/AdminLayout.jsx → src/auth/AuthContext.jsx
- `SignIn()` --calls--> `useAuth()`  [EXTRACTED]
  src/pages/SignIn.jsx → src/auth/AuthContext.jsx
- `Staging Deploy Job (deploy-staging)` --semantically_similar_to--> `Production Deploy Job (deploy-production)`  [INFERRED] [semantically similar]
  .github/workflows/staging-deploy.yml → .github/workflows/production-deploy.yml
- `Account()` --calls--> `useAuth()`  [EXTRACTED]
  src/pages/Account.jsx → src/auth/AuthContext.jsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Trust-first Landing Redesign of Home.jsx** — landing_standout_changes_protectshowcase, landing_standout_changes_trust_microproofs, landing_standout_changes_bangla_brand_line, landing_standout_changes_trust_first_reorder, landing_standout_changes_home_jsx [INFERRED 0.85]
- **Frontend CI/CD Deploy Pipeline (prod + staging)** — github_workflows_production_deploy_deploy_production, github_workflows_staging_deploy_deploy_staging, github_workflows_production_deploy_api_cloaking [INFERRED 0.80]

## Communities (39 total, 10 thin omitted)

### Community 0 - "Components: trustbadge"
Cohesion: 0.05
Nodes (43): fireBeacon(), getAnonId(), trackClick(), trackPageView(), trackView(), affiliateUrl(), getDailyPriceHistory(), getProduct() (+35 more)

### Community 1 - "App: assistantwidget"
Cohesion: 0.05
Nodes (35): assistantChat(), applyTheme(), getTheme(), toggleTheme(), Account, AdminAnalytics, AdminAuditLog, AdminCache (+27 more)

### Community 2 - "Root #1"
Cohesion: 0.06
Nodes (30): dependencies, axios, lucide-react, @phosphor-icons/react, react, react-dom, react-router-dom, recharts (+22 more)

### Community 3 - "Components: searchresults"
Cohesion: 0.09
Nodes (18): getAllProducts(), getCategories(), getHotDrops(), getShopTrust(), SkeletonRow(), formatPrice(), gradientByCategory, ProductCard() (+10 more)

### Community 4 - "Pages: saathidashboard"
Cohesion: 0.10
Nodes (19): searchProducts(), saathiAttachProduct(), saathiConnectMessenger(), saathiDetachProduct(), saathiListProducts(), saathiLiveAssist(), saathiRecentQueries(), saathiStats() (+11 more)

### Community 5 - "API Layer: admin #1"
Cohesion: 0.08
Nodes (21): analyticsDailyUsers(), analyticsFunnel(), analyticsHourly(), analyticsOverview(), analyticsRequests(), analyticsResultShops(), analyticsShopClicksByCategory(), analyticsShopPriceWins() (+13 more)

### Community 6 - "Pages: sellers"
Cohesion: 0.10
Nodes (13): listSubscribers(), newsletterAnalytics(), triggerNewsletter(), getDashboardStats(), getSellers(), LoadingSpinner(), Dashboard(), fmt() (+5 more)

### Community 7 - "Pages: home"
Cohesion: 0.10
Nodes (11): submitFeedback(), FeedbackSection(), CountUp(), FAQS, Home(), INSIGHTS, MARQUEE_SHOPS, QUOTES (+3 more)

### Community 8 - "API Layer: admin #2"
Cohesion: 0.18
Nodes (12): approvePendingShop(), bulkSetShopStatus(), diagCollections(), editShop(), listPendingShops(), listShops(), reindexShop(), rejectPendingShop() (+4 more)

### Community 9 - "API Layer: protect"
Cohesion: 0.16
Nodes (8): getHeadlineStats(), getLiveStats(), protectAssess(), protectConfirmOrder(), protectCreateOrder(), protectDisputeOrder(), protectGetOrder(), PAYMENTS

### Community 10 - "API Layer: saathiprofile"
Cohesion: 0.17
Nodes (10): getAuthToken(), getMe(), passwordLogin(), saathiDisconnectMessenger(), saathiPublicProfile(), setAuthToken(), signOut(), AuthContext (+2 more)

### Community 11 - "API Layer: account"
Cohesion: 0.20
Nodes (13): accountSearchHistory(), addSavedSearch(), listNotifications(), listSavedSearches(), listWishlist(), markNotificationsRead(), removeFromWishlist(), removeSavedSearch() (+5 more)

### Community 12 - "Pages: saathi"
Cohesion: 0.16
Nodes (8): saathiMe(), saathiSignup(), useAuth(), Navbar(), Account(), Saathi(), SaathiDashboard(), SaathiSignup()

### Community 14 - "Content: guideseo"
Cohesion: 0.26
Nodes (5): GuideSEO(), getGuide(), GUIDES, otherGuides(), GuideDetail()

### Community 15 - "Pages: admin #2"
Cohesion: 0.20
Nodes (5): getIndexerHistory(), indexStatus(), retryFailedShops(), triggerReindex(), AdminLayout()

### Community 16 - "Components: reviewspanel"
Cohesion: 0.22
Nodes (8): getProductReviews(), markReviewHelpful(), postDeliveryReport(), postProductReview(), emptyForm, fmtDate(), ReviewCard(), ReviewsPanel()

### Community 17 - "API Layer: admin #3"
Cohesion: 0.25
Nodes (4): adminDeleteProduct(), adminEditProduct(), adminListCatalog(), adminMergeProducts()

### Community 18 - "API Layer: recentlyviewedrail"
Cohesion: 0.36
Nodes (4): getProductsByIds(), clearRecent(), getRecentIds(), pushRecent()

### Community 19 - "Docs #1"
Cohesion: 0.33
Nodes (6): Google Fonts (Fraunces, DM Sans, JetBrains Mono, Hind Siliguri), Bangla Brand Line in Hero, Home.jsx (landing page target), ProtectShowcase Surfacing on Homepage, Trust-first Emphasis Reorder, Trust Micro-proofs Under Hero Search

### Community 20 - "API Layer: admin #4"
Cohesion: 0.33
Nodes (3): approveOffer(), listOffers(), rejectOffer()

### Community 21 - "API Layer: admin #5"
Cohesion: 0.33
Nodes (3): jobRuns(), listJobs(), runJob()

### Community 23 - "Pages: submitshop"
Cohesion: 0.33
Nodes (3): submitShop(), CATEGORIES, PLATFORMS

### Community 24 - "Docs #2"
Cohesion: 0.50
Nodes (5): axios Client (src/api/api.js), Backend API Contract, Dashboard Page (src/pages/Dashboard.jsx), SearchBar Autosuggest (src/components/SearchBar.jsx), SearchResults Page (src/pages/SearchResults.jsx)

### Community 26 - "API Layer: admin #6"
Cohesion: 0.40
Nodes (3): flushAllCaches(), flushCache(), listCaches()

### Community 29 - "Deploy"
Cohesion: 0.67
Nodes (3): VITE_API_BASE Opaque API Prefix (cloaking), Production Deploy Job (deploy-production), Staging Deploy Job (deploy-staging)

## Knowledge Gaps
- **89 isolated node(s):** `check-gstack.sh script`, `name`, `private`, `version`, `type` (+84 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAuth()` connect `Pages: saathi` to `Components: trustbadge`, `App: assistantwidget`, `Pages: saathidashboard`, `API Layer: saathiprofile`, `API Layer: account`, `Pages: admin #2`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `api` connect `Pages: admin #1` to `API Layer: admin #2`, `API Layer: protect`, `API Layer: saathiprofile`, `Pages: admin #2`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `LoadingSpinner()` connect `Pages: sellers` to `Components: trustbadge`, `App: assistantwidget`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **What connects `check-gstack.sh script`, `name`, `private` to the rest of the system?**
  _92 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Components: trustbadge` be split into smaller, more focused modules?**
  _Cohesion score 0.051360842844600525 - nodes in this community are weakly interconnected._
- **Should `App: assistantwidget` be split into smaller, more focused modules?**
  _Cohesion score 0.05272108843537415 - nodes in this community are weakly interconnected._
- **Should `Root #1` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._