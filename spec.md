Mình đã viết lại toàn bộ theo hướng **một chương trình hoàn chỉnh để sử dụng thực tế**, không còn tư duy MVP/phase. Bản này cũng bổ sung hẳn một chương về **Tailwind CSS + design system + component rules** để Codex agent triển khai UI nhất quán.

# APPLE OPS

## Complete Product, UX & Engineering Specification

**Version:** 2.0
**Status:** Production Specification
**Application:** Internal Apple Developer Operations Platform
**Frontend & Backend:** Next.js
**Primary Language:** TypeScript
**UI Framework:** React + Tailwind CSS + shadcn/ui
**UX Skill:** `ui-ux-pro-max-skill`
**Database:** PostgreSQL + Prisma
**Integrations:** App Store Connect API + App Store Server API

---

# 1. Product Vision

Apple Ops là một web application hoàn chỉnh dùng để thay thế phần lớn thao tác thủ công hằng ngày trên:

* App Store Connect
* TestFlight
* Users & Access
* Certificates
* Devices
* Provisioning Profiles
* Bundle IDs
* App Store Releases
* App Reviews
* Analytics
* Subscription / IAP
* TestFlight Feedback
* Apple API Operations

Mục tiêu không phải clone App Store Connect.

Mục tiêu là xây dựng một **operations layer thông minh nằm phía trên Apple API**.

Apple Ops phải biến các workflow nhiều bước thành thao tác đơn giản.

Ví dụ thay vì:

```text
Users & Access
→ Add User
→ chọn role
→ chọn app
→ Save
→ chờ tester accept
→ vào TestFlight
→ tìm app
→ tìm group
→ add tester
→ chọn build
→ Save
```

Apple Ops chỉ yêu cầu:

```text
tester@example.com

[Add Tester]
```

Hệ thống tự xử lý toàn bộ:

```text
detect current app
↓
check tester exists
↓
check Apple user
↓
check invitation
↓
create invitation if required
↓
assign correct app
↓
assign default permission
↓
wait for acceptance
↓
detect acceptance automatically
↓
resolve beta tester
↓
add tester to correct group
↓
verify
↓
complete operation
```

---

# 2. Product Philosophy

Apple Ops phải tuân theo nguyên tắc:

> User nói mục tiêu. Code quyết định quy trình.

Không đưa business logic ra UI nếu hệ thống có thể tự xác định.

---

# 3. UX Fundamental Rule

## Bad

Không xây UI kiểu:

```text
Email
Role dropdown
App dropdown
Access dropdown
Tester Type dropdown
Beta Group dropdown
Build dropdown
Distribution dropdown
Automatic Access dropdown

[Submit]
```

Đây là đang bắt user hiểu API của Apple.

---

## Good

Trong context của app:

```text
Add Tester

Email
[tester@example.com]

[Add Tester]
```

Advanced settings chỉ xuất hiện khi user chủ động mở:

```text
Advanced options
```

---

# 4. System Intelligence

Hệ thống phải tự suy luận những thông tin có thể suy luận được.

Ví dụ khi đang ở:

```text
/apps/my-app/testers
```

system đã biết:

```text
current app
default internal group
current TestFlight build
default role
tester policy
capacity
```

Do đó tuyệt đối không hỏi lại user.

---

# 5. Progressive Disclosure

UI sử dụng nguyên tắc:

```text
simple first
advanced when needed
```

Default flow:

```text
Email
Add
```

Advanced flow:

```text
Advanced

Role
Target group
App access policy
Build assignment
```

Advanced options mặc định đóng.

---

# 6. Primary UX Goal

Mọi workflow phổ biến nên đạt:

```text
1–2 user actions
```

Không quá:

```text
3 actions
```

trừ destructive hoặc security-sensitive operation.

---

# 7. UX Skill Requirement

Project đã có:

```text
.agents/skills/ui-ux-pro-max/
```

Coding agent bắt buộc phải đọc:

```text
.agents/skills/ui-ux-pro-max/SKILL.md
```

trước khi triển khai UI.

Skill này phải được dùng để nghiên cứu:

```text
developer dashboard
operations console
admin application
data-heavy dashboard
SaaS admin
TestFlight management
developer tools
```

Không được bỏ qua skill và tự thiết kế UI tùy ý.

---

# 8. Design System Generation

Trước khi xây UI chính:

Agent phải dùng UI UX Pro Max để xây design system.

Design system lưu ở:

```text
design-system/

  MASTER.md

  pages/
    dashboard.md
    apps.md
    testers.md
    operations.md
    developer.md
```

`MASTER.md` là global source of truth.

---

# 9. Design Direction

Apple Ops là một **Developer Operations Console**.

Phong cách:

```text
minimal
dense
professional
fast
clean
high contrast
high readability
low cognitive load
precise
functional
```

Không được thiết kế như marketing website.

---

# 10. Visual Language

Ưu tiên:

```text
subtle border
low elevation
controlled spacing
compact cards
dense tables
clear status badges
small but readable typography
consistent iconography
clear hierarchy
```

Hạn chế:

```text
large shadows
heavy gradients
glassmorphism
huge cards
large empty spacing
decorative effects
3D effects
marketing illustrations
```

---

# 11. Tailwind CSS — Mandatory Styling System

Toàn bộ application UI phải sử dụng:

```text
Tailwind CSS
```

Tailwind là styling system chính.

Không sử dụng:

```text
CSS Modules
styled-components
Emotion
SCSS
Less
```

trừ trường hợp library bên thứ ba bắt buộc.

---

# 12. Tailwind Philosophy

Không dùng Tailwind như tập hợp random utility classes.

Phải xây:

```text
semantic design tokens
+
reusable components
+
consistent layout rules
```

---

# 13. Tailwind Theme

Global design tokens được khai báo ở:

```text
app/globals.css
```

và configuration tương ứng với phiên bản Tailwind đang dùng.

Token semantic:

