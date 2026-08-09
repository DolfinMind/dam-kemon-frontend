# Graph Report - dam-kemon-frontend  (2026-08-09)

## Corpus Check
- 114 files · ~131,310 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 718 nodes · 1166 edges · 61 communities (40 shown, 21 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.78)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `34ff7b5e`
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
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 43|Community 43]]
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
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 64|Community 64]]

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
- `Account()` --calls--> `useAuth()`  [EXTRACTED]
  src/pages/Account.jsx → src/auth/AuthContext.jsx
- `AdminLayout()` --calls--> `useAuth()`  [EXTRACTED]
  src/pages/admin/AdminLayout.jsx → src/auth/AuthContext.jsx
- `CloseBand()` --calls--> `useAuth()`  [EXTRACTED]
  src/pages/Home.jsx → src/auth/AuthContext.jsx
- `Saathi()` --calls--> `useAuth()`  [EXTRACTED]
  src/pages/Saathi.jsx → src/auth/AuthContext.jsx
- `SaathiDashboard()` --calls--> `useAuth()`  [EXTRACTED]
  src/pages/SaathiDashboard.jsx → src/auth/AuthContext.jsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Trust-first Landing Redesign of Home.jsx** — landing_standout_changes_protectshowcase, landing_standout_changes_trust_microproofs, landing_standout_changes_bangla_brand_line, landing_standout_changes_trust_first_reorder, landing_standout_changes_home_jsx [INFERRED 0.85]
- **Frontend CI/CD Deploy Pipeline (prod + staging)** — github_workflows_production_deploy_deploy_production, github_workflows_staging_deploy_deploy_staging, github_workflows_production_deploy_api_cloaking [INFERRED 0.80]

## Communities (61 total, 21 thin omitted)

### Community 0 - "Components: trustbadge"
Cohesion: 0.09
Nodes (22): affiliateUrl(), getShops(), offerKey(), PriceComparisonTable(), sameOffer(), sellerBadges, slugOf(), fmt() (+14 more)

### Community 1 - "App: assistantwidget"
Cohesion: 0.05
Nodes (35): Account, AdminAnalytics, AdminAuditLog, AdminCache, AdminCatalog, AdminCrawler, AdminFeedback, AdminIndexer (+27 more)

### Community 2 - "Root #1"
Cohesion: 0.05
Nodes (37): dependencies, axios, cobe, framer-motion, lucide-react, @phosphor-icons/react, react, react-dom (+29 more)

### Community 3 - "Components: searchresults"
Cohesion: 0.15
Nodes (8): getFeedback(), getSellers(), LoadingSpinner(), avatarColors, bucket(), CATEGORY_FILTERS, TYPE_FILTERS, TypeBadge()

### Community 4 - "Pages: saathidashboard"
Cohesion: 0.10
Nodes (20): searchProducts(), saathiAttachProduct(), saathiConnectMessenger(), saathiDetachProduct(), saathiDisconnectMessenger(), saathiListProducts(), saathiLiveAssist(), saathiRecentQueries() (+12 more)

### Community 5 - "API Layer: admin #1"
Cohesion: 0.10
Nodes (19): analyticsCatalogGrowth(), analyticsDailyUsers(), analyticsDevices(), analyticsFunnel(), analyticsHourly(), analyticsOverview(), analyticsReferrers(), analyticsTopProducts() (+11 more)

### Community 6 - "Pages: sellers"
Cohesion: 0.15
Nodes (14): fireBeacon(), getAnonId(), metaPixelPageView(), trackAction(), trackClick(), trackPageView(), trackSuggestClick(), trackView() (+6 more)

### Community 7 - "Pages: home"
Cohesion: 0.06
Nodes (37): getAllProducts(), getCategories(), getHeadlineStats(), getHotDrops(), getMostSellers(), getShopTrust(), subscribeNewsletter(), formatPrice() (+29 more)

### Community 8 - "API Layer: admin #2"
Cohesion: 0.13
Nodes (9): bulkSetShopStatus(), diagCollections(), editShop(), listShops(), reindexShop(), reseedDirectories(), setShopStatus(), syncShopFeed() (+1 more)

### Community 9 - "API Layer: protect"
Cohesion: 0.13
Nodes (8): getDailyPriceHistory(), getProductHistory(), getProductReviews(), getReviewVotes(), getSellerTrust(), postDeliveryReport(), postProductReview(), submitFeedback()

### Community 10 - "API Layer: saathiprofile"
Cohesion: 0.12
Nodes (22): accountSearchHistory(), getMyReviews(), addSavedSearch(), listNotifications(), listSavedSearches(), listWishlist(), markNotificationsRead(), removeFromWishlist() (+14 more)

### Community 11 - "API Layer: account"
Cohesion: 0.15
Nodes (20): adminUser(), adminUserConversion(), adminUsers(), activityIcon(), ActivityItem(), CountCard(), displayName(), formatDate() (+12 more)

### Community 12 - "Pages: saathi"
Cohesion: 0.12
Nodes (13): addToWishlist(), forgotPassword(), getAuthToken(), getMe(), resetPassword(), saathiPublicProfile(), saathiStats(), setAuthToken() (+5 more)

