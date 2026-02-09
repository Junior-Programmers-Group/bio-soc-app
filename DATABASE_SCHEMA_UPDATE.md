# Database Schema Update Guide

## Overview
The plant management system now supports comprehensive plant data with the following new fields.

## Updated Plant Record Structure

### Current Fields (in PocketBase "class" collection)
Your PocketBase collection needs to have these fields:

#### Basic Information
- **name** (Text) - Required. Plant common name
- **scientificName** (Text) - Optional. Scientific name (e.g., Leucaena leucocephala)
- **commonNames** (Text) - Optional. Comma-separated common names
- **description** (Text, Long) - Optional. General description or morphology
- **imageUrl** (Text/URL) - Optional. URL to plant image
- **phylum_id** (Number) - Reference ID to phylum

#### Taxonomy Information
- **kingdom** (Text) - e.g., Plantae
- **order** (Text) - e.g., Fabales
- **family** (Text) - e.g., Fabaceae
- **subfamily** (Text) - e.g., Caesalpinioideae
- **species** (Text) - e.g., L. leucocephala

#### Plant Details
- **morphology** (Text, Long) - Physical characteristics and appearance
- **ecology** (Text, Long) - Ecological information and habitat
- **distribution** (Text, Long) - Geographic distribution
- **uses** (Text, Long) - Common uses and applications

---

## Steps to Update PocketBase Schema

### 1. Access PocketBase Admin Dashboard
- Go to: https://jpg-services.nddu.edu.ph/pb-biosoc/admin
- Log in with admin credentials

### 2. Navigate to Collections
- Click on **Collections** in the left sidebar
- Find and select the **"class"** collection (which stores plants)

### 3. Add New Fields
Click **"Add field"** and create these fields:

#### Text Fields (Single Line)
- scientificName
- commonNames
- imageUrl
- kingdom
- order
- family
- subfamily
- species

#### Text Fields (Long Text/Textarea)
- morphology
- ecology
- distribution
- uses

### 4. Save Changes
Click **Save** to update the collection schema

---

## Field Details & Recommendations

| Field | Type | Required | Example |
|-------|------|----------|---------|
| name | Text | ✓ Yes | River Tamarind |
| scientificName | Text | No | Leucaena leucocephala |
| commonNames | Text | No | white leadtree, white popinac |
| description | Text | No | A fast-growing tree... |
| imageUrl | URL | No | https://example.com/image.jpg |
| kingdom | Text | No | Plantae |
| order | Text | No | Fabales |
| family | Text | No | Fabaceae |
| subfamily | Text | No | Caesalpinioideae |
| species | Text | No | L. leucocephala |
| morphology | Textarea | No | Tall tree up to 25m... |
| ecology | Textarea | No | Grows in tropical... |
| distribution | Textarea | No | Found in Central America... |
| uses | Textarea | No | Used for timber, food... |
| phylum_id | Number | No | 1, 2, 3, etc. |

---

## Migration Notes

### For Existing Data
If you have existing plants in the database:
1. The new fields will be empty for existing records
2. You can update them manually or via bulk import
3. No data will be lost

### Backward Compatibility
- The frontend still accepts the old `image` field
- The old `commonName` field is still supported
- New data uses the expanded field structure

---

## Testing the Update

After updating the PocketBase schema:

1. **Test Create**: Add a new plant through the admin dashboard
   - Fill in basic info
   - Add taxonomy
   - Add details
   - Upload/add image

2. **Test Display**: Check if plants display correctly in the grid

3. **Test Edit**: Edit an existing plant to verify all fields work

4. **Test Delete**: Verify deletion still works

---

## Troubleshooting

### Fields Not Showing in Form?
- Make sure you added all fields to the PocketBase collection
- Clear browser cache and reload
- Check browser console for errors

### Data Not Saving?
- Verify field names match exactly (case-sensitive)
- Check PocketBase collection permissions
- Ensure you're logged in as admin

### Image Preview Not Working?
- Verify the imageUrl is a valid, publicly accessible URL
- Check browser console for CORS errors
- Some image hosting services may be blocked

---

## Future Enhancements

Consider adding these fields in the future:
- Plant family relationships (parent/child plants)
- Multiple images gallery
- Conservation status
- Medicinal properties
- Water requirements
- Light requirements
- Soil type compatibility