```text
background
foreground

card
card-foreground

popover
popover-foreground

primary
primary-foreground

secondary
secondary-foreground

muted
muted-foreground

accent
accent-foreground

destructive
destructive-foreground

border
input
ring
```

Ngoài ra Apple Ops cần:

```text
success
warning
info
```

---

# 14. Never Hardcode UI Colors

Không viết trực tiếp:

```text
bg-[#121212]
text-[#ffffff]
border-[#e5e7eb]
```

trong component.

Thay vào đó:

```text
bg-background
text-foreground
border-border
```

Status:

```text
text-success
bg-success/10

text-warning
bg-warning/10

text-destructive
bg-destructive/10
```

---

# 15. Arbitrary Tailwind Values

Hạn chế:

```text
w-[347px]
mt-[13px]
text-[11.3px]
```

Chỉ sử dụng khi thật sự cần.

Ưu tiên Tailwind scale chuẩn:

```text
w-80
mt-3
text-xs
```

Nếu arbitrary value xuất hiện nhiều hơn một lần:

```text
promote thành design token/component
```

---

# 16. Component Class Composition

Sử dụng helper:

```ts
cn()
```

kết hợp:

```text
clsx
tailwind-merge
```

Ví dụ:

```ts
cn(
  "flex items-center gap-2",
  active && "bg-accent",
  className
)
```

---

# 17. Component Variants

Component có nhiều variant nên sử dụng:

```text
class-variance-authority
```

Ví dụ:

```text
Button
Badge
StatusBadge
Alert
OperationStatus
```

Không viết nhiều conditional Tailwind phức tạp trực tiếp trong JSX.

---

# 18. Inline Style Rule

Không sử dụng:

```tsx
style={{ ... }}
```

cho static styling.

Inline style chỉ được dùng cho giá trị runtime thật sự dynamic.

Ví dụ:

```text
chart coordinates
progress width
runtime height calculation
```

---

# 19. Responsive Design

Tailwind breakpoints phải được dùng có chủ ý.

Primary:

```text
mobile
tablet
desktop
large desktop
```

Apple Ops desktop-first nhưng responsive.

---

# 20. Mobile Philosophy

Không cố ép desktop table vào điện thoại.

Desktop:

```text
DataTable
```

Mobile:

```text
compact entity cards
```

Ví dụ tester trên desktop:

```text
Email | Type | Groups | Status | Actions
```

Mobile:

```text
tester@example.com
Internal

Ready · Internal QA

•••
```

---

# 21. Spacing

Spacing phải nhất quán.

Suggested:

```text
Page horizontal:
px-4 md:px-6 lg:px-8

Page vertical:
py-4 md:py-6

Section gap:
gap-4 / gap-6

Form controls:
gap-2 / gap-3

Card padding:
p-4 / p-5
```

Không sử dụng spacing quá lớn.

---

# 22. Layout

Application shell:

```text
┌──────── Sidebar ───────┬─────────────────────┐
│                        │ Top bar             │
│ Dashboard              ├─────────────────────┤
│ Apps                   │                     │
│ TestFlight             │ Page                │
│ Developer              │                     │
│ Reviews                │                     │
│ Analytics              │                     │
│ Operations             │                     │
│ Settings               │                     │
└────────────────────────┴─────────────────────┘
```

Sidebar:

```text
fixed desktop
collapsible
responsive drawer mobile
```

---

# 23. Content Width

Data-heavy pages:

```text
max-width: none
```

Không giới hạn dashboard table trong:

```text
max-w-4xl
```

Các page như Settings/form có thể dùng narrow content area.

---

# 24. Typography

Typography phải ưu tiên khả năng đọc.

Suggested hierarchy:

```text
Page title
text-2xl font-semibold

Section title
text-base/font-semibold hoặc text-lg

Card primary
text-sm font-medium

Body
text-sm

Metadata
text-xs text-muted-foreground
```

Không lạm dụng:

```text
text-4xl
text-5xl
```

trong operations app.

---

# 25. Icons

Sử dụng icon library thống nhất.

Ưu tiên:

```text
Lucide React
```

hoặc icon system được UI UX Pro Max đề xuất.

Không dùng emoji như:

```text
🚀
⚠️
✅
```

thay cho functional UI icon.

---

# 26. Button Hierarchy

Variants:

```text
primary
secondary
outline
ghost
destructive
```

Mỗi screen chỉ nên có một primary action nổi bật.

Ví dụ:

```text
Testers

[Add Tester]
```

Không biến tất cả button thành primary.

---

# 27. Destructive Action Styling

Destructive action:

```text
Remove tester
Delete user
Revoke certificate
Delete profile
```

phải sử dụng destructive variant.

Không để cạnh primary action mà không phân biệt.

---

# 28. Tables

Table là thành phần trọng tâm.

Yêu cầu:

```text
sticky header where useful
sorting
filters
search
pagination
row actions
keyboard navigation where practical
responsive behavior
loading skeleton
empty state
error state
```

---

# 29. Row Actions

Không hiển thị 5–6 button trên từng row.

Sử dụng:

```text
primary contextual action
+
••• action menu
```

Ví dụ:

```text
tester@example.com

Ready

[View] [...]
```

---

# 30. Status Badges

Tạo unified component:

```tsx
<StatusBadge status="success" />
```

Variants:

```text
success
warning
danger
info
neutral
pending
```

Không tạo màu riêng cho từng page.

---

# 31. Loading UX

Không blocking toàn page nếu không cần.

Initial load:

```text
Skeleton
```

Background refresh:

```text
subtle spinner
```

Action:

```text
button loading state
```

Không dùng full-screen spinner cho operation nhỏ.

---

# 32. Optimistic UI

Chỉ sử dụng optimistic UI khi operation có khả năng thành công rất cao và dễ rollback.

Không optimistic cho:

```text
Apple invitation
certificate revoke
user deletion
release submission
```

Các thao tác này phải chờ Apple response.

---

# 33. Application Stack

