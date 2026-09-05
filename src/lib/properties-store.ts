import fs from "fs";
import path from "path";
import { prisma } from "./db";
import { getSystemSetting, setSystemSetting } from "./system-settings";
import {
  PropertyItem,
  sanitizePropertyForPublic,
  INITIAL_PROPERTIES_STORE,
} from "./properties-constants";

export * from "./properties-constants";

const FILE_PATH = path.join(process.cwd(), "scratch", "properties.json");

function ensureFile() {
  try {
    const dir = path.dirname(FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(FILE_PATH)) {
      fs.writeFileSync(FILE_PATH, JSON.stringify(INITIAL_PROPERTIES_STORE, null, 2), "utf-8");
    }
  } catch (err) {
    console.error("Error maintaining properties.json file:", err);
  }
}

export function readPropertiesFromFile(): PropertyItem[] {
  ensureFile();
  try {
    if (fs.existsSync(FILE_PATH)) {
      const data = fs.readFileSync(FILE_PATH, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Failed reading properties from file:", err);
  }
  return INITIAL_PROPERTIES_STORE;
}

export function writePropertiesToFile(properties: PropertyItem[]) {
  ensureFile();
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(properties, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed writing properties to file:", err);
  }
}

export async function getAllProperties(): Promise<PropertyItem[]> {
  try {
    const { data: dbCatalog, isDefault } = await getSystemSetting<PropertyItem[]>(
      "properties_catalog",
      INITIAL_PROPERTIES_STORE
    );
    if (!isDefault && Array.isArray(dbCatalog) && dbCatalog.length > 0) {
      return dbCatalog;
    }
  } catch (e) {
    console.warn("Could not read properties from system_settings:", e);
  }

  const fileProperties = readPropertiesFromFile();
  return fileProperties.length > 0 ? fileProperties : INITIAL_PROPERTIES_STORE;
}

export async function saveProperty(propData: Partial<PropertyItem>): Promise<PropertyItem> {
  const currentProps = await getAllProperties();
  const now = new Date().toISOString();

  let existingIndex = -1;
  if (propData.id) {
    existingIndex = currentProps.findIndex((p) => p.id === propData.id);
  }
  if (existingIndex === -1 && propData.slug) {
    existingIndex = currentProps.findIndex((p) => p.slug === propData.slug);
  }

  const newProperty: PropertyItem = {
    id: propData.id || `prop-${Date.now()}`,
    title: propData.title || "Untitled Property",
    slug: propData.slug || ((propData.title || "prop").toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString().slice(-4)),
    description: propData.description || "Property listing description.",
    listingType: propData.listingType || "SALE",
    propertyType: propData.propertyType || "HOUSE",
    status: propData.status || "DRAFT",
    price: typeof propData.price === "number" ? propData.price : parseFloat(propData.price as any) || 0,
    currency: propData.currency || "USD",
    pricePeriod: propData.pricePeriod || "outright purchase",
    negotiable: Boolean(propData.negotiable),
    commission: propData.commission || "",
    bedrooms: typeof propData.bedrooms === "number" ? propData.bedrooms : parseInt(propData.bedrooms as any) || 0,
    bathrooms: typeof propData.bathrooms === "number" ? propData.bathrooms : parseInt(propData.bathrooms as any) || 0,
    guestRooms: typeof propData.guestRooms === "number" ? propData.guestRooms : parseInt(propData.guestRooms as any) || 0,
    boysQuarters: typeof propData.boysQuarters === "number" ? propData.boysQuarters : parseInt(propData.boysQuarters as any) || 0,
    garage: typeof propData.garage === "number" ? propData.garage : parseInt(propData.garage as any) || 0,
    sizeSqft: propData.sizeSqft ? (typeof propData.sizeSqft === "number" ? propData.sizeSqft : parseFloat(propData.sizeSqft as any)) : null,
    livingAreaSqft: propData.livingAreaSqft ? (typeof propData.livingAreaSqft === "number" ? propData.livingAreaSqft : parseFloat(propData.livingAreaSqft as any)) : null,
    locationAddress: propData.locationAddress || "Accra",
    city: propData.city || "Accra",
    region: propData.region || "Greater Accra",
    country: propData.country || "Ghana",
    featured: Boolean(propData.featured),
    imageUrl: propData.imageUrl || "/property_villa.png",
    galleryUrls: Array.isArray(propData.galleryUrls) ? propData.galleryUrls : [],
    contactName: propData.contactName || "Desmond Senanu",
    contactPhone: propData.contactPhone || "+233 24 643 2493",
    contactEmail: propData.contactEmail || "agent@loveridge.com",
    ownerName: propData.ownerName || "",
    ownerPhone: propData.ownerPhone || "",
    ownerCompany: propData.ownerCompany || "",
    amenities: Array.isArray(propData.amenities)
      ? propData.amenities
      : existingIndex >= 0 && Array.isArray(currentProps[existingIndex].amenities)
      ? currentProps[existingIndex].amenities
      : [],
    createdAt: existingIndex >= 0 ? currentProps[existingIndex].createdAt : now,
    updatedAt: now,
  };

  const updatedList = [...currentProps];
  if (existingIndex >= 0) {
    updatedList[existingIndex] = { ...updatedList[existingIndex], ...newProperty };
  } else {
    updatedList.unshift(newProperty);
  }

  // Save permanently in PostgreSQL system_settings table
  await setSystemSetting("properties_catalog", updatedList);

  // Best-effort local file write
  writePropertiesToFile(updatedList);

  return newProperty;
}

export async function deleteProperty(id: string): Promise<boolean> {
  const currentProps = await getAllProperties();
  const updated = currentProps.filter((p) => p.id !== id);
  await setSystemSetting("properties_catalog", updated);
  writePropertiesToFile(updated);
  try {
    await prisma.property.delete({ where: { id } }).catch(() => null);
  } catch (e) {
    // ignore prisma error
  }
  return true;
}
