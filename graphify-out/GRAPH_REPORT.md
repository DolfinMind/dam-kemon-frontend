# Graph Report - frontend  (2026-07-26)

## Corpus Check
- 107 files · ~93,106 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 704 nodes · 1149 edges · 63 communities (45 shown, 18 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.78)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9cf72535`
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
- [[_COMMUNITY_FeedbackPulse.jsx|FeedbackPulse.jsx]]
- [[_COMMUNITY_auth.js|auth.js]]
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
- [[_COMMUNITY_categoryIcon.jsx|categoryIcon.jsx]]
- [[_COMMUNITY_check-gstack.sh|check-gstack.sh]]
- [[_COMMUNITY_SPA Root Shell + main.jsx Entry|SPA Root Shell + main.jsx Entry]]
- [[_COMMUNITY_CLAUDE|CLAUDE.md]]
- [[_COMMUNITY_Landing-page standout changes — Home.jsx|Landing-page "standout" changes — Home.jsx]]
- [[_COMMUNITY_SignIn.jsx|SignIn.jsx]]
- [[_COMMUNITY_Navbar.jsx|Navbar.jsx]]
- [[_COMMUNITY_RecentlyViewedRail.jsx|RecentlyViewedRail.jsx]]
- [[_COMMUNITY_PriceHistoryChart.jsx|PriceHistoryChart.jsx]]
- [[_COMMUNITY_PriceHistoryChart.jsx|PriceHistoryChart.jsx]]
- [[_COMMUNITY_AssistantWidget.jsx|AssistantWidget.jsx]]
- [[_COMMUNITY_Bangla Brand Line in Hero|Bangla Brand Line in Hero]]
- [[_COMMUNITY_Home.jsx (landing page target)|Home.jsx (landing page target)]]
- [[_COMMUNITY_ProtectShowcase Surfacing on Homepage|ProtectShowcase Surfacing on Homepage]]
- [[_COMMUNITY_Trust-first Emphasis Reorder|Trust-first Emphasis Reorder]]
- [[_COMMUNITY_Trust Micro-proofs Under Hero Search|Trust Micro-proofs Under Hero Search]]
- [[_COMMUNITY_axios Client (srcapiapi.js)|axios Client (src/api/api.js)]]
- [[_COMMUNITY_Dashboard Page (srcpagesDashboard.jsx)|Dashboard Page (src/pages/Dashboard.jsx)]]
- [[_COMMUNITY_SearchBar Autosuggest (srccomponentsSearchBar.jsx)|SearchBar Autosuggest (src/components/SearchBar.jsx)]]
- [[_COMMUNITY_SearchResults Page (srcpagesSearchResults.jsx)|SearchResults Page (src/pages/SearchResults.jsx)]]
- [[_COMMUNITY_Trending.jsx|Trending.jsx]]
- [[_COMMUNITY_main.jsx|main.jsx]]
- [[_COMMUNITY_AdminNewsletter.jsx|AdminNewsletter.jsx]]
- [[_COMMUNITY_Saathi.jsx|Saathi.jsx]]
- [[_COMMUNITY_SaathiProfile.jsx|SaathiProfile.jsx]]
- [[_COMMUNITY_compilerOptions|compilerOptions]]
- [[_COMMUNITY_SignIn.jsx|SignIn.jsx]]
- [[_COMMUNITY_BottomNav.jsx|BottomNav.jsx]]

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 29 edges
2. `compilerOptions` - 12 edges
3. `dam-kemon-frontend` - 11 edges
4. `LoadingSpinner()` - 8 edges
5. `SmartVerdict()` - 8 edges
6. `CategoryIcon` - 8 edges
7. `cleanName()` - 8 edges
8. `formatNumber()` - 8 edges
9. `fireBeacon()` - 7 edges
10. `api` - 7 edges

## Surprising Connections (you probably didn't know these)
- `AdminLayout()` --calls--> `useAuth()`  [EXTRACTED]
  src/pages/admin/AdminLayout.jsx → src/auth/AuthContext.jsx
- `CloseBand()` --calls--> `useAuth()`  [EXTRACTED]
  src/pages/Home.jsx → src/auth/AuthContext.jsx
- `SaathiDashboard()` --calls--> `useAuth()`  [EXTRACTED]
  src/pages/SaathiDashboard.jsx → src/auth/AuthContext.jsx
- `VerifyEmail()` --calls--> `useAuth()`  [EXTRACTED]
  src/pages/VerifyEmail.jsx → src/auth/AuthContext.jsx
- `fromDrop()` --calls--> `cleanName()`  [EXTRACTED]
  src/pages/Home.jsx → src/lib/display.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Trust-first Landing Redesign of Home.jsx** — landing_standout_changes_protectshowcase, landing_standout_changes_trust_microproofs, landing_standout_changes_bangla_brand_line, landing_standout_changes_trust_first_reorder, landing_standout_changes_home_jsx [INFERRED 0.85]
- **Frontend CI/CD Deploy Pipeline (prod + staging)** — github_workflows_production_deploy_deploy_production, github_workflows_staging_deploy_deploy_staging, github_workflows_production_deploy_api_cloaking [INFERRED 0.80]

## Communities (63 total, 18 thin omitted)

### Community 0 - "ProductDetail.jsx"
Cohesion: 0.07
Nodes (24): affiliateUrl(), assistantChat(), getShops(), AssistantWidget(), offerKey(), PriceComparisonTable(), sameOffer(), sellerBadges (+16 more)

### Community 1 - "App.jsx"
Cohesion: 0.05
Nodes (35): Account, AdminAnalytics, AdminAuditLog, AdminCache, AdminCatalog, AdminCrawler, AdminFeedback, AdminIndexer (+27 more)

### Community 2 - "devDependencies"
Cohesion: 0.05
Nodes (37): dependencies, axios, cobe, framer-motion, lucide-react, @phosphor-icons/react, react, react-dom (+29 more)

### Community 3 - "Sellers.jsx"
Cohesion: 0.15
Nodes (8): getFeedback(), getSellers(), LoadingSpinner(), avatarColors, bucket(), CATEGORY_FILTERS, TYPE_FILTERS, TypeBadge()

### Community 4 - "SaathiDashboard.jsx"
Cohesion: 0.09
Nodes (21): searchProducts(), saathiAttachProduct(), saathiConnectMessenger(), saathiDetachProduct(), saathiDisconnectMessenger(), saathiListProducts(), saathiLiveAssist(), saathiRecentQueries() (+13 more)

### Community 5 - "admin.js"
Cohesion: 0.10
Nodes (19): analyticsCatalogGrowth(), analyticsDailyUsers(), analyticsDevices(), analyticsFunnel(), analyticsHourly(), analyticsOverview(), analyticsReferrers(), analyticsTopProducts() (+11 more)

### Community 6 - "ScrollToTop.jsx"
Cohesion: 0.15
Nodes (14): fireBeacon(), getAnonId(), metaPixelPageView(), trackAction(), trackClick(), trackPageView(), trackSuggestClick(), trackView() (+6 more)

### Community 7 - "Home.jsx"
Cohesion: 0.18
Nodes (11): getAllProducts(), getCategories(), getShopTrust(), fmt(), SearchProductCard(), SearchProductCardSkeleton(), ServiceUnavailable(), sortOptions (+3 more)

### Community 8 - "AdminShops.jsx"
Cohesion: 0.13
Nodes (9): bulkSetShopStatus(), diagCollections(), editShop(), listShops(), reindexShop(), reseedDirectories(), setShopStatus(), syncShopFeed() (+1 more)

### Community 9 - "api.js"
Cohesion: 0.16
Nodes (7): protectAssess(), protectConfirmOrder(), protectCreateOrder(), protectDisputeOrder(), protectGetOrder(), submitFeedback(), PAYMENTS

### Community 10 - "auth.js"
Cohesion: 0.14
Nodes (18): accountSearchHistory(), getMyReviews(), addSavedSearch(), listSavedSearches(), listWishlist(), removeFromWishlist(), removeSavedSearch(), resendVerification() (+10 more)

### Community 11 - "FeedbackPulse.jsx"
Cohesion: 0.15
Nodes (20): adminUser(), adminUserConversion(), adminUsers(), activityIcon(), ActivityItem(), CountCard(), displayName(), formatDate() (+12 more)

### Community 12 - "auth.js"
Cohesion: 0.13
Nodes (11): forgotPassword(), getAuthToken(), getMe(), resetPassword(), saathiPublicProfile(), setAuthToken(), signOut(), verifyEmail() (+3 more)

### Community 13 - "AdminStats.jsx"
Cohesion: 0.13
Nodes (10): getMostSellers(), subscribeNewsletter(), WovenLightHero(), WovenLightHeroProps, CloseBand(), fromDrop(), HERO_TITLE_WORDS, Home() (+2 more)

### Community 14 - "guides.jsx"
Cohesion: 0.26
Nodes (5): GuideSEO(), getGuide(), GUIDES, otherGuides(), GuideDetail()

### Community 15 - "AdminIndexer.jsx"
Cohesion: 0.25
Nodes (5): getHeadlineStats(), getHotDrops(), DropCard(), fmt(), NewsletterInline()

### Community 16 - "ReviewsPanel.jsx"
Cohesion: 0.20
Nodes (9): getProductReviews(), getReviewVotes(), postDeliveryReport(), postProductReview(), voteReview(), emptyForm, fmtDate(), ReviewCard() (+1 more)

### Community 17 - "AdminCatalog.jsx"
Cohesion: 0.18
Nodes (6): adminCreateProduct(), adminDeleteProduct(), adminEditProduct(), adminListCatalog(), adminMergeProducts(), EMPTY_DRAFT

### Community 18 - "RecentlyViewedRail.jsx"
Cohesion: 0.16
Nodes (14): getDailyPriceHistory(), getProductHistory(), getSellerTrust(), submitOffer(), addToWishlist(), AddOffer(), FeedbackPulse(), ProductSEO() (+6 more)

### Community 20 - "AdminOffers.jsx"
Cohesion: 0.10
Nodes (9): approveOffer(), approvePendingShop(), flushAllCaches(), flushCache(), listCaches(), listOffers(), listPendingShops(), rejectOffer() (+1 more)

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
Cohesion: 0.07
Nodes (12): adminSellerDepth(), crawlerAction(), crawlerLogs(), crawlerStatus(), getIndexerHistory(), indexStatus(), api, AdminCrawler() (+4 more)

### Community 28 - "Dashboard.jsx"
Cohesion: 0.18
Nodes (5): getDashboardStats(), getLiveStats(), getTrendingSearches(), Dashboard(), fmt()

### Community 29 - "Production Deploy Job (deploy-production)"
Cohesion: 0.67
Nodes (3): VITE_API_BASE Opaque API Prefix (cloaking), Production Deploy Job (deploy-production), Staging Deploy Job (deploy-staging)

### Community 30 - "categoryIcon.jsx"
Cohesion: 0.25
Nodes (8): formatPrice(), HomeProductCard(), HomeProductCardSkeleton(), formatPrice(), gradientByCategory, ProductCard(), CategoryIcon, RULES

### Community 39 - "Landing-page "standout" changes — Home.jsx"
Cohesion: 0.25
Nodes (7): 1. Surfaced the `ProtectShowcase` component on the homepage  ★ biggest win, 2. Bangla brand line in the hero — own the name, 3. Trust micro-proofs under the hero search, 4. (implicit) Reordered emphasis, How to revert, Landing-page "standout" changes — Home.jsx, Not done in code (needs your input — see the strategy report)

### Community 40 - "SignIn.jsx"
Cohesion: 0.25
Nodes (6): listNotifications(), markNotificationsRead(), NotificationsTab(), AdminLayout(), bottomNavigation, navigation

### Community 41 - "Navbar.jsx"
Cohesion: 0.43
Nodes (3): AlphaBadge(), Footer(), Navbar()

### Community 42 - "RecentlyViewedRail.jsx"
Cohesion: 0.36
Nodes (4): getProductsByIds(), clearRecent(), getRecentIds(), pushRecent()

### Community 43 - "PriceHistoryChart.jsx"
Cohesion: 0.13
Nodes (14): aliases, components, lib, ui, rsc, $schema, style, tailwind (+6 more)

### Community 44 - "PriceHistoryChart.jsx"
Cohesion: 0.39
Nodes (6): dateKey(), displayDate(), formatPrice(), PriceHistoryChart(), PriceTooltip(), ranges

### Community 45 - "AssistantWidget.jsx"
Cohesion: 0.40
Nodes (3): defaultMarkers, GlobeAnalyticsProps, PriceDropMarker

### Community 56 - "main.jsx"
Cohesion: 0.53
Nodes (4): applyTheme(), getTheme(), toggleTheme(), App()

### Community 57 - "AdminNewsletter.jsx"
Cohesion: 0.33
Nodes (3): listSubscribers(), newsletterAnalytics(), triggerNewsletter()

### Community 58 - "Saathi.jsx"
Cohesion: 0.17
Nodes (7): saathiMe(), saathiSignup(), useAuth(), Account(), Saathi(), SaathiSignup(), SignIn()

### Community 61 - "compilerOptions"
Cohesion: 0.13
Nodes (14): compilerOptions, baseUrl, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+6 more)

### Community 62 - "SignIn.jsx"
Cohesion: 0.17
Nodes (13): getProduct(), getAuthConfig(), googleLogin(), passwordLogin(), signup(), safeNextPath(), AuthLayout(), Field() (+5 more)

## Knowledge Gaps
- **168 isolated node(s):** `check-gstack.sh script`, `$schema`, `style`, `rsc`, `tsx` (+163 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAuth()` connect `Saathi.jsx` to `SaathiDashboard.jsx`, `ScrollToTop.jsx`, `SignIn.jsx`, `Navbar.jsx`, `auth.js`, `auth.js`, `AdminStats.jsx`, `ReviewsPanel.jsx`, `RecentlyViewedRail.jsx`, `SignIn.jsx`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `LoadingSpinner()` connect `Sellers.jsx` to `ProductDetail.jsx`, `App.jsx`, `RecentlyViewedRail.jsx`, `AdminNewsletter.jsx`, `Dashboard.jsx`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `api` connect `AdminCache.jsx` to `api.js`, `AdminOffers.jsx`, `auth.js`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `check-gstack.sh script`, `$schema`, `style` to the rest of the system?**
  _171 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ProductDetail.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07171717171717172 - nodes in this community are weakly interconnected._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05405405405405406 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05263157894736842 - nodes in this community are weakly interconnected._