Bắt buộc:

```text
Next.js latest stable
App Router
React
TypeScript strict
Tailwind CSS
shadcn/ui
PostgreSQL
Prisma
Zod
Auth.js
```

Recommended:

```text
Lucide React
class-variance-authority
clsx
tailwind-merge
```

---

# 34. No Separate Backend

Không tạo:

```text
Express
NestJS
Fastify
```

cho phiên bản này.

Next.js là backend.

---

# 35. Architecture

```text
Browser
   ↓
Next.js UI
   ↓
Server Actions / Route Handlers
   ↓
Application Services
   ↓
Domain Services
   ↓
Apple Integration Clients
   ↓
Apple APIs
```

---

# 36. Project Structure

```text
src/

  app/

    (auth)/

    (app)/
      dashboard/
      apps/
      testflight/
      developer/
      reviews/
      analytics/
      subscriptions/
      operations/
      settings/

    api/
      webhooks/
      cron/

  components/

    ui/
    layout/
    data-table/
    status/
    feedback/

  features/

    apps/
    testers/
    groups/
    builds/
    feedback/
    releases/
    provisioning/
    reviews/
    analytics/
    subscriptions/
    operations/

  server/

    apple/

      auth/

      app-store-connect/
        client.ts
        apps.ts
        users.ts
        testflight.ts
        builds.ts
        feedback.ts
        reviews.ts
        analytics.ts
        provisioning.ts
        webhooks.ts

      app-store-server/
        client.ts
        transactions.ts
        subscriptions.ts
        notifications.ts

    services/

    operations/

    jobs/

    webhooks/

    automation/

    audit/

    auth/

    db/

  lib/

  hooks/

  types/
```

---

# 37. Apple Authentication

Sử dụng App Store Connect API Key.

Required:

```text
Issuer ID
Key ID
Private Key
```

JWT generated server-side.

Algorithm:

```text
ES256
```

Audience:

```text
appstoreconnect-v1
```

---

# 38. JWT Provider

Implement:

```ts
class AppleTokenProvider {
  getToken(): Promise<string>
}
```

Responsibilities:

```text
generate
cache
reuse
renew
```

Không generate token cho mỗi HTTP request.

---

# 39. Secret Security

Private key không bao giờ được:

```text
send browser
log
commit
localStorage
sessionStorage
client env
```

---

# 40. Apple API Client

Implement generic:

```ts
AppleApiClient
```

Methods:

```ts
get()
post()
patch()
delete()
paginate()
```

Responsibilities:

```text
JWT
headers
JSON API
pagination
rate limit
retry
Apple request ID
error normalization
structured logs
```

---

# 41. Apple API Modules

Không tạo một file Apple client khổng lồ.

Tách:

```text
AppsClient
UsersClient
TestFlightClient
BuildsClient
FeedbackClient
ReviewsClient
AnalyticsClient
ProvisioningClient
```

---

# 42. Database

Use:

```text
PostgreSQL
Prisma
```

Apple là source of truth.

Database là:

```text
cache
operations state
audit
automation
local UX state
```

---

# 43. Main Database Models

Required:

```text
User
Workspace
WorkspaceMember

AppleConnection

AppleApp
AppleUser
AppleInvitation

BetaTester
BetaGroup
BetaGroupMember
AppleBuild

FeedbackItem

Certificate
RegisteredDevice
BundleId
ProvisioningProfile

CustomerReview

AnalyticsReport

Operation
OperationStep

WebhookEvent

AutomationRule

AuditLog

AppPreference
```

---

# 44. App Preferences

Đây là model quan trọng để giảm thao tác user.

Mỗi app có:

```text
defaultTesterRole
defaultInternalGroupId
defaultExternalGroupId
autoAssignLatestBuild
autoAddAcceptedTester
autoSyncEnabled
```

Do đó user không phải chọn lại mỗi lần.

---

# 45. Dashboard

Route:

```text
/dashboard
```

Dashboard trả lời:

> Có gì cần tôi quan tâm?

Không chỉ hiển thị số liệu vô nghĩa.

---

# 46. Dashboard Sections

## Attention Required

Hiển thị đầu tiên.

Ví dụ:

```text
2 tester invitations waiting
1 certificate expires in 5 days
1 failed operation
3 new TestFlight crash reports
```

---

## TestFlight

```text
Internal testers
Pending invites
Active builds
Expiring builds
New feedback
```

---

## Releases

```text
Latest version
Review status
Latest TestFlight build
```

---

## Developer

```text
Certificates
Profiles
Registered devices
```

---

## Apple API

```text
Connected
Last sync
Last webhook
Failed requests
```

---

# 47. Apps

Route:

```text
/apps
```

Display:

```text
Icon
App name
Bundle ID
Latest store version
Latest TestFlight build
Internal tester usage
Review status
```

---

# 48. App Detail

Route:

```text
/apps/[appId]
```

Tabs:

```text
Overview
TestFlight
Testers
Feedback
Release
Reviews
Analytics
Developer
Settings
```

---

# 49. Testers — Primary Workflow

Route:

```text
/apps/[appId]/testers
```

Header:

```text
Testers                   98 / 100

Search testers...

[Add Tester]
```

---

# 50. Add Tester UX

Click:

```text
Add Tester
```

Dialog:

```text
Add Internal Tester

Email
[tester@example.com]

[Add Tester]
```

Không hỏi gì khác mặc định.

---

# 51. Advanced Tester Options

Expandable:

```text
Advanced options
```

Chỉ khi cần:

```text
First name
Last name
Role
Target group
Automatic build assignment
```

Nếu Apple API yêu cầu first/last name và system chưa biết:

system mới yêu cầu user nhập.

Không hỏi trước nếu không cần.

---

# 52. Smart Tester Resolution

Khi nhập email, backend tự:

```text
search Apple user
↓
search pending invitations
↓
search beta tester
↓
search local cache
```

Sau đó quyết định workflow.

---

