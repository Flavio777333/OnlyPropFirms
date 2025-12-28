# ADR-006: MVP Scope Definition & Architectural Runway Decision

**Date:** 2025-12-28  
**Status:** PROPOSED (awaiting stakeholder review & vote)  
**Owner:** @architecture-team  
**Impact Level:** CRITICAL (affects all Q1-Q3 2026 planning)  
**Decision Deadline:** 2025-12-31

---

## EXECUTIVE SUMMARY

**The Problem:**
OnlyPropFirms currently exists in a paradoxical state:
- **Architecture Documentation:** 2000+ lines describing a production-ready, enterprise-grade, multi-region Kubernetes system with distributed tracing, microservices, and advanced observability
- **Actual Codebase:** Minimal Next.js frontend boilerplate; **zero backend implementation** despite detailed backend architecture
- **Roadmap:** Generic feature checklists with no explicit MVP boundary, no architectural sequencing, no blocker matrix

**The Risk:**
Without explicit MVP scope definition, the team will face constant architectural friction:
- Frontend developers will build against undefined APIs (mock vs. real?)
- Backend architects will over-engineer for production before validating core assumptions
- Infrastructure engineers may invest in Kubernetes/RDS before a single transaction is tested
- Stakeholders hold implicit, conflicting mental models: "production-ready system" vs. "validated MVP"

**The Decision:**
Adopt a **Three-Phase Architectural Runway** approach:
1. **Phase 0 (MVP 0.1-0.3):** Validate core business logic with minimal infrastructure
2. **Phase 1 (MVP 0.4-0.9):** Production-readiness foundations (based on Phase 0 learnings)
3. **Phase 2 (v1.0+):** Enterprise scaling (Kubernetes, multi-region, distributed tracing)

This ADR explicitly designates which architectural components from the detailed ARCHITECTURE.md are **required now** vs. **hypothetical** vs. **deferred**.

---

## CONTEXT

### Current State Analysis

**What Exists:**
```
Frontend/
├── Next.js boilerplate (create-next-app)
├── Basic pages structure
└── No state management, API layer, or components yet

Backend/
├── (directory does not exist)
└── ❌ Zero implementation

Database/
├── migrations/ (empty)
├── seeds/ (empty)
└── ❌ Schema not initialized

Infrastructure/
├── docker/ (Dockerfiles templated)
├── kubernetes/ (YAML templates)
├── terraform/ (TF templates)
└── ❌ No actual AWS account or cluster

Tests/
└── ❌ Zero test coverage

Git History:
├── Commit 1: "Project structure"
├── Commit 2: "Frontend initialization"
└── No merges, no branches, no CI/CD configured
```

**What is Documented:**
- ARCHITECTURE.md: 1900 lines covering 10 major sections
- ROADMAP.md: Features listed without MVP boundaries
- 5 ADRs (001-005): Technology choices, but no scope gates

**Critical Gap:**
The ARCHITECTURE.md describes a system as if it's already production-ready:
- "Kubernetes Deployment-Strategie" with 3 replicas, health checks, rolling updates
- "Multi-Region Deployment (Planned Q1 2026)" with DNS failover and RPO/RTO targets
- "EKS Cluster (2 regions)" as a 2025-09-01 completed task (retroactively dated)
- Service mesh (Istio), distributed tracing (Jaeger), and Prometheus/Grafana stacks

Meanwhile, the actual codebase has not yet:
- ✗ Defined a single API endpoint
- ✗ Written a database query
- ✗ Authenticated a single user
- ✗ Tracked a single affiliate click
- ✗ Tested a comparison calculation

**Root Cause:**
ARCHITECTURE.md was written as a **design specification for the ideal final state**, not as a **phased implementation roadmap**. This is a common pattern in enterprise architecture, but it creates scope ambiguity: Does "Sprint 1" mean "build to ARCHITECTURE.md specification" or "validate core assumptions with minimal viable infrastructure"?

---

## DECISION: Three-Phase Architectural Runway

### Philosophy

