# IIT Roorkee Bhavans Portal - AI Coding Agent Guidelines

This document contains architectural rules, development constraints, database schemas, and page-specific logic for the Bhavans of IITR codebase. Any AI agent (e.g., Antigravity) working on this codebase must adhere strictly to these guidelines.

---

## 1. Project Directory & Routing Structure

This is a Next.js (App Router) project integrated with Supabase. The main routes are:

### Public Pages
- **Homepage (`app/page.tsx`)**: Displays the main hero, Leaflet interactive map, 21 Bhavan info grid, and the global events directory feed.
- **Bhavan Pages (`app/bhavans/[slug]/page.tsx`)**: Dynamic route for each hostel. Shows the Bhavan Hero, Notices, Amenities, Gallery, Council members, and Bhavan-scoped events carousel.
- **Events Directory (`app/events/page.tsx`)**: Displays global college-wide announcements, blogs, and polls. Supports type filtering (Poll, Blog, Announcement) and status checks (Active, Past).
- **Event Detail Page (`app/events/[id]/page.tsx`)**: Renders markdown content for blogs, file download lists for notices, text details for announcements, and the interactive voting chart/buttons for polls.

### Admin & Creation Pages
- **Dashboard (`app/dashboard/page.tsx`)**: Main directory for hostel managers and global admins to view and manage their content.
- **Creation Pages (`app/create/[type]/page.tsx`)**: Specialized forms for notice, blog, announcement, and poll creation.
- **Editing Pages (`app/edit/[id]/page.tsx`)**: Loads the shared [EditFormWrapper.tsx](file:///Users/dhruvkandpal/Documents/BhavansOfIITR/components/event/EditFormWrapper.tsx) component to edit existing items.
- **Admin Management Hub (`app/admin/...`)**: Includes user role assignment, council term manager, gallery upload manager, issue tracker, and hostel warden registers.

---

## 2. Database Schema Reference

The portal relies on the following relational structure in Supabase:

### Core Tables
1. **`users`**:
   - columns: `id` (uuid), `name`, `enrollment_id`, `email`, `image_url`, `bhavan_id` (foreign key to bhavans), `is_super_admin` (boolean).
2. **`user_roles`**:
   - columns: `id`, `user_id`, `role` (`manager`, `super_admin`), `bhavan_id` (optional scope limit).
3. **`bhavans`**:
   - columns: `id`, `name`. Note that additional metrics (strength, colors, year, category) are kept statically in [bhavans-data.ts](file:///Users/dhruvkandpal/Documents/BhavansOfIITR/lib/bhavans-data.ts).

### Content Tables
- **`content_items`**: The parent table for all feed cards.
  - columns: `id`, `type` (`poll`, `blog`, `announcement`, `notice`), `title`, `status` (`draft`, `published`, `archived`), `bhavan_scope` (integer ID of bhavan, or null if college-wide), `allows_comments`, `allows_share`, `created_by`, `created_at`.
- **`blogs`**: Child table containing blog posts.
  - columns: `id`, `content_item_id`, `body` (markdown), `excerpt`, `cover_image_url`.
- **`announcements`**: Child table containing text announcements.
  - columns: `id`, `content_item_id`, `body`, `image_url`, `expires_at`.
- **`notices`**: Child table containing notices.
  - columns: `id`, `content_item_id`, `body`.
- **`notice_attachments`**: Attachment files for notices.
  - columns: `id`, `notice_id`, `file_name`, `file_url`, `file_type`.

### Interactive Tables
- **`poll_options`**:
  - columns: `id`, `content_item_id`, `option_text`, `display_order`.
- **`poll_votes`**:
  - columns: `id`, `poll_option_id`, `content_item_id`, `user_id`. (RLS restricts select operations to the owner of the vote).
- **`comments`**:
  - columns: `id`, `content_item_id`, `user_id`, `body`, `created_at`.

---

## 3. Critical Security & RLS Rules

### Guest Access & Poll Results Bypass
- **The RLS Issue**: The `poll_votes` table has Row Level Security enabled. Selecting directly from `poll_votes` returns `0` results for anonymous guests, making percentages show as `0%`.
- **The RPC Solution**: You **MUST** use the secure database function `get_poll_results` to aggregate vote counts safely without leaking voter identities:
  ```typescript
  const { data, error } = await supabase.rpc('get_poll_results', { poll_id: id })
  ```
  This returns: `{ option_id: number, vote_count: number }[]`. Match option IDs dynamically at runtime.

### Manager Scoping & Creator Privileges
- If a user has a specific `bhavan_id` scope in `user_roles` (meaning they only manage one hostel, e.g., Azad Bhawan):
  1. **Hide the College-wide option** in the `bhavan_scope` selector on Notice, Blog, Announcement, and Poll forms.
  2. **Filter the dropdown list** to show only their assigned hostel.
  3. **Disable / gray out** the selector if they are assigned to exactly one hostel.
- For edit forms ([EditFormWrapper.tsx](file:///Users/dhruvkandpal/Documents/BhavansOfIITR/components/event/EditFormWrapper.tsx)), apply this same evaluation to prevent scoped managers from updating the content's scope outside their authorization.

### Voting Restrictions
- For polls scoped to a hostel (`bhavan_scope !== null`), fetch the user's `bhavan_id` from the `users` table. 
- If `user.bhavan_id !== item.bhavan_scope`, block voting buttons and display: `"This poll is only open to [Bhavan Name] residents"`. (College-wide polls are open to all logged-in users).

### Navbar / Dashboard Visibility
- The "My Events" link/button in the Navbar must be visible to any user who is a `super_admin` (indicated by `is_super_admin` in `users` table), has a role in `user_roles`, or has at least one entry in the `permissions` table:
  `user && (isSuperAdmin || hasRole || hasPermission)`.
- Never check only `hasRole || hasPermission` as this will lock out global `super_admin` accounts that haven't created any events or don't have explicit entries in the `user_roles` table.

---

## 4. UI Rendering, Image Fallbacks & Optimization

### Image Formats & Fallbacks
- **Optimized WebP**: All user uploads must convert to `.webp` through the client [compressImage](file:///Users/dhruvkandpal/Documents/BhavansOfIITR/lib/utils/compress-image.ts) helper.
- **Homepage Bhavan Cover Photos**: Attempt loading cover images at `/images/bhawans/[slug].webp`. Add `imgError` state tracking and revert to a color gradient overlay placeholder if the file is missing from the directory:
  ```tsx
  {!imgError ? (
    <img src={`/images/bhawans/${slug}.webp`} onError={() => setImgError(true)} />
  ) : (
    <div className="bg-gradient-to-br ...">Fallback</div>
  )}
  ```
- **Amenity Images**: Scoped amenity cards load photos from `/images/bhawans/[slug]/amenities/[id].webp`. Apply state fallbacks here as well to avoid raw broken-image borders.

### Dynamic Theme System
- Hostels render custom branding based on color schemes retrieved from [bhawans-data.ts](file:///Users/dhruvkandpal/Documents/BhavansOfIITR/lib/bhawans-data.ts):
  - `theme.primary`: Main brand color (hex, e.g., `#c2410c` for orange).
  - `theme.primaryLight`: Light backdrop tint.
  - `theme.primaryDark`: Borders and contrast typography.
- When creating buttons, cards, or notices, map styles dynamically to `theme.primary` inline or via custom attributes to match the hostel's brand.

### Event Share Card System (1:1 Layout)
- **Hiding for Notices**: The share-as-image feature **MUST NOT** be enabled or visible for notices (`item.type === 'notice'`). It applies strictly to Blogs, Announcements, and Polls.
- **Client rendering**: The card is rendered using `html-to-image` at exactly `1080x1080` dimensions in [ShareModal.tsx](file:///Users/dhruvkandpal/Documents/BhavansOfIITR/components/events/ShareModal.tsx). Any changes to this component must maintain the aspect ratio constraints and handle Web Share APIs natively.
- **Server dynamic OG route**: Open Graph metadata on the detail pages (`app/events/[id]/page.tsx`) dynamically refers to `/api/events/[id]/og` to display live cards matching the database counts.
- **Card Aesthetics**: The share template has a light color scheme (`#f8fafc` slate-50 background) with custom Bhavan color glows, large cover images (4:5 ratio split screen), large typography, excerpts, and clean CTA banners. Keep this styling consistent between the client canvas and server-side Satori outputs.

---

## 5. Development & Verification
- **Swami Vivekananda Spelling**: Swami Vivekananda's name **must** be spelled as `"Vivekananda"` (ending in `"a"`) globally. In dynamic pages, ensure backward compatibility for legacy DB schemas:
  ```typescript
  .in('name', [bhavan.name, 'Vivekanand Bhawan'])
  ```
- **Verification Rule**: Always compile and check type-safety before completing any task using:
  ```bash
  npx tsc --noEmit
  ```

---

## 6. Spelling Standards (Bhavan vs. Bhawan)
- **Standard UI Spelling**: Under IIT Roorkee convention, use the spelling **"Bhawan"** (singular) and **"Bhawans"** (plural) for all user-facing labels, page titles, navigation links, layout routes, and components.
- **Folder Directories**: Component files reside in `components/bhawan/` and dynamic routing paths reside in `app/bhawans/[slug]/page.tsx`.
- **Critical Exclusions (Do Not Rename)**:
  1. **Supabase Database Schemas**: Keep database queries and fields using `'bhavans'` (e.g., `.from('bhavans')`), `bhavan_scope`, `bhavan_slug`, and `bhavan_id` to prevent breaking table configurations and foreign keys.
  2. **Site Title Brand**: Keep the main header branding title `"BHAVANS OF IITR"` intact.