# 53. Existing User

Nếu user đã tồn tại:

```text
do not invite again
```

Hệ thống kiểm tra:

```text
app access
group
build
```

và chỉ thực hiện phần còn thiếu.

---

# 54. Pending Invitation

Nếu invitation đã tồn tại:

```text
reuse
```

Không tạo duplicate invitation.

Operation chuyển:

```text
WAITING_FOR_ACCEPTANCE
```

---

# 55. New Tester Workflow

```text
receive email
↓
resolve user
↓
create invitation
↓
grant app access
↓
wait acceptance
↓
detect accepted
↓
resolve beta tester
↓
add to default group
↓
assign latest eligible build if policy enabled
↓
verify
↓
ready
```

---

# 56. Tester Status

Unified statuses:

```text
READY
WAITING_ACCEPTANCE
CONFIGURING
ATTENTION
FAILED
INACTIVE
```

Không expose 15 technical statuses trên main table.

Technical states có thể xem trong operation detail.

---

# 57. Internal Tester Limit

Display:

```text
98 / 100
```

Visual states:

```text
0–89 normal
90–99 warning
100 full
```

---

# 58. Capacity Full UX

Nếu:

```text
100 / 100
```

user vẫn click Add Tester.

System không hiện error chết.

Hiển thị:

```text
Internal tester capacity is full.

Apple Ops can replace an inactive tester.

[Replace Tester]
```

---

# 59. Smart Replace Tester

System tự đề xuất candidate dựa trên:

```text
last activity
group membership
app access
number of apps
recent usage if available
operation history
```

Ví dụ:

```text
Suggested replacement

old-user@example.com

Only has access to this app
No recent TestFlight activity
```

User:

```text
[Replace]
```

---

# 60. Replace Safety

System phải tự kiểm tra:

```text
other app access
roles
other beta groups
critical permissions
```

Nếu user có quyền app khác:

```text
do not delete account
```

Chỉ remove phần cần thiết.

---

# 61. Tester Bulk Import

Support:

```text
CSV upload
paste emails
```

UX:

```text
Paste tester emails

a@example.com
b@example.com
c@example.com

[Continue]
```

System tự parse.

---

# 62. Bulk Preview

Trước execute:

```text
47 testers detected

39 new
5 already ready
2 waiting invitation
1 invalid

[Add 41 Testers]
```

Không yêu cầu user xử lý từng trạng thái.

---

# 63. Beta Groups

Route:

```text
/testflight/groups
```

Display:

```text
Group
App
Type
Testers
Builds
Auto distribution
```

---

# 64. Group Detail

Tabs:

```text
Overview
Testers
Builds
Automation
```

---

# 65. Builds

Route:

```text
/testflight/builds
```

Display:

```text
App
Version
Build
Status
Uploaded
Expires
Groups
```

---

# 66. Build UX

Main statuses:

```text
Processing
Ready
Invalid
Expired
```

Technical Apple states có thể nằm trong detail.

---

# 67. Automatic Build Distribution

Per-app policy:

```text
When a new eligible internal build becomes ready
→ add to default internal group
```

User không phải manually assign mỗi build.

---

# 68. Build Detail

Display:

```text
Version
Build Number
Uploaded
Expiration
Processing State
Minimum OS
Encryption
Beta Groups
Review State
```

---

# 69. TestFlight Feedback

Route:

```text
/testflight/feedback
```

Aggregate:

```text
screenshot feedback
crash feedback
```

---

# 70. Feedback List

Display:

```text
Type
App
Build
Tester
Device
Created
Status
```

Local statuses:

```text
New
Triaged
In Progress
Resolved
Ignored
```

---

# 71. Feedback Detail

Display:

```text
Comment
Screenshot
Build
Device
OS
Tester
Crash details
```

---

# 72. Feedback UX

Primary action:

```text
Mark resolved
```

Secondary:

```text
Create Issue
Ignore
Copy details
```

---

# 73. Developer Section

Route:

```text
/developer
```

Tabs:

```text
Certificates
Devices
Profiles
Bundle IDs
```

---

# 74. Certificates

Columns:

```text
Name
Type
Expiration
Status
```

Warnings:

```text
< 30 days
< 7 days
expired
```

---

# 75. Certificate Safety

Revoke requires:

```text
confirmation dialog
impact explanation
typed confirmation
```

---

# 76. Devices

Display:

```text
Name
UDID
Platform
Status
```

Add Device default form:

```text
Device name
UDID

[Register]
```

---

# 77. Provisioning Profiles

Display:

```text
Name
Type
App
Expires
Devices
Certificate
Status
```

Actions:

```text
Download
Recreate
Delete
```

---

# 78. Profile Automation

When creating profile, system should auto-select reasonable:

```text
bundle ID
eligible certificate
eligible devices
```

User chỉ override khi cần.

---

# 79. Bundle IDs

Display:

```text
Name
Identifier
Platform
Capabilities
```

---

# 80. Releases

Route:

```text
/releases
```

Purpose:

One page quản lý:

```text
Build
TestFlight
App Store Version
Review
Release
```

---

# 81. Release Timeline

Example:

```text
Build Ready

↓

Internal Testing

↓

External Testing

↓

Ready for Submission

↓

Waiting for Review

↓

In Review

↓

Approved

↓

Released
```

---

# 82. Release UX

System phải detect:

```text
latest eligible build
current store version
current review state
missing requirements
```

Primary action tự thay đổi theo state.

Ví dụ:

```text
[Submit for Review]
```

hoặc:

```text
[Release Version]
```

Không hiển thị 8 button một lúc.

---

# 83. Customer Reviews

Route:

```text
/reviews
```

Display:

```text
Rating
Title
Message
Country
Version
Date
Response
```

---

# 84. Review Filters

Quick filters:

```text
Needs response
1–2 stars
Latest version
Last 7 days
```

---

# 85. Review Reply

System có thể prepare reply draft.

Nhưng reply không gửi tự động.