**Principle 1: Validate Before Scaling**
Do not invest in Kubernetes, distributed tracing, or multi-region infrastructure until:
- Core business logic is proven correct
- User traffic patterns are understood
- Cost/performance tradeoffs are quantified

**Principle 2: Architectural Continuity**
Decisions made in Phase 0 must not create debt in Phase 1/2. Use:
- API contracts (OpenAPI/gRPC definitions) to decouple frontend and backend teams
- Docker containerization from day 1 (but not orchestrated until Phase 1)
- Structured logging (JSON) from day 1 (but not centralized until Phase 2)
- Environment-based configuration (but not secrets manager until Phase 1)

**Principle 3: Explicit Hypothesis Tracking**
Mark every architectural assumption from ARCHITECTURE.md as either:
- **Required (Phase 0):** Non-negotiable for MVP
- **Assumed (Phase 0):** Hypothesis; validate before Phase 1
- **Deferred (Phase 1+):** Explicitly out of scope until Go/No-Go decision

### Phase 0: MVP 0.1-0.3 (Q4 2025 – Q1 2026)

**Goal:** Validate that core business logic works with minimal infrastructure.

**Scope: What Must Exist**

| Component | Requirement | Why | Status |
|-----------|-------------|-----|--------|
| **Frontend: Pages** | Homepage, `/prop-firms` listing, `/prop-firm-comparison` | Core user journey | ❌ Started |
| **Frontend: Components** | FirmCard, ComparisonTable, FilterSidebar | MVP UI | ❌ Not started |
| **Frontend: State** | Redux store with propFirmSlice + filterSlice (NOT calculator, calendar, content yet) | Filter interaction | ❌ Not started |
| **Backend: API Skeleton** | 3 endpoints: `GET /api/v1/prop-firms`, `POST /api/v1/filter-firms`, `GET /api/v1/prop-firms/{id}` | Minimal backend to unlock frontend dev | ❌ Not started |
| **Backend: Database** | PostgreSQL locally (docker-compose), 2 tables: `prop_firms`, `filters_applied` (for analytics) | Data persistence | ❌ Not started |
| **Backend: Auth** | Session-based (simple cookie) or Anonymous (no auth required) for MVP | Affiliate attribution | ❌ Not started |
| **Infrastructure: Local** | Docker Compose (frontend + backend + PostgreSQL) | Dev environment parity | ⚠️ Partial (templates exist) |
| **Infrastructure: CI** | GitHub Actions: lint, unit tests (no deploy yet) | Code quality gates | ❌ Not started |
| **Tests** | Unit tests for Redux slices + API contract tests | Validate core logic | ❌ Not started |
| **Roadmap: Sequencing** | Updated ROADMAP.md with explicit Phase 0 tasks + dependencies | Decision clarity | ⚠️ This ADR updates it |

**Scope: What is Explicitly OUT**

| Component | Reason | Defer To |
|-----------|--------|----------|
| **True Cost Calculator** | Requires detailed fee structures from all 15+ firms (data-heavy, not logic-heavy) | Phase 1 (after firm DB is complete) |
| **Economic Calendar** | Requires Finnhub API integration + real-time updates (operational overhead) | Phase 1 (after core comparison proven) |
| **Article/Blog System** | CMS integration scope; business logic independent of Prop Firm core | Phase 1 (after revenue model proven) |
| **Affiliate Tracking** | Requires analytics backend, event logging, conversion attribution (complex) | Phase 0.5 (simple click logging only) |
| **Newsletter Form** | Email service integration (SendGrid/Mailchimp config) | Phase 1 (after audience validated) |
| **Kubernetes / EKS** | Over-engineered for MVP; use Docker Compose locally, simple deploy to Heroku/Railway/EC2 | Phase 1 (after product-market fit signals) |
| **Multi-Region Failover** | Premature; single region sufficient | Phase 2 (after 100K+ users) |
| **Distributed Tracing (Jaeger)** | Premature; structured logging sufficient | Phase 1 (after performance bottlenecks appear) |
| **Service Mesh (Istio)** | No microservices yet; monolith is fine | Phase 2 (if traffic justifies) |
| **PostgreSQL Read Replicas** | Single instance sufficient until 1000+ QPS | Phase 1.5 (after stress testing) |

