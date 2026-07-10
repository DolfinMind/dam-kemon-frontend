# Graph Report - frontend  (2026-07-07)

## Corpus Check
- 92 files · ~64,600 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 570 nodes · 946 edges · 52 communities (34 shown, 18 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.78)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f0232c18`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_ProductDetail.jsx|ProductDetail.jsx]]
- [[_COMMUNITY_App.jsx|App.jsx]]
- [[_COMMUNITY_devDependencies|devDependencies]]
- [[_COMMUNITY_Sellers.jsx|Sellers.jsx]]
- [[_COMMUNITY_SaathiDashboard.jsx|SaathiDashboard.jsx]]
- [[_COMMUNITY_admin.js|admin.js]]
- [[_COMMUNITY_ScrollToTop.jsx|ScrollToTop.jsx]]
- [[_COMMUNITY_Home.jsx|Home.jsx]]
- [[_COMMUNITY_AdminShops.jsx|AdminShops.jsx]]
- [[_COMMUNITY_api.js|api.js]]
- [[_COMMUNITY_auth.js|auth.js]]
- [[_COMMUNITY_auth.js|auth.js]]
- [[_COMMUNITY_Navbar.jsx|Navbar.jsx]]
- [[_COMMUNITY_AdminStats.jsx|AdminStats.jsx]]
- [[_COMMUNITY_guides.jsx|guides.jsx]]
- [[_COMMUNITY_AdminIndexer.jsx|AdminIndexer.jsx]]
- [[_COMMUNITY_ReviewsPanel.jsx|ReviewsPanel.jsx]]
- [[_COMMUNITY_AdminCatalog.jsx|AdminCatalog.jsx]]
- [[_COMMUNITY_RecentlyViewedRail.jsx|RecentlyViewedRail.jsx]]
- [[_COMMUNITY_Google Fonts (Fraunces, DM Sans, JetBrains Mono, Hind Siliguri)|Google Fonts (Fraunces, DM Sans, JetBrains Mono, Hind Siliguri)]]
- [[_COMMUNITY_AdminOffers.jsx|AdminOffers.jsx]]
- [[_COMMUNITY_AdminJobs.jsx|AdminJobs.jsx]]
- [[_COMMUNITY_AdminSearchLog.jsx|AdminSearchLog.jsx]]
- [[_COMMUNITY_SubmitShop.jsx|SubmitShop.jsx]]
- [[_COMMUNITY_dam-kemon-frontend|dam-kemon-frontend]]
- [[_COMMUNITY_AdminReviews.jsx|AdminReviews.jsx]]
- [[_COMMUNITY_AdminCache.jsx|AdminCache.jsx]]
- [[_COMMUNITY_WorldCupRail.jsx|WorldCupRail.jsx]]
- [[_COMMUNITY_Dashboard.jsx|Dashboard.jsx]]
- [[_COMMUNITY_Production Deploy Job (deploy-production)|Production Deploy Job (deploy-production)]]
- [[_COMMUNITY_AdminStats.jsx|AdminStats.jsx]]
- [[_COMMUNITY_check-gstack.sh|check-gstack.sh]]
- [[_COMMUNITY_SPA Root Shell + main.jsx Entry|SPA Root Shell + main.jsx Entry]]
- [[_COMMUNITY_CLAUDE|CLAUDE.md]]
- [[_COMMUNITY_Landing-page standout changes — Home.jsx|Landing-page "standout" changes — Home.jsx]]
- [[_COMMUNITY_AssistantWidget.jsx|AssistantWidget.jsx]]
- [[_COMMUNITY_AdminPendingShops.jsx|AdminPendingShops.jsx]]
- [[_COMMUNITY_SaathiProfile.jsx|SaathiProfile.jsx]]
- [[_COMMUNITY_num|num]]
- [[_COMMUNITY_Bangla Brand Line in Hero|Bangla Brand Line in Hero]]
- [[_COMMUNITY_Home.jsx (landing page target)|Home.jsx (landing page target)]]
- [[_COMMUNITY_ProtectShowcase Surfacing on Homepage|ProtectShowcase Surfacing on Homepage]]
- [[_COMMUNITY_Trust-first Emphasis Reorder|Trust-first Emphasis Reorder]]
- [[_COMMUNITY_Trust Micro-proofs Under Hero Search|Trust Micro-proofs Under Hero Search]]
- [[_COMMUNITY_axios Client (srcapiapi.js)|axios Client (src/api/api.js)]]
- [[_COMMUNITY_Dashboard Page (srcpagesDashboard.jsx)|Dashboard Page (src/pages/Dashboard.jsx)]]
- [[_COMMUNITY_SearchBar Autosuggest (srccomponentsSearchBar.jsx)|SearchBar Autosuggest (src/components/SearchBar.jsx)]]
- [[_COMMUNITY_SearchResults Page (srcpagesSearchResults.jsx)|SearchResults Page (src/pages/SearchResults.jsx)]]

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 26 edges
2. `dam-kemon-frontend` - 11 edges
3. `SmartVerdict()` - 9 edges
4. `deliveryText()` - 9 edges
5. `api` - 7 edges
6. `LoadingSpinner()` - 7 edges
7. `tierOf()` - 7 edges
8. `ProductDetail()` - 7 edges
9. `Landing-page "standout" changes — Home.jsx` - 7 edges
10. `fireBeacon()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Account()` --calls--> `useAuth()`  [EXTRACTED]
  src/pages/Account.jsx → src/auth/AuthContext.jsx
- `AdminLayout()` --calls--> `useAuth()`  [EXTRACTED]
  src/pages/admin/AdminLayout.jsx → src/auth/AuthContext.jsx
- `SignIn()` --calls--> `useAuth()`  [EXTRACTED]
  src/pages/SignIn.jsx → src/auth/AuthContext.jsx
- `SignUp()` --calls--> `useAuth()`  [EXTRACTED]
  src/pages/SignUp.jsx → src/auth/AuthContext.jsx
- `Staging Deploy Job (deploy-staging)` --semantically_similar_to--> `Production Deploy Job (deploy-production)`  [INFERRED] [semantically similar]
  .github/workflows/staging-deploy.yml → .github/workflows/production-deploy.yml

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Trust-first Landing Redesign of Home.jsx** — landing_standout_changes_protectshowcase, landing_standout_changes_trust_microproofs, landing_standout_changes_bangla_brand_line, landing_standout_changes_trust_first_reorder, landing_standout_changes_home_jsx [INFERRED 0.85]
- **Frontend CI/CD Deploy Pipeline (prod + staging)** — github_workflows_production_deploy_deploy_production, github_workflows_staging_deploy_deploy_staging, github_workflows_production_deploy_api_cloaking [INFERRED 0.80]

## Communities (52 total, 18 thin omitted)

### Community 0 - "ProductDetail.jsx"
Cohesion: 0.07
Nodes (29): fireBeacon(), getAnonId(), trackClick(), trackPageView(), trackSuggestClick(), trackView(), affiliateUrl(), getDailyPriceHistory() (+21 more)

### Community 1 - "App.jsx"
Cohesion: 0.05
Nodes (39): applyTheme(), getTheme(), toggleTheme(), Account, AdminAnalytics, AdminAuditLog, AdminCache, AdminCatalog (+31 more)

### Community 2 - "devDependencies"
Cohesion: 0.06
Nodes (30): dependencies, axios, lucide-react, @phosphor-icons/react, react, react-dom, react-router-dom, recharts (+22 more)

### Community 3 - "Sellers.jsx"
Cohesion: 0.12
Nodes (11): listSubscribers(), newsletterAnalytics(), triggerNewsletter(), getSellers(), LoadingSpinner(), SkeletonRow(), avatarColors, bucket() (+3 more)

### Community 4 - "SaathiDashboard.jsx"
Cohesion: 0.10
Nodes (20): searchProducts(), saathiAttachProduct(), saathiConnectMessenger(), saathiDetachProduct(), saathiDisconnectMessenger(), saathiListProducts(), saathiLiveAssist(), saathiRecentQueries() (+12 more)

### Community 5 - "admin.js"
Cohesion: 0.12
Nodes (19): analyticsDailyUsers(), analyticsDevices(), analyticsFunnel(), analyticsHourly(), analyticsOverview(), analyticsReferrers(), analyticsRequests(), analyticsResultShops() (+11 more)

### Community 6 - "ScrollToTop.jsx"
Cohesion: 0.25
Nodes (5): getAllProducts(), getCategories(), getShopTrust(), ServiceUnavailable(), sortOptions

### Community 7 - "Home.jsx"
Cohesion: 0.07
Nodes (23): getHeadlineStats(), getHotDrops(), getShowcase(), subscribeNewsletter(), suggestProducts(), DropCard(), fmt(), NewsletterInline() (+15 more)

### Community 8 - "AdminShops.jsx"
Cohesion: 0.17
Nodes (9): bulkSetShopStatus(), diagCollections(), editShop(), listShops(), reindexShop(), reseedDirectories(), setShopStatus(), syncShopFeed() (+1 more)

### Community 9 - "api.js"
Cohesion: 0.17
Nodes (7): protectAssess(), protectConfirmOrder(), protectCreateOrder(), protectDisputeOrder(), protectGetOrder(), submitFeedback(), PAYMENTS

### Community 10 - "auth.js"
Cohesion: 0.12
Nodes (16): forgotPassword(), getAuthConfig(), getAuthToken(), getMe(), googleLogin(), passwordLogin(), resetPassword(), setAuthToken() (+8 more)

### Community 11 - "auth.js"
Cohesion: 0.13
Nodes (20): accountSearchHistory(), addSavedSearch(), listNotifications(), listSavedSearches(), listWishlist(), markNotificationsRead(), removeFromWishlist(), removeSavedSearch() (+12 more)

### Community 12 - "Navbar.jsx"
Cohesion: 0.14
Nodes (9): saathiMe(), saathiSignup(), verifyEmail(), useAuth(), CloseBand(), Saathi(), SaathiDashboard(), SaathiSignup() (+1 more)

### Community 14 - "guides.jsx"
Cohesion: 0.26
Nodes (5): GuideSEO(), getGuide(), GUIDES, otherGuides(), GuideDetail()

### Community 15 - "AdminIndexer.jsx"
Cohesion: 0.20
Nodes (5): getIndexerHistory(), indexStatus(), retryFailedShops(), triggerReindex(), AdminLayout()

### Community 16 - "ReviewsPanel.jsx"
Cohesion: 0.22
Nodes (8): getProductReviews(), markReviewHelpful(), postDeliveryReport(), postProductReview(), emptyForm, fmtDate(), ReviewCard(), ReviewsPanel()

### Community 17 - "AdminCatalog.jsx"
Cohesion: 0.20
Nodes (6): adminCreateProduct(), adminDeleteProduct(), adminEditProduct(), adminListCatalog(), adminMergeProducts(), EMPTY_DRAFT

### Community 18 - "RecentlyViewedRail.jsx"
Cohesion: 0.36
Nodes (4): getProductsByIds(), clearRecent(), getRecentIds(), pushRecent()

### Community 20 - "AdminOffers.jsx"
Cohesion: 0.33
Nodes (3): approveOffer(), listOffers(), rejectOffer()

### Community 21 - "AdminJobs.jsx"
Cohesion: 0.33
Nodes (3): jobRuns(), listJobs(), runJob()

### Community 22 - "AdminSearchLog.jsx"
Cohesion: 0.29
Nodes (3): recentSearches(), recentSuggestClicks(), searchLatency()

### Community 23 - "SubmitShop.jsx"
Cohesion: 0.33
Nodes (3): submitShop(), CATEGORIES, PLATFORMS

### Community 24 - "dam-kemon-frontend"
Cohesion: 0.09
Nodes (21): 1. Install, 2. Configure (optional), 3. Run, 4. Build, Backend contract, dam-kemon-frontend, Environment variables, Layout (+13 more)

### Community 26 - "AdminCache.jsx"
Cohesion: 0.40
Nodes (3): flushAllCaches(), flushCache(), listCaches()

### Community 28 - "Dashboard.jsx"
Cohesion: 0.18
Nodes (5): getDashboardStats(), getLiveStats(), getTrendingSearches(), Dashboard(), fmt()

### Community 29 - "Production Deploy Job (deploy-production)"
Cohesion: 0.67
Nodes (3): VITE_API_BASE Opaque API Prefix (cloaking), Production Deploy Job (deploy-production), Staging Deploy Job (deploy-staging)

### Community 39 - "Landing-page "standout" changes — Home.jsx"
Cohesion: 0.25
Nodes (7): 1. Surfaced the `ProtectShowcase` component on the homepage  ★ biggest win, 2. Bangla brand line in the hero — own the name, 3. Trust micro-proofs under the hero search, 4. (implicit) Reordered emphasis, How to revert, Landing-page "standout" changes — Home.jsx, Not done in code (needs your input — see the strategy report)

### Community 40 - "AssistantWidget.jsx"
Cohesion: 0.10
Nodes (18): assistantChat(), getShops(), AssistantWidget(), fmt(), sellerLabel(), slugOf(), SmartVerdict(), authenticityMeta() (+10 more)

### Community 42 - "AdminPendingShops.jsx"
Cohesion: 0.40
Nodes (3): approvePendingShop(), listPendingShops(), rejectPendingShop()

### Community 44 - "num"
Cohesion: 0.50
Nodes (4): AdminAnalytics(), FunnelStage(), num(), Row()

## Knowledge Gaps
- **123 isolated node(s):** `check-gstack.sh script`, `name`, `private`, `version`, `type` (+118 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAuth()` connect `Navbar.jsx` to `ProductDetail.jsx`, `App.jsx`, `SaathiDashboard.jsx`, `Home.jsx`, `auth.js`, `auth.js`, `AdminIndexer.jsx`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `api` connect `AdminStats.jsx` to `admin.js`, `api.js`, `auth.js`, `AdminStats.jsx`, `AdminIndexer.jsx`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `LoadingSpinner()` connect `Sellers.jsx` to `AssistantWidget.jsx`, `App.jsx`, `Dashboard.jsx`, `ProductDetail.jsx`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **What connects `check-gstack.sh script`, `name`, `private` to the rest of the system?**
  _126 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ProductDetail.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06553911205073996 - nodes in this community are weakly interconnected._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05272108843537415 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._