User phải:

```text
review
confirm
send
```

---

# 86. Analytics

Route:

```text
/analytics
```

Data:

```text
Downloads
Installations
Sessions
Active Devices
Crashes
Conversion
```

---

# 87. Analytics UX

Default:

```text
30 days
```

Quick:

```text
7D
30D
90D
```

Không làm dashboard chart quá nhiều.

Ưu tiên:

```text
important trend
comparison
anomaly
```

---

# 88. Subscriptions

Route:

```text
/subscriptions
```

Uses:

```text
App Store Server API
```

Search:

```text
transaction ID
original transaction ID
```

---

# 89. Subscription Detail

Display:

```text
Product
Status
Purchase
Expiration
Auto Renew
Environment
Transaction History
Refund History
```

---

# 90. Sandbox Distinction

Sandbox phải rất rõ:

```text
SANDBOX
```

Không bao giờ mix production/sandbox silently.

---

# 91. Operations Engine

Đây là core architecture của application.

Mọi multi-step mutation trở thành:

```text
Operation
```

---

# 92. Operation Types

Examples:

```text
ADD_TESTER
REPLACE_TESTER
REMOVE_TESTER
ASSIGN_BUILD
CREATE_PROFILE
REGISTER_DEVICE
REVOKE_CERTIFICATE
SYNC_APP
RELEASE_VERSION
```

---

# 93. Operation States

```text
PENDING
RUNNING
WAITING_EXTERNAL_ACTION
SUCCESS
FAILED
CANCELED
```

---

# 94. Operation Steps

Example:

```text
Add Tester

✓ Resolve user
✓ Create invitation
✓ Configure app access
○ Waiting for acceptance
○ Add TestFlight group
○ Verify
```

---

# 95. Retry

Retry phải resume từ failed step.

Không chạy lại workflow từ đầu nếu không cần.

---

# 96. Idempotency

Mandatory.

Trước mutation:

```text
read existing state
```

Example:

Tester already in group:

```text
success
```

Không coi là error.

---

# 97. Operation Center

Route:

```text
/operations
```

Display:

```text
Operation
Resource
Status
Started
Actor
```

Filters:

```text
Running
Waiting
Failed
Completed
```

---

# 98. Error UX

Bad:

```text
Something went wrong.
```

Good:

```text
Tester invitation was created,
but Apple rejected app access configuration.

[Retry]
[View details]
```

---

# 99. Technical Details

Developer users có thể mở:

```text
Technical details
```

Display:

```text
Apple error code
Apple request ID
HTTP status
operation step
```

Không hiển thị secrets.

---

# 100. Automation Engine

Support rules.

Example:

```text
New internal build ready
→ Add to Internal QA
```

```text
Tester accepts invitation
→ Add to Internal QA
```

```text
Certificate < 14 days
→ Attention Required
```

---

# 101. Automation UI

Không expose low-level rule builder ban đầu nếu không cần.

Per app Settings:

```text
Automatically add accepted testers
ON

Automatically distribute new builds
ON
```

---

# 102. Webhooks

Endpoint:

```text
/api/webhooks/apple
```

Webhook handler:

```text
receive
↓
validate
↓
persist
↓
acknowledge
↓
process
```

---

# 103. Webhook Idempotency

Store:

```text
event identifier
payload
receivedAt
processedAt
status
```

Duplicate webhook không được tạo duplicate operation.

---

# 104. Reconciliation

Không phụ thuộc hoàn toàn webhook.

Scheduled reconciliation:

```text
apps
users
tester invitations
beta testers
groups
builds
certificates
profiles
reviews
```

---

# 105. Cache Strategy

UI đọc database trước.

Pattern:

```text
cached data
+
background refresh
```

Không bắt page đợi Apple API khi không cần.

---

# 106. Data Freshness

Hiển thị:

```text
Updated 2m ago
```

Important pages có:

```text
Refresh
```

---

# 107. Authentication

Use:

```text
Auth.js
```

Roles:

```text
Owner
Admin
Developer
Viewer
```

---

# 108. Authorization

Backend luôn kiểm tra permission.

Không dựa vào:

```text
button hidden
```

---

# 109. Audit Log

Mọi mutation tạo AuditLog.

Fields:

```text
actor
action
resource
before
after
timestamp
operationId
appleRequestId
```

---

# 110. Global Search

Shortcut:

```text
Cmd/Ctrl + K
```

Search:

```text
apps
tester email
build number
bundle ID
operations
```

---

# 111. Command Palette

Commands:

```text
Add tester
Find tester
Open app
Sync Apple
View failed operations
Register device
```

---

# 112. Notifications

Toast chỉ cho immediate result.

Ví dụ:

```text
Tester setup started.
```

Không dùng toast cho long-running result rồi bắt user chờ.

---

# 113. Notification Center

Top bar có:

```text
Notifications
```

Display:

```text
Tester ready
Operation failed
Certificate expiring
New crash feedback
Build ready
```

---

# 114. Empty State

Không viết:

```text
No data
```

Viết:

```text
No internal testers yet.

Add a tester and Apple Ops will configure
their App Store Connect and TestFlight access automatically.

[Add Tester]
```

---

# 115. Accessibility

Required:

```text
keyboard navigation
focus states
labels
ARIA where required
contrast
reduced motion support
screen-reader accessible dialogs
```

Không remove:

```text
outline
```

mà không có focus replacement.

---

# 116. Dark Mode

Application nên hỗ trợ:

```text
System
Light
Dark
```

Nếu project đã có appearance system thì integrate.

Tailwind styling phải dùng semantic tokens để dark mode hoạt động tự nhiên.

Không viết duplicate component:

```text
LightButton
DarkButton
```

---

# 117. Motion

Animation:

```text
subtle
fast
functional
```

Suggested:

```text
150–250ms
```

Không sử dụng animation dài cho:

```text
table
dialog
menu
operations
```

---

# 118. Form Validation

Use:

