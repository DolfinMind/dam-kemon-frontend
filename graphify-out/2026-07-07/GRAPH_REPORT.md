# Graph Report - dam-kemon-frontend  (2026-07-05)

## Corpus Check
- 83 files · ~61,161 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 536 nodes · 867 edges · 55 communities (35 shown, 20 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.78)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `eeb3d4aa`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

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
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 17 edges
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
- `Staging Deploy Job (deploy-staging)` --semantically_similar_to--> `Production Deploy Job (deploy-production)`  [INFERRED] [semantically similar]
  .github/workflows/staging-deploy.yml → .github/workflows/production-deploy.yml
- `Account()` --calls--> `useAuth()`  [EXTRACTED]
  src/pages/Account.jsx → src/auth/AuthContext.jsx
- `AdminLayout()` --calls--> `useAuth()`  [EXTRACTED]
  src/pages/admin/AdminLayout.jsx → src/auth/AuthContext.jsx
- `ProductDetail()` --calls--> `useAuth()`  [EXTRACTED]
  src/pages/ProductDetail.jsx → src/auth/AuthContext.jsx
- `Saathi()` --calls--> `useAuth()`  [EXTRACTED]
  src/pages/Saathi.jsx → src/auth/AuthContext.jsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Trust-first Landing Redesign of Home.jsx** — landing_standout_changes_protectshowcase, landing_standout_changes_trust_microproofs, landing_standout_changes_bangla_brand_line, landing_standout_changes_trust_first_reorder, landing_standout_changes_home_jsx [INFERRED 0.85]
- **Frontend CI/CD Deploy Pipeline (prod + staging)** — github_workflows_production_deploy_deploy_production, github_workflows_staging_deploy_deploy_staging, github_workflows_production_deploy_api_cloaking [INFERRED 0.80]

## Communities (55 total, 20 thin omitted)

### Community 0 - "Components: trustbadge"
Cohesion: 0.08
Nodes (31): affiliateUrl(), getDailyPriceHistory(), getProduct(), getProductHistory(), getSellerTrust(), offerKey(), PriceComparisonTable(), sellerBadges (+23 more)

### Community 1 - "App: assistantwidget"
Cohesion: 0.07
Nodes (25): Account, AdminAnalytics, AdminAuditLog, AdminCache, AdminCatalog, AdminIndexer, AdminJobs, AdminLayout (+17 more)

### Community 2 - "Root #1"
Cohesion: 0.06
Nodes (30): dependencies, axios, lucide-react, @phosphor-icons/react, react, react-dom, react-router-dom, recharts (+22 more)

### Community 3 - "Components: searchresults"
Cohesion: 0.07
Nodes (21): getAllProducts(), getCategories(), getSellers(), getShops(), getShopTrust(), LoadingSpinner(), SkeletonRow(), SearchProductCard() (+13 more)

### Community 4 - "Pages: saathidashboard"
Cohesion: 0.10
Nodes (20): searchProducts(), saathiAttachProduct(), saathiConnectMessenger(), saathiDetachProduct(), saathiDisconnectMessenger(), saathiListProducts(), saathiLiveAssist(), saathiRecentQueries() (+12 more)

### Community 5 - "API Layer: admin #1"
Cohesion: 0.12
Nodes (19): analyticsDailyUsers(), analyticsDevices(), analyticsFunnel(), analyticsHourly(), analyticsOverview(), analyticsReferrers(), analyticsRequests(), analyticsResultShops() (+11 more)

### Community 6 - "Pages: sellers"
Cohesion: 0.33
Nodes (3): listSubscribers(), newsletterAnalytics(), triggerNewsletter()

### Community 7 - "Pages: home"
Cohesion: 0.06
Nodes (22): getHotDrops(), submitFeedback(), subscribeNewsletter(), suggestProducts(), AlphaBadge(), FeedbackSection(), Footer(), NewsletterSection() (+14 more)

### Community 8 - "API Layer: admin #2"
Cohesion: 0.17
Nodes (9): bulkSetShopStatus(), diagCollections(), editShop(), listShops(), reindexShop(), reseedDirectories(), setShopStatus(), syncShopFeed() (+1 more)

### Community 9 - "API Layer: protect"
Cohesion: 0.16
Nodes (8): protectAssess(), protectConfirmOrder(), protectCreateOrder(), protectDisputeOrder(), protectGetOrder(), submitOffer(), AddOffer(), PAYMENTS

### Community 10 - "API Layer: saathiprofile"
Cohesion: 0.20
Nodes (9): addToWishlist(), getAuthToken(), getMe(), saathiMe(), saathiSignup(), setAuthToken(), signOut(), AuthContext (+1 more)

### Community 11 - "API Layer: account"
Cohesion: 0.20
Nodes (13): accountSearchHistory(), addSavedSearch(), listNotifications(), listSavedSearches(), listWishlist(), markNotificationsRead(), removeFromWishlist(), removeSavedSearch() (+5 more)