**Phase 0 Definition of Done (MVP Readiness)**

```
Frontend:
  ☑ Homepage renders without errors
  ☑ User can navigate to /prop-firms
  ☑ Filter sidebar (Account Size, Profit Split) dispatches Redux actions
  ☑ FirmCard displays 5+ firms from API
  ☑ ComparisonTable shows side-by-side comparison for 3 selected firms
  ☑ Click "Get Funded" → logs affiliate event (console only)
  ☑ All pages responsive (mobile/tablet/desktop)
  ☑ No console errors or warnings
  ☑ Lighthouse performance ≥ 70

Backend:
  ☑ 3 endpoints implemented (GET /api/v1/prop-firms, POST /api/v1/filter-firms, GET /api/v1/prop-firms/{id})
  ☑ Data can be created, read, and filtered from PostgreSQL
  ☑ Error responses for invalid input (400, 404, 500)
  ☑ Endpoint response times < 200ms (p95)
  ☑ No SQL injection vulnerabilities (parameterized queries)
  ☑ Basic request logging (stdout → Docker logs)

Database:
  ☑ `prop_firms` table with 15+ rows of test data
  ☑ `filters_applied` table to track user filter behavior
  ☑ Indices on frequently queried columns
  ☑ Flyway migration scripts committed to version control

Tests:
  ☑ Redux reducer tests for filterSlice (reducer logic)
  ☑ API contract tests: Request/Response match OpenAPI spec
  ☑ Backend integration test: End-to-end filter flow
  ☑ E2E test (Playwright): User filters firms, sees comparison
  ☑ Test coverage ≥ 60%

Docs:
  ☑ README.md updated with "How to Run Locally"
  ☑ OpenAPI spec (api.yaml) describes 3 MVP endpoints
  ☑ Database schema documented (schema.sql)
  ☑ This ADR approved and signed off by stakeholders

Infrastructure:
  ☑ docker-compose.yml runs all services locally
  ☑ GitHub Actions CI configured (lint, test, build)
  ☑ Deployment playbook drafted (no automation yet)
```

**Phase 0 Timeline & Sequencing**

```
Week 1-2 (Jan 6-19):
  ├─ Backend API skeleton + DB schema
  ├─ Parallel: Frontend structure + Redux store
  └─ Blocker: API contract must be defined BEFORE both teams work

Week 3-4 (Jan 20-Feb 2):
  ├─ Backend: Implement 3 endpoints + test
  ├─ Frontend: Components + integration with API
  └─ Blocker: API must be testable (Postman collection or curl examples)

Week 5-6 (Feb 3-16):
  ├─ E2E tests + performance profiling
  ├─ Security audit (OWASP Top 10)
  └─ Blocker: Must pass security review before Phase 0 → Phase 1

Completion Target: Feb 28, 2026 (8 weeks)
Go/No-Go Gate: March 1, 2026 (stakeholder review)
```

### Phase 1: MVP 0.4-0.9 (Q2 2026)

**Goal:** Add production-readiness foundations based on Phase 0 learnings.

**Additions (Not Phase 0):**

| Component | Trigger | Implementation | Why Deferred |
|-----------|---------|-----------------|-------------|
| **True Cost Calculator** | Firm data complete | Feature module + calculation logic | Requires 15+ firm fee structures (data dependency) |
| **Economic Calendar** | Core comparison proven | Finnhub API client + caching | Operational overhead; validate comparison first |
| **AWS Deployment** | Phase 0 complete & tested | RDS, ALB, EC2 (not EKS yet) | Simpler than K8s; sufficient for <1000 users |
| **Authentication** | Traffic growth signals | OAuth or JWT (currently anonymous) | MVP doesn't require user accounts |
| **Newsletter Form** | Audience validation | SendGrid integration | Add after conversion funnel proven |
| **Affiliate Analytics** | Click volume > 100/day | Event logging backend + dashboard | Simple console logging sufficient for MVP |
| **Distributed Logging** | Multi-service debugging needed | ELK stack or CloudWatch | Single service + Docker logs sufficient |
| **Load Testing** | Before Phase 1 deploy | k6 or JMeter scripts | Establish capacity baseline |