### Community 13 - "Pages: admin #1"
Cohesion: 0.19
Nodes (7): AdminPayments(), compactId(), ConfirmAction(), dateTime(), money(), number(), RESOURCES

### Community 14 - "Content: guideseo"
Cohesion: 0.26
Nodes (5): GuideSEO(), getGuide(), GUIDES, otherGuides(), GuideDetail()

### Community 16 - "Components: reviewspanel"
Cohesion: 0.25
Nodes (6): protectAssess(), protectConfirmOrder(), protectCreateOrder(), protectDisputeOrder(), protectGetOrder(), PAYMENTS

### Community 17 - "API Layer: admin #3"
Cohesion: 0.18
Nodes (6): adminCreateProduct(), adminDeleteProduct(), adminEditProduct(), adminListCatalog(), adminMergeProducts(), EMPTY_DRAFT

### Community 18 - "API Layer: recentlyviewedrail"
Cohesion: 0.08
Nodes (23): getProductsByIds(), submitOffer(), voteReview(), clearRecent(), getRecentIds(), pushRecent(), useAuth(), AddOffer() (+15 more)

### Community 20 - "API Layer: admin #4"
Cohesion: 0.10
Nodes (9): approveOffer(), approvePendingShop(), flushAllCaches(), flushCache(), listCaches(), listOffers(), listPendingShops(), rejectOffer() (+1 more)

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
Cohesion: 0.10
Nodes (12): crawlerAction(), crawlerLogs(), crawlerStatus(), getIndexerHistory(), indexStatus(), AdminCrawler(), formatDate(), formatMemory() (+4 more)

### Community 28 - "Components: searchbar"
Cohesion: 0.18
Nodes (5): getDashboardStats(), getLiveStats(), getTrendingSearches(), Dashboard(), fmt()

### Community 29 - "Deploy"
Cohesion: 0.67
Nodes (3): VITE_API_BASE Opaque API Prefix (cloaking), Production Deploy Job (deploy-production), Staging Deploy Job (deploy-staging)

### Community 39 - "Community 39"
Cohesion: 0.25
Nodes (7): 1. Surfaced the `ProtectShowcase` component on the homepage  ★ biggest win, 2. Bangla brand line in the hero — own the name, 3. Trust micro-proofs under the hero search, 4. (implicit) Reordered emphasis, How to revert, Landing-page "standout" changes — Home.jsx, Not done in code (needs your input — see the strategy report)

### Community 41 - "Community 41"
Cohesion: 0.43
Nodes (3): AlphaBadge(), Footer(), Navbar()

### Community 43 - "Community 43"
Cohesion: 0.13
Nodes (14): aliases, components, lib, ui, rsc, $schema, style, tailwind (+6 more)

### Community 45 - "Community 45"
Cohesion: 0.40
Nodes (3): defaultMarkers, GlobeAnalyticsProps, PriceDropMarker

### Community 56 - "Community 56"
Cohesion: 0.53
Nodes (4): applyTheme(), getTheme(), toggleTheme(), App()

### Community 57 - "Community 57"
Cohesion: 0.33
Nodes (3): listSubscribers(), newsletterAnalytics(), triggerNewsletter()

### Community 58 - "Community 58"
Cohesion: 0.18
Nodes (4): saathiMe(), saathiSignup(), Saathi(), SaathiSignup()

### Community 61 - "Community 61"
Cohesion: 0.13
Nodes (14): compilerOptions, baseUrl, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+6 more)

### Community 62 - "Community 62"
Cohesion: 0.17
Nodes (14): getProduct(), getAuthConfig(), googleLogin(), passwordLogin(), signup(), safeNextPath(), AuthLayout(), Field() (+6 more)

## Knowledge Gaps
- **169 isolated node(s):** `RESOURCES`, `check-gstack.sh script`, `$schema`, `style`, `rsc` (+164 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAuth()` connect `API Layer: recentlyviewedrail` to `Community 58`, `Pages: saathidashboard`, `Pages: sellers`, `Pages: home`, `Community 41`, `API Layer: saathiprofile`, `Pages: saathi`, `API Layer: admin #6`, `Community 62`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `LoadingSpinner()` connect `Components: searchresults` to `Components: trustbadge`, `App: assistantwidget`, `API Layer: recentlyviewedrail`, `Community 57`, `Components: searchbar`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `api` connect `Pages: admin #2` to `API Layer: protect`, `Pages: saathi`, `API Layer: admin #4`, `API Layer: admin #6`, `Components: trendingstrip`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `RESOURCES`, `check-gstack.sh script`, `$schema` to the rest of the system?**
  _172 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Components: trustbadge` be split into smaller, more focused modules?**
  _Cohesion score 0.08636977058029689 - nodes in this community are weakly interconnected._
- **Should `App: assistantwidget` be split into smaller, more focused modules?**
  _Cohesion score 0.05405405405405406 - nodes in this community are weakly interconnected._
- **Should `Root #1` be split into smaller, more focused modules?**
  _Cohesion score 0.05263157894736842 - nodes in this community are weakly interconnected._