```text
Zod
```

Validation business rule backend.

Client validation chỉ để UX nhanh hơn.

Backend vẫn là authoritative.

---

# 119. Apple Error Normalization

Implement:

```text
AppleApiError
AppleAuthenticationError
ApplePermissionError
AppleRateLimitError
AppleValidationError
AppleNotFoundError
AppleConflictError
```

---

# 120. Rate Limits

HTTP 429:

```text
respect Apple headers
backoff
retry safe calls
```

Mutation không retry vô hạn.

---

# 121. Logging

Structured logs:

```text
operationId
method
endpoint
status
duration
appleRequestId
```

Never log:

```text
private key
JWT
Authorization header
sensitive customer data unnecessarily
```

---

# 122. Test Policy — Important

Không chạy test liên tục sau mỗi thay đổi nhỏ.

Điều này làm mất nhịp development.

Agent phải ưu tiên:

```text
implement feature
↓
continue related feature
↓
complete functional slice
```

---

# 123. Test Execution Strategy

Không chạy:

```text
pnpm test
```

sau mỗi file edit.

Không chạy full suite liên tục.

---

# 124. When Tests May Run During Development

Chỉ chạy targeted test khi:

```text
critical logic uncertain
regression suspected
complex function changed
integration behavior needs confirmation
```

Ví dụ:

```text
pnpm vitest tester-service
```

Không chạy toàn suite.

---

# 125. Final Testing

Sau khi toàn bộ implementation đã hoàn thiện:

```text
lint
typecheck
tests
integration verification
```

chạy một lần theo nhóm.

---

# 126. Testing Priority

Tests tập trung vào business logic quan trọng:

```text
tester resolution
duplicate invitation
tester capacity
replace tester safety
idempotency
Apple error handling
operation resume
webhook duplicate
permissions
```

Không cần test mọi presentational component.

---

# 127. Build Policy — Important

Không chạy production build liên tục.

Không build sau mỗi feature.

Build là validation cuối.

---

# 128. Final Build

Sau khi:

```text
implementation complete
typecheck complete
important tests complete
```

agent được phép:

```text
pnpm build
```

---

# 129. Build Failure

Nếu build fail:

```text
fix
↓
rebuild
```

Chỉ rebuild khi có lý do rõ ràng.

Không chạy build loop vô ích.

---

# 130. Build Cleanup

Sau khi production build thành công và đã xác nhận application compile:

Agent phải xóa local build artifacts.

Ví dụ:

```text
.next/
```

Nếu temporary artifacts được tạo:

```text
coverage/
playwright-report/
test-results/
temporary output
```

và không cần commit thì phải xóa.

---

# 131. Cleanup Rule

Không xóa:

```text
source files
migration
lockfile
config
required generated source
```

Chỉ dọn:

```text
build artifacts
temporary test output
cache files
```

---

# 132. Git Hygiene

Không commit:

```text
.next
coverage
test-results
.env
.p8
temporary logs
```

Đảm bảo `.gitignore` đúng.

---

# 133. Build/Testing Philosophy

Agent phải hiểu:

> Build và test là công cụ xác minh, không phải ritual chạy liên tục.

Ưu tiên flow coding liên tục.

---

# 134. Implementation Completeness

Không để button giả.

Nếu UI có:

```text
Add Tester
```

nó phải hoạt động.

Nếu chưa implement:

```text
không hiển thị
```

Không tạo hàng loạt:

```text
Coming Soon
```

trong production navigation.

---

# 135. Production Readiness

Application chỉ được coi là hoàn thành khi:

```text
authentication works
Apple connection works
apps load
tester management works
build management works
feedback works
developer resources work
reviews work
analytics works
operations work
audit works
settings work
responsive UI works
error handling works
```

---

# 136. Settings

Route:

```text
/settings
```

Sections:

```text
General
Apple Connection
Tester Defaults
Automation
Appearance
Security
```

---

# 137. Apple Connection Settings

Display:

```text
Connection status
Issuer ID
Key ID
Last verified
Last request
```

Private key không bao giờ display lại.

---

# 138. Tester Defaults

Per app:

```text
Default internal group
Default tester role
Auto-add after acceptance
Auto-assign latest build
```

Set once.

Sau đó Add Tester không hỏi nữa.

---

# 139. Safe Defaults

Nếu user chưa configure:

System có thể suggest:

```text
first available internal group
safe tester role
latest eligible internal build
```

Nhưng phải persist decision.

Không hỏi lại mỗi lần.

---

# 140. First-Time Setup

First login wizard chỉ nên có:

```text
1. Connect Apple
2. Select default app
3. Configure tester defaults
```

Không quá nhiều bước.

---

# 141. Setup Completion

Sau setup:

```text
Go to Dashboard
```

System tự sync:

```text
apps
groups
builds
testers
```

---

# 142. Global UX Rule

Nếu system có dữ liệu để quyết định:

```text
system decides
```

Nếu chỉ có một valid option:

```text
system selects
```

Nếu có nhiều lựa chọn nhưng một lựa chọn rõ ràng:

```text
system selects default
user can override
```

Chỉ hỏi khi quyết định thật sự cần human input.

---

# 143. No Confirmation Fatigue

Không confirm cho:

```text
add tester
refresh
retry operation
assign build
```

Confirm cho:

```text
delete user
revoke certificate
remove significant access
release app
destructive operations
```

---

# 144. Contextual Actions

Khi đang trong app detail:

```text
Add Tester
```

không hỏi App.

Khi đang trong beta group:

```text
Add Tester
```

không hỏi Group.

Khi đang ở build detail:

```text
Distribute
```

không hỏi Build.

---

# 145. Smart Defaults

App Ops phải ưu tiên context.

Priority:

```text
current context
↓
app preference
↓
workspace default
↓
safe inferred default
↓
ask user
```

---

# 146. Concurrency

Operations phải chịu được:

```text
double click
multiple tabs
cron + user action
webhook + reconciliation
```