**Phase 1 Go/No-Go Criteria:**
- Phase 0 MVP in production (even if on Heroku or EC2)
- ≥1000 unique users / month OR founder validation of business model
- ≤5% error rate on core transactions
- **Decision Point:** Proceed to Kubernetes/multi-region OR remain on single instance?

### Phase 2: v1.0+ (Q3+ 2026)

**Goal:** Enterprise-scale infrastructure.

**Only Approved If:**
- Phase 1 MVP has ≥10K users/month OR series funding secured
- Performance bottlenecks measured (not guessed)
- Revenue model validated

**Inclusions:**
- Kubernetes (EKS) for auto-scaling
- Multi-region deployment with failover
- Service mesh (Istio) for observability
- Distributed tracing (Jaeger)
- Advanced caching (Redis cluster)

---

## CONSEQUENCES

### ✅ Benefits

1. **Scope Clarity**
   - Frontend team knows exactly which Redux slices to build (propFirmSlice, filterSlice only in Phase 0)
   - Backend team knows exactly which endpoints to implement (3, not 15)
   - Stakeholders know which architectural investments are now vs. later

2. **Risk Reduction**
   - Avoids premature infrastructure investment (Kubernetes before product-market fit)
   - Prevents architectural debt (API designed for MVP use cases, not future needs)
   - Enables fast pivots (if business model changes, simpler system to refactor)

3. **Parallel Workflow**
   - Frontend and backend teams can work independently with clear contracts (OpenAPI spec)
   - Enables testing without full backend (mock API layer)
   - Reduces integration friction

4. **Measurable Go/No-Go Gates**
   - Phase 0 → Phase 1: "MVP in production + traction > threshold"
   - Phase 1 → Phase 2: "Performance bottlenecks measured + revenue model proven"
   - Clear, data-driven decisions replace guesswork

5. **Architectural Continuity**
   - Phase 0 decisions (Docker, structured logging, API contracts) become Phase 1/2 foundations
   - No rework; just progressive enhancement
   - ARCHITECTURE.md remains valid, just phased

### ⚠️ Tradeoffs & Risks

1. **Phase 0 Simplicity vs. Phase 1 Refactor**
   - **Tradeoff:** Phase 0 skips some production considerations (caching, logging aggregation, rate limiting)
   - **Mitigation:** Architectural decisions made now (containers, logging format, API contracts) don't require refactor; only infrastructure grows
   - **Risk Level:** LOW (architecture sound, infrastructure light)

2. **Feature Pressure**
   - **Risk:** Stakeholders want "True Cost Calculator" or "Economic Calendar" in Phase 0
   - **Mitigation:** This ADR documents the rationale; requires explicit re-prioritization + new ADR to override
   - **Risk Level:** MEDIUM (requires stakeholder discipline)

3. **Kubernetes Over-Documentation**
   - **Consequence:** ARCHITECTURE.md describes K8s deployment, but Phase 0/1 use Docker Compose + EC2
   - **Mitigation:** Add "Phase" labels to ARCHITECTURE.md sections; clarify what's aspirational vs. required
   - **Risk Level:** LOW (documentation clarity only)

4. **AWS Costs Unexpected**
   - **Risk:** RDS + ALB + EC2 costs exceed budget in Phase 1
   - **Mitigation:** Phase 1 gate includes cost/performance review; can defer to Phase 2 if needed
   - **Risk Level:** MEDIUM (requires financial planning)

---

## ALTERNATIVES CONSIDERED

### Alternative 1: "Build to ARCHITECTURE.md Specification Immediately"
**Approach:** Start with Kubernetes, RDS, multi-region, distributed tracing in Phase 0  
**Pros:**
- No rework; ARCHITECTURE.md is the implementation spec
- Teams learn Kubernetes, infrastructure-as-code early
**Cons:**
- ❌ 5-6x longer time-to-first-working-feature
- ❌ Kubernetes complexity before product viability proven (classic premature optimization)
- ❌ $10K+/month infrastructure spend before revenue
- ❌ Cognitive overhead; teams context-switch between K8s and business logic
**Verdict:** REJECTED (high risk, low validation)

