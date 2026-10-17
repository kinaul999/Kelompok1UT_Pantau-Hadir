# **Product Requirement Document (PRD): Pantau Hadir**

## **1\. Product Overview**

- **Product Name:** Pantau Hadir
- **Product Description:** A lightweight Progressive Web Application (PWA) / web-based attendance system designed for construction project workers and administrative supervisors. It streamlines presence recording using GPS geofencing and facial recognition selfie verification, paired with an automated management dashboard for automated attendance reconciliation.
- **Core Value Proposition (UVP):** Lightweight and data-efficient web app featuring verified location and identity checks, helping construction companies eliminate attendance fraud and simplify attendance monitoring across distributed project sites.

## **2\. Design Context**

- **Target Industry:** Construction and Field Operations.
- **Operational Environment:** High-mobility physical construction sites (e.g., residential areas, remote infrastructure sites, highway development) with poor, unstable, or zero cellular signal coverage.
- **User Constraints:**
  - **Site Workers:** Low-end to mid-range mobile devices, basic digital literacy, working 12-hour shifts or local commutes, wearing safety gear (gloves), and dealing with dusty/dirty hands.
  - **Site Admin/Supervisors:** Managing multiple project locations (2–3 sites, 20–30 workers per site) simultaneously, prone to "Excel manual entry" fatigue and fragmented WhatsApp messaging overflow.
- **Technical Constraints:** Must run directly via web browser without requiring heavy app store downloads, minimal data consumption, resilient under 3G/2G/unstable Wi-Fi environments, and built using semantic W3C-compliant HTML5 standards.

## **3\. Roles & User Personas**

### **Role 1: Field Construction Worker**

- **Persona Name:** Bambang Cahyadi (28 years old)
- **Role/Title:** Field Construction Worker & Equipment Operator
- **Archetype:** "Si Pejuang Lapangan Serba Kerja Dua Kali"
- **Goals:**
  - Record daily attendance and overtime hours quickly (< 1 minute) without obstructing physical labor tasks.
  - Ensure financial transparency and guarantee salary payments are received in full without deductions caused by system errors.
  - Ensure smooth handover shifts at the site.
- **Frustrations:**
  - Dual attendance reporting (having to check in via app AND report manually via WhatsApp/mandor out of fear of lost records).
  - Network vulnerability (attendance duration bloating from seconds to 30 minutes due to server downtime or rain/poor connectivity).
  - Anxiety over lost data or closed medical check-up forms.

### **Role 2: Site Administrator & Supervisor**

- **Persona Name:** Fitria Kirana (27 years old)
- **Role/Title:** Site Administration Officer & Field Supervisor
- **Archetype:** "Si Pengawas Proyek Multitasking Terbeban Rekap"
- **Goals:**
  - Automatically validate worker presence (location & facial proof) across multiple sites.
  - Produce accurate daily and monthly payroll recap reports instantly.
  - Save administrative time to focus on physical field supervision.
- **Frustrations:**
  - Scattered WhatsApp photo messages getting buried under thousands of chat groups.
  - Time-consuming manual cross-checking between timestamped photos, worker names, and Excel spreadsheets.
  - High risk of human error leading to payroll calculation discrepancies and worker complaints.

## **4\. User Stories**

### **Worker Path (Mobile PWA Flow)**

1. **As a Field Worker**, I want to log into the web app using my NIK and Password so that I can access my attendance portal without downloading heavy app store software.
2. **As a Field Worker**, I want the app to automatically check my GPS location against the project's geofence radius so that my attendance is verified on site.
3. **As a Field Worker**, I want to take a quick selfie photo with server time stamping so that I can prove my presence without filling out manual paper forms.
4. **As a Field Worker**, I want to see a clear confirmation screen and my past attendance log so that I am reassured my salary will not be unfairly deducted.
5. **As a Field Worker**, I want an emergency exit or error screen with clear guidance when connection fails so that I don't get stuck on a dead-end page.

### **Admin Path (Desktop Dashboard Flow)**

1. **As a Site Admin**, I want to log into a centralized desktop dashboard so that I can manage attendance across all assigned project sites.
2. **As a Site Admin**, I want to view dynamic daily statistics (Total Workers, Present, Absent) at a glance so that I can monitor site operations.
3. **As a Site Admin**, I want an automatically generated attendance recap table with photo evidence modals so that I do not have to search WhatsApp groups manually.
4. **As a Site Admin**, I want to filter attendance data by date/site and export reports directly to Excel (.XLSX) or PDF with one click so that I can send payroll data to management instantly.
5. **As a Site Admin**, I want to add, edit, or remove worker profiles and assign them to specific project sites.

## **5\. In Scope vs. Out of Scope**

### **In Scope**

- **Mobile Worker Flow:**
  - Web-based Login screen with NIK and Password.
  - Real-time GPS Geofencing verification.
  - Front-camera selfie preview & submission.
  - Real-time server timestamping.
  - Attendance submission confirmation screen with historical log table.
  - Fallback Error / Offline notice screen.
- **Desktop Admin Flow:**
  - Admin Login and Dashboard overview.
  - Automated Attendance Reconciliation Table.
  - Photo evidence preview modal (\[Bukti\] viewer).
  - Filtering capabilities (by Site, Date, Worker Name/ID).
  - One-click Data Export (Excel / PDF format).
  - Worker Management (CRUD: Add, Edit, Delete worker profiles and project assignment).
- **Technical & Semantic Standards:**
  - Pure Semantic HTML5 architecture (&lt;header&gt;, &lt;nav&gt;, &lt;main&gt;, &lt;section&gt;, &lt;form&gt;, &lt;fieldset&gt;, &lt;footer&gt;) meeting 100% W3C Validator standards.

### **Out of Scope**

- Automated continuous BLE (Bluetooth Low Energy) beacon hardware tracking.
- Full automated payroll banking disbursement integration (direct wire transfer API).
- Native iOS / Android app store builds (only responsive Web PWA).
- Complex ML-based liveness detection (3D head movement verification).

## **6\. Success Criteria & Metrics**

- **Page Load Performance:** Achieve a page load speed of **< 3–5 seconds** under simulated 3G or constrained network signal environments, validated through network throttling performance testing.
- **Data Transmission Success Rate:** Maintain a **≥ 90%** successful attendance data submission rate under limited connectivity conditions, measured via network simulation testing.
- **Anti-Fraud & Geofencing Accuracy:** Reach **≥ 90%** precision in detecting and rejecting off-site or out-of-radius attendance attempts, verified through geofence boundary testing.
- **Usability & Self-Service Efficiency:** Ensure **≥ 90%** of field workers can complete attendance independently in **< 1 minute** without mandor intervention, validated via on-site Usability Testing (UT).
- **Admin Reconciliation Time Reduction:** Deliver a **≥ 50% reduction** in time spent compiling attendance data compared to manual WhatsApp and Excel workflows, measured by admin time-on-task benchmarks.
- **Code Quality & Semantic Accessibility:** Achieve **100% W3C Validation** (0 errors) featuring semantic tag hierarchy and accessible form bindings, verified via the official W3C Markup Validation Service.