-- =============================================================================
-- Row Level Security (RLS) Migration for Love Ridge Platform
-- Enables RLS on all 17 public tables and sets up tight security policies.
-- =============================================================================

-- 1. USERS TABLE
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "No public access to users" ON "users";

-- 2. ROLES TABLE
ALTER TABLE "roles" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "No public access to roles" ON "roles";

-- 3. PERMISSIONS TABLE
ALTER TABLE "permissions" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "No public access to permissions" ON "permissions";

-- 4. ROLE_PERMISSIONS TABLE
ALTER TABLE "role_permissions" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "No public access to role_permissions" ON "role_permissions";

-- 5. PROPERTIES TABLE
ALTER TABLE "properties" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access for published properties" ON "properties";
CREATE POLICY "Allow public read access for published properties" 
  ON "properties" FOR SELECT 
  USING (status = 'PUBLISHED');

-- 6. PROPERTY_MEDIA TABLE
ALTER TABLE "property_media" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access for published property media" ON "property_media";
CREATE POLICY "Allow public read access for published property media" 
  ON "property_media" FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM "properties" p 
      WHERE p.id = "property_media"."propertyId" 
      AND p.status = 'PUBLISHED'
    )
  );

-- 7. AMENITIES TABLE
ALTER TABLE "amenities" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access for amenities" ON "amenities";
CREATE POLICY "Allow public read access for amenities" 
  ON "amenities" FOR SELECT 
  USING (true);

-- 8. PROPERTY_AMENITIES TABLE
ALTER TABLE "property_amenities" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access for published property amenities" ON "property_amenities";
CREATE POLICY "Allow public read access for published property amenities" 
  ON "property_amenities" FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM "properties" p 
      WHERE p.id = "property_amenities"."propertyId" 
      AND p.status = 'PUBLISHED'
    )
  );

-- 9. PRODUCT_CATEGORIES TABLE
ALTER TABLE "product_categories" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access for product categories" ON "product_categories";
CREATE POLICY "Allow public read access for product categories" 
  ON "product_categories" FOR SELECT 
  USING (true);

-- 10. PRODUCTS TABLE
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access for published products" ON "products";
CREATE POLICY "Allow public read access for published products" 
  ON "products" FOR SELECT 
  USING (status = 'PUBLISHED');

-- 11. PRODUCT_MEDIA TABLE
ALTER TABLE "product_media" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access for published product media" ON "product_media";
CREATE POLICY "Allow public read access for published product media" 
  ON "product_media" FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM "products" p 
      WHERE p.id = "product_media"."productId" 
      AND p.status = 'PUBLISHED'
    )
  );

-- 12. MEDIA TABLE
ALTER TABLE "media" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access for media" ON "media";
CREATE POLICY "Allow public read access for media" 
  ON "media" FOR SELECT 
  USING (true);

-- 13. LEADS TABLE
ALTER TABLE "leads" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public lead submission" ON "leads";
CREATE POLICY "Allow public lead submission" 
  ON "leads" FOR INSERT 
  WITH CHECK (true);

-- 14. AUDIT_LOGS TABLE
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "No public access to audit_logs" ON "audit_logs";

-- 15. TESTIMONIALS TABLE
ALTER TABLE "testimonials" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access for published testimonials" ON "testimonials";
CREATE POLICY "Allow public read access for published testimonials" 
  ON "testimonials" FOR SELECT 
  USING (status = 'PUBLISHED');

-- 16. PARTNERS TABLE
ALTER TABLE "partners" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access for published partners" ON "partners";
CREATE POLICY "Allow public read access for published partners" 
  ON "partners" FOR SELECT 
  USING (status = 'PUBLISHED');

-- 17. FAQS TABLE
ALTER TABLE "faqs" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access for published faqs" ON "faqs";
CREATE POLICY "Allow public read access for published faqs" 
  ON "faqs" FOR SELECT 
  USING (status = 'PUBLISHED');