### Alternative 2: "MVP with No Architecture, Fast & Loose"
**Approach:** Build monolithic Node.js app; ignore ARCHITECTURE.md; move fast  
**Pros:**
- Fastest time-to-market (weeks, not months)
- Maximum flexibility for pivots
**Cons:**
- ❌ Ignores 5 existing ADRs (Java, PostgreSQL, Redux, Docker, K8s)
- ❌ High technical debt; Phase 1 refactor massive
- ❌ Stakeholder confusion (contradicts prior decisions)
**Verdict:** REJECTED (contradicts prior ADR consensus)

### Alternative 3: "Phased Approach with Shorter Phase 0" (Recommended)
**Approach:** This ADR – 8 weeks for Phase 0, clear Phase 1/2 gates  
**Pros:**
- ✅ Validation + architectural continuity
- ✅ Measurable go/no-go gates
- ✅ Clear scope reduces team friction
- ✅ Respects prior architectural decisions without over-engineering
**Cons:**
- ⚠️ Requires stakeholder discipline to not add features mid-Phase
- ⚠️ Some architectural decisions deferred (feels less "complete")
**Verdict:** SELECTED (balanced risk/learning)

---

## RELATED ADRS

- **ADR-001:** Next.js for Frontend → Phase 0 applies
- **ADR-002:** Java Spring Boot → Phase 0 applies (3 endpoints only)
- **ADR-003:** Redux → Phase 0 applies (filterSlice, propFirmSlice only)
- **ADR-004:** PostgreSQL → Phase 0 applies (2 tables, 1 instance)
- **ADR-005:** Docker + Kubernetes → Docker in Phase 0, Kubernetes deferred to Phase 1/2

---

## DECISION RECORD

### This ADR Explicitly Overrides

1. **ROADMAP.md "Module Roadmaps" sections**
   - New Roadmap will be Phase 0 / Phase 1 sequenced (attached separately)
   - Feature status "planned" becomes "Phase 1+" or "Phase 2+"

2. **ARCHITECTURE.md Infrastructure Sections**
   - "Cloud Architecture Timeline" (retroactively dated) is aspirational, not Phase 0 binding
   - "Kubernetes Deployment-Strategie" is Phase 1/2, not Phase 0
   - "Disaster Recovery" (multi-region) is Phase 2, not Phase 1

3. **Implicit Scope in ROADMAP.md**
   - No "Module Roadmaps" section defines MVP boundaries
   - New Phase 0 scope replaces generic "production-ready by Q1 2026"

### This ADR Commits To

1. **Updated ROADMAP.md** (within 1 week)
   - Add "Phase 0 Scope Definition" section
   - Separate features into Phase 0 / Phase 1 / Phase 2
   - Add explicit blocker matrix per feature

2. **Updated ARCHITECTURE.md** (within 2 weeks)
   - Label every section with Phase: 0 / 1 / 2 / Aspirational
   - Add "Implementation Runway" intro explaining phasing
   - Clarify which ADR implications are Phase 0 binding

3. **Phase 0 Implementation Checklist** (within 1 week)
   - GitHub Issues created for each task
   - Milestones: Week 1-2, Week 3-4, Week 5-6
   - Assigned owners (Frontend Lead, Backend Lead, DevOps Lead)

4. **Phase 0 → Phase 1 Go/No-Go Decision Template** (within 2 weeks)
   - Stakeholder review date: March 1, 2026
   - Metrics to measure (user count, error rate, feedback)
   - Decision criteria (proceed / pivot / restart)

---

## IMPLEMENTATION ROADMAP (Directly Actionable)

### Week 1: Decisions & Planning (Dec 28 – Jan 4)

**Task 1.1: Stakeholder Review & Sign-Off**
- Owner: @architecture-lead
- Action: Present ADR-006 to founders + tech leads
- Gate: Must have written approval (Slack, email, or formal sign-off)
- Go/No-Go: If rejected, revise or escalate