Database locking/idempotency phải ngăn duplicate mutation.

---

# 147. Operation Recovery

Server restart không được làm mất state.

Operation state persisted trong DB.

Sau restart:

```text
resume
or
reconcile
```

---

# 148. Apple API Source of Truth

Không hardcode endpoint từ memory.

Agent phải dùng Apple current API documentation/OpenAPI schema tại thời điểm implementation.

Nếu spec và Apple current API khác nhau:

```text
Apple API schema wins
```

Nhưng UX intent trong spec vẫn phải giữ.

---

# 149. Generated Apple Types

Nếu phù hợp:

generate TypeScript types/client từ official OpenAPI schema.

Sau đó wrap bằng domain API.

Không để generated type leak trực tiếp vào component.

---

# 150. Domain Service Example

```ts
interface TesterService {
  addTester(input: AddTesterInput): Promise<Operation>;

  replaceTester(input: ReplaceTesterInput): Promise<Operation>;

  removeTester(input: RemoveTesterInput): Promise<Operation>;

  reconcileTester(email: string): Promise<void>;
}
```

---

# 151. UI Does Not Know Workflow Complexity

UI chỉ:

```ts
addTester({ email })
```

UI không được tự:

```text
create invitation
then access
then group
then build
```

Workflow nằm trong server service.

---

# 152. Expected Add Tester API

Conceptually:

```text
POST /api/apps/:appId/testers
```

Input:

```json
{
  "email": "tester@example.com"
}
```

Không bắt frontend submit 10 fields nếu không cần.

---

# 153. Expected Response

```json
{
  "operationId": "...",
  "status": "WAITING_EXTERNAL_ACTION"
}
```

UI chuyển sang operation progress.

---

# 154. Tester Detail

Click tester opens side panel hoặc detail page.

Display:

```text
Email
Apple user status
App access
Groups
Build access
Invitation state
Recent operations
```

Primary actions context-sensitive.

---

# 155. Side Panels

Ưu tiên Sheet/Drawer cho quick inspection.

Không navigate page mới cho mọi thứ nhỏ.

Use:

```text
Dialog → short action
Sheet → entity inspection
Page → complex management
```

---

# 156. URL State

Filters/search quan trọng nên được phản ánh vào URL.

Ví dụ:

```text
/testflight/testers?status=pending&q=john
```

Cho phép:

```text
refresh
share link
browser back
```

---

# 157. Data Tables

Table state:

```text
URL
```

hoặc controlled query state.

Avoid storing everything in global client state.

---

# 158. React State Strategy

Ưu tiên:

```text
Server Components
URL state
local component state
```

Không introduce Redux chỉ vì convenience.

---

# 159. Server Components

Use Server Components cho:

```text
initial data
layout
read-heavy views
```

Client Component chỉ khi cần:

```text
interaction
dialog
dropdown
live input
```

---

# 160. Server Actions

Server Actions phù hợp cho:

```text
simple form mutation
settings update
```

Route Handlers phù hợp cho:

```text
webhooks
external API
cron
complex asynchronous operation API
```

Business logic vẫn dùng chung service.

---

# 161. Background Processing

Next.js request không được giữ mở để chờ:

```text
tester acceptance
Apple processing build
review
```

Persist operation rồi return.

---

# 162. Cron/Reconciliation

Implement secure endpoints:

```text
/api/cron/reconcile-testers
/api/cron/sync-builds
/api/cron/sync-resources
```

Protect with:

```text
CRON_SECRET
```

---

# 163. Database Transactions

Dùng transaction cho local operations có multiple writes.

Không giữ DB transaction mở trong lúc gọi Apple network API lâu.

---

# 164. Raw Apple Data

Cached entities nên có:

```text
rawJson JSONB
```

để debug.

Nhưng UI/query phải dùng normalized columns.

---

# 165. Date/Time UX

Store:

```text
UTC
```

Display theo user timezone.

Relative text:

```text
2 minutes ago
```

Tooltip:

```text
Aug 31, 2026 10:41
```

---

# 166. Search UX

Debounced local/server database search.

Không gọi Apple API mỗi keystroke.

---

# 167. Performance

Primary cached page target:

```text
fast enough to feel instant
```

Không block UI bởi Apple response nếu data cached usable.

---

# 168. Skeleton Consistency

Create reusable:

```text
TableSkeleton
CardSkeleton
PageHeaderSkeleton
```

Không tạo random loading UI mỗi page.

---

# 169. Global Error Boundary

Implement:

```text
error.tsx
not-found.tsx
```

Error UX cho phép:

```text
Retry
Go back
Open Operations
```

---

# 170. Security Requirements

Mandatory:

```text
CSRF-safe mutation flow
secure cookies
server-side auth
RBAC
secret isolation
validation
audit
rate limiting where needed
```

---

# 171. Sensitive Operations

Extra check:

```text
delete Apple user
revoke cert
production release
```

User phải có correct RBAC ngay lúc request.

Không rely on session permission cached quá lâu nếu role recently changed.

---

# 172. Final Acceptance Scenario — Tester

Production program phải xử lý:

```text
User opens MyApp

↓

click Add Tester

↓

enter email

↓

click Add

↓

system resolves Apple state

↓

creates invitation only if needed

↓

assigns app access

↓

operation shows Waiting for acceptance

↓

tester accepts Apple invitation

↓

reconciliation/webhook discovers acceptance

↓

system configures TestFlight

↓

assigns default group

↓

assigns build according to policy

↓

verifies

↓

tester becomes READY
```

Không yêu cầu user quay lại App Store Connect.

---

# 173. Final Acceptance Scenario — Capacity Full

```text
100 / 100

↓

Add Tester

↓

system detects capacity

↓

offers best replacement candidate

↓

user confirms replacement

↓

system safely removes only necessary old access

↓

creates new tester workflow

↓

new tester becomes READY
```

---

# 174. Final Acceptance Scenario — Build