### Community 12 - "Pages: saathi"
Cohesion: 0.14
Nodes (9): passwordLogin(), useAuth(), Navbar(), Account(), AdminLayout(), Saathi(), SaathiDashboard(), SaathiSignup() (+1 more)

### Community 14 - "Content: guideseo"
Cohesion: 0.26
Nodes (5): GuideSEO(), getGuide(), GUIDES, otherGuides(), GuideDetail()

### Community 15 - "Pages: admin #2"
Cohesion: 0.25
Nodes (4): getIndexerHistory(), indexStatus(), retryFailedShops(), triggerReindex()

### Community 16 - "Components: reviewspanel"
Cohesion: 0.22
Nodes (8): getProductReviews(), markReviewHelpful(), postDeliveryReport(), postProductReview(), emptyForm, fmtDate(), ReviewCard(), ReviewsPanel()

### Community 17 - "API Layer: admin #3"
Cohesion: 0.20
Nodes (6): adminCreateProduct(), adminDeleteProduct(), adminEditProduct(), adminListCatalog(), adminMergeProducts(), EMPTY_DRAFT

### Community 18 - "API Layer: recentlyviewedrail"
Cohesion: 0.36
Nodes (4): getProductsByIds(), clearRecent(), getRecentIds(), pushRecent()

### Community 20 - "API Layer: admin #4"
Cohesion: 0.33
Nodes (3): approveOffer(), listOffers(), rejectOffer()

### Community 21 - "API Layer: admin #5"
Cohesion: 0.33
Nodes (3): jobRuns(), listJobs(), runJob()

### Community 22 - "Pages: admin #3"
Cohesion: 0.29
Nodes (3): recentSearches(), recentSuggestClicks(), searchLatency()

### Community 23 - "Pages: submitshop"
Cohesion: 0.33
Nodes (3): submitShop(), CATEGORIES, PLATFORMS

### Community 24 - "Docs #2"
Cohesion: 0.09
Nodes (21): 1. Install, 2. Configure (optional), 3. Run, 4. Build, Backend contract, dam-kemon-frontend, Environment variables, Layout (+13 more)

### Community 26 - "API Layer: admin #6"
Cohesion: 0.40
Nodes (3): flushAllCaches(), flushCache(), listCaches()

### Community 28 - "Components: searchbar"
Cohesion: 0.18
Nodes (5): getDashboardStats(), getLiveStats(), getTrendingSearches(), Dashboard(), fmt()

### Community 29 - "Deploy"
Cohesion: 0.67
Nodes (3): VITE_API_BASE Opaque API Prefix (cloaking), Production Deploy Job (deploy-production), Staging Deploy Job (deploy-staging)

### Community 30 - "Components: trendingstrip"
Cohesion: 0.31
Nodes (8): fireBeacon(), getAnonId(), trackClick(), trackPageView(), trackSuggestClick(), trackView(), origin, PageTracker()

### Community 39 - "Community 39"
Cohesion: 0.25
Nodes (7): 1. Surfaced the `ProtectShowcase` component on the homepage  ★ biggest win, 2. Bangla brand line in the hero — own the name, 3. Trust micro-proofs under the hero search, 4. (implicit) Reordered emphasis, How to revert, Landing-page "standout" changes — Home.jsx, Not done in code (needs your input — see the strategy report)

### Community 41 - "Community 41"
Cohesion: 0.53
Nodes (4): applyTheme(), getTheme(), toggleTheme(), App()

### Community 42 - "Community 42"
Cohesion: 0.40
Nodes (3): approvePendingShop(), listPendingShops(), rejectPendingShop()

### Community 44 - "Community 44"
Cohesion: 0.50
Nodes (4): AdminAnalytics(), FunnelStage(), num(), Row()

## Knowledge Gaps
- **120 isolated node(s):** `check-gstack.sh script`, `name`, `private`, `version`, `type` (+115 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAuth()` connect `Pages: saathi` to `Components: trustbadge`, `Pages: saathidashboard`, `Pages: home`, `API Layer: saathiprofile`, `API Layer: account`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `api` connect `Components: newslettersection` to `API Layer: admin #1`, `API Layer: protect`, `API Layer: saathiprofile`, `Pages: admin #1`, `Pages: admin #2`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `LoadingSpinner()` connect `Components: searchresults` to `Components: trustbadge`, `App: assistantwidget`, `Components: searchbar`, `Pages: sellers`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **What connects `check-gstack.sh script`, `name`, `private` to the rest of the system?**
  _123 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Components: trustbadge` be split into smaller, more focused modules?**
  _Cohesion score 0.08181818181818182 - nodes in this community are weakly interconnected._
- **Should `App: assistantwidget` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `Root #1` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._