**Task 1.2: Update ROADMAP.md with Phase 0 Sequencing**
- Owner: @architecture-lead
- Action: Create "Phase 0 Detailed Roadmap" section (attached as ROADMAP_PHASE0.md)
- Gate: All features have Phase labels, blockers, and team assignments

**Task 1.3: Create GitHub Milestones & Issues**
- Owner: @project-manager
- Action: Create 6 milestones (Week 1-2, 3-4, 5-6), 15+ issues per Phase
- Gate: All issues linked to ROADMAP.md tasks

**Task 1.4: Frontend & Backend Team Kickoff**
- Owner: @frontend-lead, @backend-lead
- Action: Review OpenAPI spec (draft), define API contract
- Gate: Both teams confirm understanding of 3 MVP endpoints

### Week 2-3: Infrastructure Setup (Jan 5 – Jan 19)

**Task 2.1: Backend API Skeleton (Java Spring Boot)**
- Owner: @backend-lead
- Scope: 3 endpoints stub (return mock data)
- Gate: Postman collection created; endpoints callable

**Task 2.2: Database Schema (PostgreSQL)**
- Owner: @database-engineer
- Scope: `prop_firms`, `filters_applied` tables + Flyway migrations
- Gate: docker-compose.yml runs PostgreSQL; schema initialized

**Task 2.3: Frontend Redux Store**
- Owner: @frontend-lead
- Scope: filterSlice + propFirmSlice (Redux Toolkit)
- Gate: Unit tests for reducers pass

**Task 2.4: Docker Compose (All Services)**
- Owner: @devops-lead
- Scope: frontend + backend + PostgreSQL in docker-compose.yml
- Gate: `docker-compose up` runs all 3 services

### Week 4-5: Feature Implementation (Jan 20 – Feb 2)

**Task 3.1: Backend Endpoints (Real Data)**
- Owner: @backend-lead
- Scope: Implement all 3 endpoints; connect to PostgreSQL
- Gate: Integration tests pass; <200ms response time

**Task 3.2: Frontend Components**
- Owner: @frontend-lead
- Scope: FirmCard, ComparisonTable, FilterSidebar components
- Gate: Components render; no console errors

**Task 3.3: API Integration (Frontend)**
- Owner: @frontend-lead
- Scope: Connect Redux to API; dispatch filters, fetch firms
- Gate: E2E test: filter by account size, see results

### Week 6-8: Testing & Polish (Feb 3 – Feb 16)

**Task 4.1: E2E Testing (Playwright)**
- Owner: @qa-engineer
- Scope: Happy path: filter → compare → click "Get Funded"
- Gate: All tests pass on Chrome, Firefox, Safari

**Task 4.2: Security Review**
- Owner: @security-lead
- Scope: SQL injection, XSS, CSRF, API auth
- Gate: No HIGH/CRITICAL findings

**Task 4.3: Performance Profiling**
- Owner: @backend-lead
- Scope: Load testing with 100 concurrent users
- Gate: <200ms p95 latency; <1% error rate

**Task 4.4: Documentation**
- Owner: @architecture-lead
- Scope: README (local setup), API docs, schema docs
- Gate: New developer can run locally in <15 minutes

### March 1: Phase 0 → Phase 1 Gate

**Stakeholder Review Meeting**
- Attendees: Founders, Tech Leads, Product Lead
- Agenda:
  1. Demo: Live app filtering firms
  2. Metrics: User count, error rate, performance
  3. Feedback: What worked? What surprised?
  4. Decision: Proceed to Phase 1 (AWS) OR pivot?
  
**Go Criteria:**
- ✅ MVP in production (even locally)
- ✅ ≥3 external users testing (friends, advisors)
- ✅ Zero critical bugs
- ✅ Team confidence in architecture

**No-Go Criteria:**
- ❌ Core logic broken or misaligned
- ❌ Team burned out (over-scoped)
- ❌ Business assumption invalidated
- → Action: Pivot or extend Phase 0

---

## GOVERNANCE & CHANGE MANAGEMENT