```text
new build appears

↓

system syncs

↓

build becomes eligible

↓

automation finds default internal group

↓

assigns build

↓

dashboard displays Ready
```

No manual repetitive assignment.

---

# 175. Final Acceptance Scenario — Failure

```text
Invitation created
App permission failed
```

Operation:

```text
✓ Invitation
✕ App Access
○ TestFlight Group

[Retry]
```

Retry:

```text
starts from App Access
```

Không create invitation mới.

---

# 176. Final Agent Implementation Strategy

Agent nên implement theo vertical slices.

Recommended sequence:

```text
1. Foundation
2. Auth
3. Database
4. Design system
5. Application shell
6. Apple authentication
7. Apple API client
8. Apps
9. Operations engine
10. Testers
11. Beta Groups
12. Builds
13. Feedback
14. Developer resources
15. Releases
16. Reviews
17. Analytics
18. Subscriptions
19. Automation
20. Settings
21. UX polish
22. Security review
23. Final tests
24. Final build
25. Cleanup build artifacts
```

Không phải MVP.

Đây chỉ là implementation order của một sản phẩm hoàn chỉnh.

---

# 177. Agent Coding Rules

Mandatory:

1. Use Next.js.
2. Use TypeScript strict.
3. Use Tailwind CSS.
4. Use shadcn/ui.
5. Read UI UX Pro Max skill before UI implementation.
6. Generate and respect the global design system.
7. Do not call Apple directly from Client Components.
8. Keep credentials server-side.
9. Business logic belongs in server/domain code.
10. UI asks for minimum required user input.
11. Use smart defaults.
12. Use context before asking user.
13. Every multi-step workflow is an Operation.
14. Operations are idempotent.
15. Every mutation is audited.
16. Destructive operations require proper confirmation.
17. Do not create fake buttons.
18. Do not create placeholder functionality in production navigation.
19. Do not overuse client-side state.
20. Do not run full tests after every code edit.
21. Do not run production build repeatedly.
22. Run comprehensive verification near completion.
23. Run final production build when implementation is ready.
24. Fix build errors if any.
25. After successful final verification, remove `.next` and unnecessary build/test artifacts.
26. Never remove source or required generated code during cleanup.
27. Never expose Apple credentials.
28. Keep architecture simple.
29. Prefer reusable domain services.
30. Optimize UX for minimum human effort.

---

# 178. Deliverables

Project must include:

```text
working Next.js application

README.md

.env.example

Prisma schema

database migrations

seed if useful

Apple connection setup guide

development instructions

production deployment instructions

design-system/MASTER.md

required page design overrides

audit logging

operation engine

error handling

responsive UI
```

---

# 179. README Requirements

README must explain:

```text
requirements
install
environment
database setup
Apple API key setup
run development
cron/reconciliation
webhook setup
production deployment
security considerations
```

---

# 180. Environment Example

```env
DATABASE_URL=

AUTH_SECRET=

APPLE_ISSUER_ID=
APPLE_KEY_ID=
APPLE_PRIVATE_KEY=

CRON_SECRET=

NEXT_PUBLIC_APP_NAME=Apple Ops
```

Never expose private Apple secrets using:

```text
NEXT_PUBLIC_
```

---

# 181. Definition of Complete

Apple Ops chỉ được coi là hoàn chỉnh khi nó có thể được chạy và sử dụng như một production internal tool.

Không coi application hoàn thành chỉ vì:

```text
UI exists
routes exist
mock data works
```

Complete means:

```text
real Apple API connection
real data
real mutations
real tester workflow
real operation tracking
real error handling
real persistence
real security
real responsive UI
```

---

# 182. Final Product Principle

Mỗi khi agent phải quyết định:

> Nên hỏi user hay để code xử lý?

Ưu tiên:

```text
code xử lý
```

nếu hệ thống có đủ dữ liệu để quyết định an toàn.

Mỗi khi có workflow nhiều bước:

> Có nên bắt user thực hiện từng bước không?

Câu trả lời mặc định:

```text
Không.
```

Hãy biến nó thành:

```text
one intent
↓
one action
↓
one tracked operation
```

---

# 183. Final UX Standard

Apple Ops thành công khi user có cảm giác:

```text
"Tôi nói tôi muốn làm gì,
hệ thống tự lo phần Apple phức tạp."
```

Chứ không phải:

```text
"Đây là App Store Connect nhưng giao diện khác."
```

---

# 184. Final Engineering Standard

Architecture thành công khi:

```text
UI remains simple

while

business workflows can become complex
```

mà không làm complexity leak ra user.

Final conceptual architecture:

```text
                     APPLE OPS

                         │
                         │
                 User Intent Layer
                         │
                  Simple Next.js UI
                         │
                         ▼
               Application Services
                         │
                         ▼
                 Operation Engine
                  │      │      │
                  │      │      │
               Policy  State  Automation
                  │      │      │
                  └──────┼──────┘
                         │
                         ▼
                  Domain Services
                         │
            ┌────────────┼────────────┐
            │            │            │
         TestFlight   Developer    Commerce
            │            │            │
            ▼            ▼            ▼
      App Store Connect API     App Store Server API
                         │
                         ▼
                        Apple
```

The UI is intentionally simple.

The code owns the complexity.

Điểm quan trọng nhất mình bổ sung là **Tailwind không chỉ là “dùng utility class”** mà trở thành một phần của design system: semantic token, `cn()`, `CVA`, shadcn/ui, responsive rules, status variants và tuyệt đối hạn chế hard-code màu/kích thước.

Mình cũng đã sửa phần workflow phát triển theo đúng yêu cầu của bạn: agent **không được test/build liên tục**, chỉ targeted test khi thật sự cần; đến cuối mới chạy typecheck/test/build tổng thể. Sau khi build production thành công và xác minh xong thì phải dọn `.next/`, coverage, Playwright report và các artifact tạm, nhưng không được đụng vào source/migration/generated code cần thiết.
