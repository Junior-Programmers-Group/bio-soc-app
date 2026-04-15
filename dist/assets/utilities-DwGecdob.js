import{p as c}from"./backend-CXBYh2AR.js";import{Q as F}from"./vendor-other-Bu-56mpB.js";const R=new Map,D=300*1e3,E=r=>{const o=R.get(r);return o&&Date.now()-o.timestamp<D?(console.log("Using cached data for:",r),o.data):(R.delete(r),null)},q=(r,o)=>{R.set(r,{data:o,timestamp:Date.now()}),console.log(" Cached request:",r)},S=async(r,o)=>{try{if(console.log("🔍 fetchTaxonomyHierarchy called with genusIdOrName:",r,"optionalFamilyId:",o),!r&&!o)return console.warn("⚠️  No genusIdOrName or familyId provided"),{};const s={};console.log("📍 Fetching Genus record:",r);let e=await c.collection("genus").getOne(r,{requestKey:null});s.genus=e.name,console.log("✓ Genus found:",e.name),console.log("  Genus fields:",Object.keys(e)),console.log("  Genus has 'family' field?:",e.family);const n={genus:{fieldName:"family",nextCollection:"family",nextLevelField:"order"},family:{fieldName:"order",nextCollection:"order",nextLevelField:"class"},order:{fieldName:"class",nextCollection:"class",nextLevelField:"phylum"},class:{fieldName:"phylum",nextCollection:"phylum",nextLevelField:"kingdom"},phylum:{fieldName:"kingdom",nextCollection:"kingdom",nextLevelField:"domain"},kingdom:{fieldName:"domain",nextCollection:"domain",nextLevelField:null}};let t="genus",l=e,i=0;const m=10;for(;i<m;){i++,console.log(`
↑ STEP ${i}: Current level="${t}"`);const d=n[t];if(!d){console.log(`  ⚠️ No mapping found for level "${t}" - stopping traversal`);break}const a=d.fieldName,y=l[a];if(!y){console.log(`  ℹ️ No ${a} field or it's empty on ${t} - reached end of hierarchy`);break}console.log(`  → Found ${a} ID: ${y}`);try{const u=d.nextCollection;console.log(`  📍 Fetching ${u} record...`);const f=await c.collection(u).getOne(y,{requestKey:null}),p=f.name;switch(console.log(`  ✓ Found: ${u}="${p}"`),u){case"family":s.family=p,console.log(`      Set hierarchy.family = "${p}"`);break;case"order":s.order=p,console.log(`      Set hierarchy.order = "${p}"`);break;case"class":s.klass=p,console.log(`      Set hierarchy.klass = "${p}"`);break;case"phylum":s.phylum=p,console.log(`      Set hierarchy.phylum = "${p}"`);break;case"kingdom":s.kingdom=p,console.log(`      Set hierarchy.kingdom = "${p}"`);break;case"domain":s.domain=p,console.log(`      Set hierarchy.domain = "${p}"`);break}l=f,t=u}catch(u){console.error(`  ✗ Error fetching ${d.nextCollection}:`,u);break}}return i>=m&&console.warn("⚠️  Reached max traversal limit!"),console.log(`
✅ FINAL HIERARCHY:`,s),s}catch(s){return console.error("❌ CRITICAL ERROR in fetchTaxonomyHierarchy:",s),{}}},U=async()=>{const r="taxonomyOptions",o=E(r);if(o)return o;try{console.log("📚 Fetching all taxonomy options from database...");const[s,e,n,t,l,i,m]=await Promise.all([c.collection("domain").getFullList({requestKey:null}),c.collection("kingdom").getFullList({requestKey:null}),c.collection("phylum").getFullList({requestKey:null}),c.collection("class").getFullList({requestKey:null}),c.collection("order").getFullList({requestKey:null}),c.collection("family").getFullList({requestKey:null}),c.collection("genus").getFullList({requestKey:null})]),d={domain:s.map(a=>a.name).filter(Boolean).sort(),kingdom:e.map(a=>a.name).filter(Boolean).sort(),phylum:n.map(a=>a.name).filter(Boolean).sort(),klass:t.map(a=>a.name).filter(Boolean).sort(),order:l.map(a=>a.name).filter(Boolean).sort(),family:i.map(a=>a.name).filter(Boolean).sort(),genus:m.map(a=>a.name).filter(Boolean).sort()};return console.log("✅ Taxonomy options loaded:",{domain:d.domain.length,kingdom:d.kingdom.length,phylum:d.phylum.length,klass:d.klass.length,order:d.order.length,family:d.family.length,genus:d.genus.length}),q(r,d),d}catch(s){return console.error("❌ Error fetching taxonomy options:",s),{domain:[],kingdom:[],phylum:[],klass:[],order:[],family:[],genus:[]}}},Q=async()=>{const r="allPlants",o=E(r);if(o)return o;try{const s=await c.collection("species").getFullList({expand:"genus,genus.family,genus.family.order,genus.family.order.class,genus.family.order.class.phylum,genus.family.order.class.phylum.kingdom,genus.family.order.class.phylum.kingdom.domain",requestKey:null});console.log("📦 Fetched",s.length,"species records");const e=[];for(const n of s){e.length===0&&(console.log("🔍 FIRST RECORD DEBUG - Raw Fields:",{id:n.id,genus:n.genus,scientificName:n.scientificName,commonName:n.commonName,author:n.author,year:n.year,conservationStatus:n.conservationStatus,notes:n.notes,allKeys:Object.keys(n).filter(g=>!g.startsWith("created")&&!g.startsWith("updated")&&!g.includes("expand"))}),console.log("🔍 Expand structure:",{hasGenus:!!n.expand?.genus,genusName:n.expand?.genus?.name,hasFamily:!!n.expand?.genus?.expand?.family,familyName:n.expand?.genus?.expand?.family?.name,hasOrder:!!n.expand?.genus?.expand?.family?.expand?.order,hasClass:!!n.expand?.genus?.expand?.family?.expand?.order?.expand?.class}));let t="";n.field?t=`https://jpg-services.nddu.edu.ph/pb-biosoc/api/files/species/${n.id}/${n.field}`:n.image&&(t=`https://jpg-services.nddu.edu.ph/pb-biosoc/api/files/species/${n.id}/${n.image}`);let l="",i="",m="",d="",a="",y="",u="",f="";if(n.expand?.genus){const g=Array.isArray(n.expand.genus)?n.expand.genus[0]:n.expand.genus;if(l=g?.name||"",i=g?.id||"",console.log("✓ Found genus:",l),g?.expand?.family){const x=Array.isArray(g.expand.family)?g.expand.family[0]:g.expand.family;if(m=x?.name||"",console.log("✓ Found family:",m),x?.expand?.order){const w=Array.isArray(x.expand.order)?x.expand.order[0]:x.expand.order;if(d=w?.name||"",console.log("✓ Found order:",d),w?.expand?.class){const b=Array.isArray(w.expand.class)?w.expand.class[0]:w.expand.class;if(a=b?.name||"",console.log("✓ Found class:",a),b?.expand?.phylum){const k=Array.isArray(b.expand.phylum)?b.expand.phylum[0]:b.expand.phylum;if(y=k?.name||"",console.log("✓ Found phylum:",y),k?.expand?.kingdom){const h=Array.isArray(k.expand.kingdom)?k.expand.kingdom[0]:k.expand.kingdom;u=h?.name||"",console.log("✓ Found kingdom:",u),console.log("  Kingdom record expand keys:",Object.keys(h?.expand||{})),console.log("  Kingdom record all fields:",Object.keys(h||{}).filter(v=>!v.startsWith("created")&&!v.startsWith("updated"))),h?.expand?.domain?(f=(Array.isArray(h.expand.domain)?h.expand.domain[0]:h.expand.domain)?.name||"",console.log("✓ Found domain from expand:",f)):console.log("ℹ️ Domain not expanded, will use empty value")}}}}}}const p={id:n.id,commonName:n.commonName||"Unknown",scientificName:n.scientificName||"",image:t,genus:l,genusId:i,author:n.author||"",year:n.year||null,conservationStatus:n.conservationStatus||"",notes:n.notes||"",field:n.field||"",domain:f,kingdom:u,phylum:y,klass:a,order:d,family:m,species:n.species||"",morphology:n.morphology||"",ecology:n.ecology||"",distribution:n.distribution||"",uses:n.uses||"",description:n.description||""};e.push(p),console.log("✅ Added plant:",p.commonName,"| Taxonomy:",{domain:p.domain,kingdom:p.kingdom,phylum:p.phylum,klass:p.klass,order:p.order,family:p.family,genus:p.genus})}if(console.log("✅ Plants list loaded:",e.length,"items"),e.length>0){console.log("🔍 First plant full data:",e[0]);const n=["domain","kingdom","phylum","klass","order","family","genus"],t={},l={};n.forEach(i=>{t[i]=new Set,l[i]=[],e.forEach(m=>{const d=m[i];d&&typeof d=="string"&&d.trim()?t[i].add(d):l[i].length<3&&l[i].push(m.commonName)})}),console.log("🔍 Available taxonomy filter options:",Object.fromEntries(Object.entries(t).map(([i,m])=>[i,Array.from(m).length]))),console.log("📋 Full available options by level:",Object.fromEntries(Object.entries(t).map(([i,m])=>[i,Array.from(m).sort()]))),console.log("⚠️ Plants missing taxonomy by level:",Object.fromEntries(Object.entries(l).map(([i,m])=>[i,m.length>0?m:"None"])))}return q(r,e),e}catch(s){return s instanceof Error&&!s.message.includes("aborted")&&console.error("Error fetching plants:",s),[]}},K=async r=>{const o=`plant_${r}`,s=E(o);if(s)return s;try{const e=await c.collection("species").getOne(r,{expand:"genus_id,genus_id.family,genus_id.family.order,genus_id.family.order.class,genus_id.family.order.class.phylum,genus_id.family.order.class.phylum.kingdom,genus_id.family.order.class.phylum.kingdom.domain",requestKey:null});console.log("📌 Fetching plant:",e.id);let n="";e.field?n=`https://jpg-services.nddu.edu.ph/pb-biosoc/api/files/species/${e.id}/${e.field}`:e.image&&(n=`https://jpg-services.nddu.edu.ph/pb-biosoc/api/files/species/${e.id}/${e.image}`);let t=e.genus||"",l=e.genus_id||"",i={domain:e.domain||"",kingdom:e.kingdom||"",phylum:e.phylum||"",klass:e.klass||"",order:e.order||"",family:e.family||""};if(e.expand?.genus_id&&l){const d=Array.isArray(e.expand.genus_id)?e.expand.genus_id[0]:e.expand.genus_id;if(d){t=d.name||t,l=d.id||l;try{console.log("📍 Fetching hierarchy for genus:",l);const a=await S(l);console.log("✓ Hierarchy retrieved:",a),i={domain:a.domain||e.domain||"",kingdom:a.kingdom||e.kingdom||"",phylum:a.phylum||e.phylum||"",klass:a.klass||e.klass||"",order:a.order||e.order||"",family:a.family||e.family||""}}catch{console.warn("⚠️ Failed to fetch hierarchy for genus",t)}}}const m={id:e.id,commonName:e.commonName||e.name||"Unknown",scientificName:e.scientificName||"",image:n,genus:t,genusId:l,author:e.author||"",year:e.year||null,conservationStatus:e.conservationStatus||"",notes:e.notes||"",field:e.field||"",domain:i.domain,kingdom:i.kingdom,phylum:i.phylum,klass:i.klass,order:i.order,family:i.family,species:e.species||"",morphology:e.morphology||"",ecology:e.ecology||"",distribution:e.distribution||"",uses:e.uses||"",description:e.description||""};return console.log("✅ Plant loaded:",m.commonName,"| Taxonomy:",{domain:m.domain,kingdom:m.kingdom,family:m.family}),q(o,m),m}catch(e){return e instanceof Error&&!e.message.includes("aborted")&&console.error("Error fetching plant:",e),null}},_="https://flora.nddu.edu.ph",C=r=>`${_}/discover/plants/${r}`,L=async r=>{const{plantId:o,errorCorrectionLevel:s="H",width:e=300,margin:n=2,color:t={dark:"#2d5016",light:"#ffffff"}}=r,l=C(o);try{return await F.toDataURL(l,{errorCorrectionLevel:s,type:"image/png",width:e,margin:n,color:t})}catch(i){throw console.error("Error generating QR code:",i),new Error("Failed to generate QR code")}},O=async(r,o)=>{try{const e=await L({plantId:r,width:400,margin:2,color:{dark:"#2d5016",light:"#ffffff"}}),n=document.createElement("a");n.href=e,n.download=`${o}_QR_Code.png`,document.body.appendChild(n),n.click(),document.body.removeChild(n)}catch(s){throw console.error("Error downloading QR code:",s),new Error("Failed to download QR code")}},N=async r=>{const{plantId:o,errorCorrectionLevel:s="H",width:e=300,margin:n=2,color:t={dark:"#2d5016",light:"#ffffff"}}=r,l=C(o);return new Promise((i,m)=>{F.toDataURL(l,{errorCorrectionLevel:s,type:"image/png",width:e,margin:n,color:t}).then(d=>{fetch(d).then(a=>a.blob()).then(a=>i(a)).catch(m)}).catch(m)})},B=async(r,o,s)=>{try{const n=await L({plantId:r,width:400,margin:2,color:{dark:"#2d5016",light:"#ffffff"}}),t=window.open("","","width=800,height=600");if(!t)throw new Error("Failed to open print window");const l=`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${o} - QR Code</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: white;
              padding: 40px 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            
            .container {
              background: white;
              border: 2px solid #2d5016;
              border-radius: 12px;
              padding: 40px;
              max-width: 600px;
              width: 100%;
              text-align: center;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            
            .header {
              margin-bottom: 30px;
              border-bottom: 2px solid #f0f0f0;
              padding-bottom: 20px;
            }
            
            .plant-name {
              font-size: 28px;
              font-weight: 700;
              color: #2d5016;
              margin-bottom: 8px;
            }
            
            .scientific-name {
              font-size: 16px;
              font-style: italic;
              color: #666;
              margin-bottom: 0;
            }
            
            .qr-section {
              margin: 30px 0;
              padding: 20px 0;
              border-bottom: 2px solid #f0f0f0;
            }
            
            .qr-code-img {
              width: 320px;
              height: 320px;
              border: 3px solid #2d5016;
              border-radius: 8px;
              margin: 0 auto;
              display: block;
            }
            
            .guide-text {
              margin: 30px 0;
              padding: 20px;
              background-color: #f9f9f9;
              border-left: 6px solid #2d5016;
              border-radius: 6px;
              font-size: 14px;
              color: #555;
              line-height: 1.6;
              text-align: center;
            }
            
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #f0f0f0;
              font-size: 12px;
              color: #999;
            }
            
            @media print {
              body {
                padding: 0;
                background: white;
              }
              
              .container {
                border: 1px solid #ddd;
                box-shadow: none;
                max-width: 100%;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="plant-name">${o}</div>
              <div class="scientific-name">${s||"N/A"}</div>
            </div>
            
            <div class="qr-section">
              <img src="${n}" alt="Plant QR Code" class="qr-code-img" />
            </div>
            
            <div class="guide-text">
              Works with: Android Camera, iOS Camera & All QR Scanners
            </div>
            
            <div class="footer">
              <p>Scan this QR code to view plant details online</p>
              <p>Powered by Bio-Soc App</p>
            </div>
          </div>
        </body>
      </html>
    `;t.document.write(l),t.document.close(),t.onload=()=>{t.print()}}catch(e){throw console.error("Error printing QR code:",e),new Error("Failed to print QR code")}};async function $(r,o){try{console.log("🔄 Syncing details for plant:",r);const s=await c.collection("details").getList(1,1,{filter:`species = "${r}"`,requestKey:null});if(s.items&&s.items.length>0){const e=s.items[0].id;return console.log("📝 Updating existing details record:",e),await c.collection("details").update(e,{...o,species:r}),console.log("✓ Details updated successfully:",e),e}else{console.log("✨ Creating new details record for plant:",r);const e=await c.collection("details").create({species:r,...o});return console.log("✓ Details created successfully:",e.id),e.id}}catch(s){throw console.warn("⚠️  Error syncing plant details:",s),s}}async function I(){try{const r=await c.collection("species").getFullList({requestKey:null});return console.log(`📥 Fetched ${r.length} plants from species collection`),await Promise.all(r.map(async s=>{try{const e=await c.collection("details").getList(1,1,{filter:`species = "${s.id}"`,requestKey:null});if(e.items&&e.items.length>0){const n=e.items[0];return console.log(`✓ Details loaded for plant ${s.commonName} (${s.id}):`,{morphology:n.morphology?`${n.morphology.substring(0,30)}...`:"empty",ecology:n.ecology?`${n.ecology.substring(0,30)}...`:"empty",distribution:n.distribution?`${n.distribution.substring(0,30)}...`:"empty",uses:n.uses?`${n.uses.substring(0,30)}...`:"empty"}),{...s,morphology:n.morphology||"",ecology:n.ecology||"",distribution:n.distribution||"",uses:n.uses||""}}else return console.log(`ℹ️  No details record found for plant ${s.commonName} (${s.id})`),s}catch(e){return console.warn(`⚠️  Error loading details for plant ${s.id}:`,e?.message),s}}))}catch(r){return r instanceof Error&&!r.message.includes("aborted")&&console.error("Error fetching plants from species:",r),[]}}async function T(r,o){try{const s=new FormData;s.append("commonName",r.commonName||""),s.append("scientificName",r.scientificName||""),s.append("description",r.description||r.commonName||""),s.append("genus",r.genus||""),s.append("author",r.author||""),s.append("year",String(r.year||"")),s.append("conservationStatus",r.conservationStatus||""),s.append("notes",r.notes||""),s.append("kingdom",r.kingdom||""),s.append("phylum",r.phylum||""),s.append("klass",r.klass||""),s.append("order",r.order||""),s.append("family",r.family||""),s.append("species",r.species||""),s.append("morphology",r.morphology||""),s.append("ecology",r.ecology||""),s.append("distribution",r.distribution||""),s.append("uses",r.uses||""),s.append("phylum_id",String(r.phylum_id||1)),o&&(s.append("field",o,o.name),console.log("📸 Uploading image file:",o.name));const e=await c.collection("species").create(s);console.log("✓ Plant created successfully in species:",e);try{const n=await $(e.id,{morphology:r.morphology||"",ecology:r.ecology||"",distribution:r.distribution||"",uses:r.uses||""});console.log("✓ Plant created with details:",{plantId:e.id,detailsId:n})}catch(n){console.warn("⚠️  Details creation failed, but plant was created:",n)}try{const n=await N({plantId:e.id,width:400,margin:2}),t=new FormData;t.append("qr_code",n,`${e.id}_qr.png`);const l=await c.collection("species").update(e.id,t);return console.log("✓ QR code generated and saved:",l),l}catch(n){return console.warn("Warning: QR code generation failed, but plant was created:",n),e}}catch(s){throw console.error("Error creating plant:",s),s}}async function j(r,o,s){try{if(s){const e=new FormData;e.append("commonName",o.commonName||""),e.append("scientificName",o.scientificName||""),e.append("description",o.description||o.commonName||""),e.append("genus",o.genus||""),e.append("author",o.author||""),e.append("year",String(o.year||"")),e.append("conservationStatus",o.conservationStatus||""),e.append("notes",o.notes||""),e.append("kingdom",o.kingdom||""),e.append("phylum",o.phylum||""),e.append("klass",o.klass||""),e.append("order",o.order||""),e.append("family",o.family||""),e.append("species",o.species||""),e.append("morphology",o.morphology||""),e.append("ecology",o.ecology||""),e.append("distribution",o.distribution||""),e.append("uses",o.uses||""),e.append("phylum_id",String(o.phylum_id||1)),e.append("field",s,s.name),console.log("📸 Uploading image file for update:",s.name);const n=await c.collection("species").update(r,e);console.log("✓ Plant updated successfully in species:",n);try{await $(r,{morphology:o.morphology||"",ecology:o.ecology||"",distribution:o.distribution||"",uses:o.uses||""})}catch(t){console.warn("⚠️  Details sync failed:",t)}try{const t=await N({plantId:n.id,width:400,margin:2}),l=new FormData;return l.append("qr_code",t,`${n.id}_qr.png`),await c.collection("species").update(n.id,l)}catch(t){return console.warn("Warning: QR code regeneration failed:",t),n}}else{const e={commonName:o.commonName||"",scientificName:o.scientificName||"",description:o.description||o.commonName||"",genus:o.genus||"",author:o.author||"",year:o.year||null,conservationStatus:o.conservationStatus||"",notes:o.notes||"",kingdom:o.kingdom||"",phylum:o.phylum||"",klass:o.klass||"",order:o.order||"",family:o.family||"",species:o.species||"",morphology:o.morphology||"",ecology:o.ecology||"",distribution:o.distribution||"",uses:o.uses||"",phylum_id:Number(o.phylum_id)||1},n=await c.collection("species").update(r,e);console.log("✓ Plant updated successfully in species:",n);try{await $(r,{morphology:o.morphology||"",ecology:o.ecology||"",distribution:o.distribution||"",uses:o.uses||""})}catch(t){console.warn("⚠️  Details sync failed:",t)}try{const t=await N({plantId:n.id,width:400,margin:2}),l=new FormData;return l.append("qr_code",t,`${n.id}_qr.png`),await c.collection("species").update(n.id,l)}catch(t){return console.warn("Warning: QR code regeneration failed:",t),n}}}catch(e){throw console.error("Error updating plant:",e),e}}async function W(r){try{const o=await c.collection("details").getList(1,50,{filter:`species = "${r}"`,requestKey:null});if(o.items&&o.items.length>0)for(const s of o.items)await c.collection("details").delete(s.id),console.log("✓ Plant details deleted:",s.id);await c.collection("species").delete(r),console.log("✓ Plant deleted successfully from species")}catch(o){throw console.error("Error deleting plant:",o),o}}async function H(){try{return(await c.collection("users").getList(1,500,{requestKey:null})).items}catch(r){return console.error("Error fetching users:",r),[]}}async function G(r,o){try{return await c.collection("users").update(r,{role:o})}catch(s){throw console.error("Error updating user role:",s),s}}async function z(r){try{await c.collection("users").delete(r)}catch(o){throw console.error("Error deleting user:",o),o}}async function M(){try{const o=(await c.collection("species").getList(1,1,{requestKey:null})).totalItems,s=await c.collection("users").getList(1,500,{requestKey:null}),e=s.totalItems,n=s.items.filter(t=>t.verified===!0).length;return{totalPlants:o,totalUsers:e,verifiedUsers:n}}catch(r){return console.error("Error fetching analytics:",r),{totalPlants:0,totalUsers:0,verifiedUsers:0}}}export{L as a,W as b,T as c,O as d,H as e,S as f,I as g,G as h,z as i,M as j,Q as k,U as l,K as m,B as p,j as u};