### Approval Process

This ADR requires explicit sign-off from:
1. **Founders / Product Lead** (business scope)
2. **Architecture Lead** (technical feasibility)
3. **Frontend Lead** (UI/UX scope)
4. **Backend Lead** (API scope)
5. **DevOps Lead** (infrastructure scope)

**Sign-Off Format:**
```
☐ @founder1: Approve Phase 0 scope & timeline
☐ @architect-lead: Approve architectural phasing
☐ @frontend-lead: Approve components out-of-scope until Phase 1
☐ @backend-lead: Approve 3-endpoint MVP
☐ @devops-lead: Approve Docker Compose → EC2 progression
```

### Escalation

If any stakeholder objects:
1. Document objection (written, specific)
2. Schedule 30-min alignment call
3. Revise ADR or escalate to founders for final call
4. Update ADR with "Objections Considered" section

### Enforcement

During Phase 0 (Jan-Feb):
- **Weekly standup:** Review whether work aligns with "Phase 0 Scope" section
- **Feature requests:** If new feature proposed, create GitHub Issue with "Phase 1+" label (not auto-approved)
- **Blocker escalation:** If Phase 0 blocker appears, escalate within 24 hours (don't work around it)

---

## METRICS & SUCCESS CRITERIA

### Phase 0 Success Metrics (Measure Feb 28)

| Metric | Target | Why |
|--------|--------|-----|
| Time to "MVP Running Locally" | ≤8 weeks | Validate timeline estimate |
| Test Coverage | ≥60% | Core logic tested |
| API Response Time (p95) | <200ms | Performance baseline |
| Error Rate (MVP workflow) | <1% | Reliability |
| Team Satisfaction | ≥7/10 | Morale indicator |
| Design Debt | 0 Critical | Avoid Phase 1 refactor |

### Phase 1 Go/No-Go Metrics (Measure March 1)

| Metric | Threshold | Action |
|--------|-----------|--------|
| External Users | ≥3 (beta testers) | Validates product-market fit signals |
| Error Rate | <2% | Reliability sufficient for prod |
| Latency | <300ms p95 | Performance acceptable for MVP |
| Feature Stability | 0 hotfixes needed | Code quality sufficient |
| Business Traction | Founder validation | Is this a real problem we're solving? |

### Phase 1 → Phase 2 Metrics (Measure later in 2026)

| Metric | Threshold | Action |
|--------|-----------|--------|
| User Count | ≥10,000/month OR Series A funding | Justifies infrastructure investment |
| Measured Bottleneck | Specific (not guessed) | Data-driven decision |
| Revenue Model | Validated or on path | Business sustainability |
| Infrastructure Cost | Grows linearly with users | Justify AWS complexity |

---

## REFERENCES & RELATED DOCUMENTS

- **ARCHITECTURE.md:** Comprehensive system design (now labeled with Phases)
- **ROADMAP.md:** Feature list (now sequenced by Phase)
- **ADR-001 to ADR-005:** Prior architectural decisions (still valid; just phased)
- **OpenAPI_MVP.yaml:** (To be created) 3-endpoint specification for Phase 0
- **ROADMAP_PHASE0.md:** (To be created) Detailed weekly sequencing for Phase 0

---

## FINAL NOTES FOR TEAM

This ADR is **not** saying "don't build a production-ready system." It's saying:

> **Build a production-ready MVP first. Then add enterprise infrastructure based on real usage patterns.**

The difference:
- ❌ "Production-ready for 10M users before 1st user"
- ✅ "Production-ready for 10K users now; add capacity when real traffic justifies it"

This is how Netflix, Stripe, and most successful startups approached infrastructure. It's not a shortcut; it's **smart sequencing**.

Your ARCHITECTURE.md is beautiful and will be useful. This ADR just says: Phase it.

---

**ADR-006 Status:** PROPOSED  
**Awaiting Stakeholder Sign-Off**  
**Decision Deadline:** Dec 31, 2025

**Next Step:** Share this document with your founders/tech leads. Get sign-offs. Then we update ROADMAP.md with Phase 0 sequencing.

