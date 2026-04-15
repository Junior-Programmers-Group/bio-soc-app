import{p as c}from"./backend-CXBYh2AR.js";import{Q as q}from"./vendor-other-Bu-56mpB.js";const R=new Map,D=300*1e3,E=s=>{const o=R.get(s);return o&&Date.now()-o.timestamp<D?(console.log("📦 Using cached data for:",s),o.data):(R.delete(s),null)},F=(s,o)=>{R.set(s,{data:o,timestamp:Date.now()}),console.log("💾 Cached request:",s)},S=async(s,o)=>{try{if(console.log("🔍 fetchTaxonomyHierarchy called with genusIdOrName:",s,"optionalFamilyId:",o),!s&&!o)return console.warn("⚠️  No genusIdOrName or familyId provided"),{};const t={};console.log("📍 Fetching Genus record:",s);let e=await c.collection("genus").getOne(s,{requestKey:null});t.genus=e.name,console.log("✓ Genus found:",e.name),console.log("  Genus fields:",Object.keys(e)),console.log("  Genus has 'family' field?:",e.family);const n={genus:{fieldName:"family",nextCollection:"family",nextLevelField:"order"},family:{fieldName:"order",nextCollection:"order",nextLevelField:"class"},order:{fieldName:"class",nextCollection:"class",nextLevelField:"phylum"},class:{fieldName:"phylum",nextCollection:"phylum",nextLevelField:"kingdom"},phylum:{fieldName:"kingdom",nextCollection:"kingdom",nextLevelField:"domain"},kingdom:{fieldName:"domain",nextCollection:"domain",nextLevelField:null}};let r="genus",l=e,i=0;const m=10;for(;i<m;){i++,console.log(`
↑ STEP ${i}: Current level="${r}"`);const d=n[r];if(!d){console.log(`  ⚠️ No mapping found for level "${r}" - stopping traversal`);break}const a=d.fieldName,f=l[a];if(!f){console.log(`  ℹ️ No ${a} field or it's empty on ${r} - reached end of hierarchy`);break}console.log(`  → Found ${a} ID: ${f}`);try{const u=d.nextCollection;console.log(`  📍 Fetching ${u} record...`);const h=await c.collection(u).getOne(f,{requestKey:null}),p=h.name;switch(console.log(`  ✓ Found: ${u}="${p}"`),u){case"family":t.family=p,console.log(`      Set hierarchy.family = "${p}"`);break;case"order":t.order=p,console.log(`      Set hierarchy.order = "${p}"`);break;case"class":t.klass=p,console.log(`      Set hierarchy.klass = "${p}"`);break;case"phylum":t.phylum=p,console.log(`      Set hierarchy.phylum = "${p}"`);break;case"kingdom":t.kingdom=p,console.log(`      Set hierarchy.kingdom = "${p}"`);break;case"domain":t.domain=p,console.log(`      Set hierarchy.domain = "${p}"`);break}l=h,r=u}catch(u){console.error(`  ✗ Error fetching ${d.nextCollection}:`,u);break}}return i>=m&&console.warn("⚠️  Reached max traversal limit!"),console.log(`
✅ FINAL HIERARCHY:`,t),t}catch(t){return console.error("❌ CRITICAL ERROR in fetchTaxonomyHierarchy:",t),{}}},K=async()=>{const s="taxonomyOptions",o=E(s);if(o)return o;try{console.log("📚 Fetching all taxonomy options from database...");const[t,e,n,r,l,i,m]=await Promise.all([c.collection("domain").getFullList({requestKey:null}),c.collection("kingdom").getFullList({requestKey:null}),c.collection("phylum").getFullList({requestKey:null}),c.collection("class").getFullList({requestKey:null}),c.collection("order").getFullList({requestKey:null}),c.collection("family").getFullList({requestKey:null}),c.collection("genus").getFullList({requestKey:null})]),d={domain:t.map(a=>a.name).filter(Boolean).sort(),kingdom:e.map(a=>a.name).filter(Boolean).sort(),phylum:n.map(a=>a.name).filter(Boolean).sort(),klass:r.map(a=>a.name).filter(Boolean).sort(),order:l.map(a=>a.name).filter(Boolean).sort(),family:i.map(a=>a.name).filter(Boolean).sort(),genus:m.map(a=>a.name).filter(Boolean).sort()};return console.log("✅ Taxonomy options loaded:",{domain:d.domain.length,kingdom:d.kingdom.length,phylum:d.phylum.length,klass:d.klass.length,order:d.order.length,family:d.family.length,genus:d.genus.length}),F(s,d),d}catch(t){return console.error("❌ Error fetching taxonomy options:",t),{domain:[],kingdom:[],phylum:[],klass:[],order:[],family:[],genus:[]}}},Q=async()=>{const s="allPlants",o=E(s);if(o)return o;try{const t=await c.collection("species").getFullList({expand:"genus,genus.family,genus.family.order,genus.family.order.class,genus.family.order.class.phylum,genus.family.order.class.phylum.kingdom,genus.family.order.class.phylum.kingdom.domain",requestKey:null});console.log("📦 Fetched",t.length,"species records");const e=[];for(const n of t){e.length===0&&(console.log("🔍 FIRST RECORD DEBUG - Raw Fields:",{id:n.id,genus:n.genus,scientificName:n.scientificName,commonName:n.commonName,author:n.author,year:n.year,conservationStatus:n.conservationStatus,notes:n.notes,allKeys:Object.keys(n).filter(y=>!y.startsWith("created")&&!y.startsWith("updated")&&!y.includes("expand"))}),console.log("🔍 Expand structure:",{hasGenus:!!n.expand?.genus,genusName:n.expand?.genus?.name,hasFamily:!!n.expand?.genus?.expand?.family,familyName:n.expand?.genus?.expand?.family?.name,hasOrder:!!n.expand?.genus?.expand?.family?.expand?.order,hasClass:!!n.expand?.genus?.expand?.family?.expand?.order?.expand?.class}));let r="";n.field?r=`https://jpg-services.nddu.edu.ph/pb-biosoc/api/files/species/${n.id}/${n.field}`:n.image&&(r=`https://jpg-services.nddu.edu.ph/pb-biosoc/api/files/species/${n.id}/${n.image}`);let l="",i="",m="",d="",a="",f="",u="",h="";if(n.expand?.genus){const y=Array.isArray(n.expand.genus)?n.expand.genus[0]:n.expand.genus;if(l=y?.name||"",i=y?.id||"",console.log("✓ Found genus:",l),y?.expand?.family){const w=Array.isArray(y.expand.family)?y.expand.family[0]:y.expand.family;if(m=w?.name||"",console.log("✓ Found family:",m),w?.expand?.order){const b=Array.isArray(w.expand.order)?w.expand.order[0]:w.expand.order;if(d=b?.name||"",console.log("✓ Found order:",d),b?.expand?.class){const k=Array.isArray(b.expand.class)?b.expand.class[0]:b.expand.class;if(a=k?.name||"",console.log("✓ Found class:",a),k?.expand?.phylum){const v=Array.isArray(k.expand.phylum)?k.expand.phylum[0]:k.expand.phylum;if(f=v?.name||"",console.log("✓ Found phylum:",f),v?.expand?.kingdom){const g=Array.isArray(v.expand.kingdom)?v.expand.kingdom[0]:v.expand.kingdom;if(u=g?.name||"",console.log("✓ Found kingdom:",u),console.log("  Kingdom record expand keys:",Object.keys(g?.expand||{})),console.log("  Kingdom record all fields:",Object.keys(g||{}).filter(x=>!x.startsWith("created")&&!x.startsWith("updated"))),g?.expand?.domain)h=(Array.isArray(g.expand.domain)?g.expand.domain[0]:g.expand.domain)?.name||"",console.log("✓ Found domain from expand:",h);else if(console.warn("⚠️ Domain not in expand. Kingdom has domain field?:",g?.domain),g?.domain&&typeof g.domain=="string")try{h=(await c.collection("domain").getOne(g.domain,{requestKey:null})).name||"",console.log("✓ Found domain via fallback fetch:",h)}catch(x){console.error("⚠️ Failed to fetch domain:",x)}}}}}}}const p={id:n.id,commonName:n.commonName||"Unknown",scientificName:n.scientificName||"",image:r,genus:l,genusId:i,author:n.author||"",year:n.year||null,conservationStatus:n.conservationStatus||"",notes:n.notes||"",field:n.field||"",domain:h,kingdom:u,phylum:f,klass:a,order:d,family:m,species:n.species||"",morphology:n.morphology||"",ecology:n.ecology||"",distribution:n.distribution||"",uses:n.uses||"",description:n.description||""};e.push(p),console.log("✅ Added plant:",p.commonName,"| Taxonomy:",{domain:p.domain,kingdom:p.kingdom,phylum:p.phylum,klass:p.klass,order:p.order,family:p.family,genus:p.genus})}if(console.log("✅ Plants list loaded:",e.length,"items"),e.length>0){console.log("🔍 First plant full data:",e[0]);const n=["domain","kingdom","phylum","klass","order","family","genus"],r={},l={};n.forEach(i=>{r[i]=new Set,l[i]=[],e.forEach(m=>{const d=m[i];d&&typeof d=="string"&&d.trim()?r[i].add(d):l[i].length<3&&l[i].push(m.commonName)})}),console.log("🔍 Available taxonomy filter options:",Object.fromEntries(Object.entries(r).map(([i,m])=>[i,Array.from(m).length]))),console.log("📋 Full available options by level:",Object.fromEntries(Object.entries(r).map(([i,m])=>[i,Array.from(m).sort()]))),console.log("⚠️ Plants missing taxonomy by level:",Object.fromEntries(Object.entries(l).map(([i,m])=>[i,m.length>0?m:"None"])))}return F(s,e),e}catch(t){return t instanceof Error&&!t.message.includes("aborted")&&console.error("Error fetching plants:",t),[]}},_=async s=>{const o=`plant_${s}`,t=E(o);if(t)return t;try{const e=await c.collection("species").getOne(s,{expand:"genus_id",requestKey:null});console.log("📌 Fetching plant:",e.id);let n="";e.field?n=`https://jpg-services.nddu.edu.ph/pb-biosoc/api/files/species/${e.id}/${e.field}`:e.image&&(n=`https://jpg-services.nddu.edu.ph/pb-biosoc/api/files/species/${e.id}/${e.image}`);let r=e.genus||"",l=e.genus_id||"",i={domain:e.domain||"",kingdom:e.kingdom||"",phylum:e.phylum||"",klass:e.klass||"",order:e.order||"",family:e.family||""};if(e.expand?.genus_id&&l){const d=Array.isArray(e.expand.genus_id)?e.expand.genus_id[0]:e.expand.genus_id;if(d){r=d.name||r,l=d.id||l;try{console.log("📍 Fetching hierarchy for genus:",l);const a=await S(l);console.log("✓ Hierarchy retrieved:",a),i={domain:a.domain||e.domain||"",kingdom:a.kingdom||e.kingdom||"",phylum:a.phylum||e.phylum||"",klass:a.klass||e.klass||"",order:a.order||e.order||"",family:a.family||e.family||""}}catch{console.warn("⚠️ Failed to fetch hierarchy for genus",r)}}}const m={id:e.id,commonName:e.commonName||e.name||"Unknown",scientificName:e.scientificName||"",image:n,genus:r,genusId:l,author:e.author||"",year:e.year||null,conservationStatus:e.conservationStatus||"",notes:e.notes||"",field:e.field||"",domain:i.domain,kingdom:i.kingdom,phylum:i.phylum,klass:i.klass,order:i.order,family:i.family,species:e.species||"",morphology:e.morphology||"",ecology:e.ecology||"",distribution:e.distribution||"",uses:e.uses||"",description:e.description||""};return console.log("✅ Plant loaded:",m.commonName,"| Taxonomy:",{domain:m.domain,kingdom:m.kingdom,family:m.family}),F(o,m),m}catch(e){return e instanceof Error&&!e.message.includes("aborted")&&console.error("Error fetching plant:",e),null}},A="https://bio-soc.nddu.edu.ph",C=s=>`${A}/discover/plants/${s}`,L=async s=>{const{plantId:o,errorCorrectionLevel:t="H",width:e=300,margin:n=2,color:r={dark:"#2d5016",light:"#ffffff"}}=s,l=C(o);try{return await q.toDataURL(l,{errorCorrectionLevel:t,type:"image/png",width:e,margin:n,color:r})}catch(i){throw console.error("Error generating QR code:",i),new Error("Failed to generate QR code")}},O=async(s,o)=>{try{const e=await L({plantId:s,width:400,margin:2,color:{dark:"#2d5016",light:"#ffffff"}}),n=document.createElement("a");n.href=e,n.download=`${o}_QR_Code.png`,document.body.appendChild(n),n.click(),document.body.removeChild(n)}catch(t){throw console.error("Error downloading QR code:",t),new Error("Failed to download QR code")}},N=async s=>{const{plantId:o,errorCorrectionLevel:t="H",width:e=300,margin:n=2,color:r={dark:"#2d5016",light:"#ffffff"}}=s,l=C(o);return new Promise((i,m)=>{q.toDataURL(l,{errorCorrectionLevel:t,type:"image/png",width:e,margin:n,color:r}).then(d=>{fetch(d).then(a=>a.blob()).then(a=>i(a)).catch(m)}).catch(m)})},B=async(s,o,t)=>{try{const n=await L({plantId:s,width:400,margin:2,color:{dark:"#2d5016",light:"#ffffff"}}),r=window.open("","","width=800,height=600");if(!r)throw new Error("Failed to open print window");const l=`
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
              <div class="scientific-name">${t||"N/A"}</div>
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
    `;r.document.write(l),r.document.close(),r.onload=()=>{r.print()}}catch(e){throw console.error("Error printing QR code:",e),new Error("Failed to print QR code")}};async function $(s,o){try{console.log("🔄 Syncing details for plant:",s);const t=await c.collection("details").getList(1,1,{filter:`species = "${s}"`,requestKey:null});if(t.items&&t.items.length>0){const e=t.items[0].id;return console.log("📝 Updating existing details record:",e),await c.collection("details").update(e,{...o,species:s}),console.log("✓ Details updated successfully:",e),e}else{console.log("✨ Creating new details record for plant:",s);const e=await c.collection("details").create({species:s,...o});return console.log("✓ Details created successfully:",e.id),e.id}}catch(t){throw console.warn("⚠️  Error syncing plant details:",t),t}}async function I(){try{const s=await c.collection("species").getFullList({requestKey:null});return console.log(`📥 Fetched ${s.length} plants from species collection`),await Promise.all(s.map(async t=>{try{const e=await c.collection("details").getList(1,1,{filter:`species = "${t.id}"`,requestKey:null});if(e.items&&e.items.length>0){const n=e.items[0];return console.log(`✓ Details loaded for plant ${t.commonName} (${t.id}):`,{morphology:n.morphology?`${n.morphology.substring(0,30)}...`:"empty",ecology:n.ecology?`${n.ecology.substring(0,30)}...`:"empty",distribution:n.distribution?`${n.distribution.substring(0,30)}...`:"empty",uses:n.uses?`${n.uses.substring(0,30)}...`:"empty"}),{...t,morphology:n.morphology||"",ecology:n.ecology||"",distribution:n.distribution||"",uses:n.uses||""}}else return console.log(`ℹ️  No details record found for plant ${t.commonName} (${t.id})`),t}catch(e){return console.warn(`⚠️  Error loading details for plant ${t.id}:`,e?.message),t}}))}catch(s){return s instanceof Error&&!s.message.includes("aborted")&&console.error("Error fetching plants from species:",s),[]}}async function T(s,o){try{const t=new FormData;t.append("commonName",s.commonName||""),t.append("scientificName",s.scientificName||""),t.append("description",s.description||s.commonName||""),t.append("genus",s.genus||""),t.append("author",s.author||""),t.append("year",String(s.year||"")),t.append("conservationStatus",s.conservationStatus||""),t.append("notes",s.notes||""),t.append("kingdom",s.kingdom||""),t.append("phylum",s.phylum||""),t.append("klass",s.klass||""),t.append("order",s.order||""),t.append("family",s.family||""),t.append("species",s.species||""),t.append("morphology",s.morphology||""),t.append("ecology",s.ecology||""),t.append("distribution",s.distribution||""),t.append("uses",s.uses||""),t.append("phylum_id",String(s.phylum_id||1)),o&&(t.append("field",o,o.name),console.log("📸 Uploading image file:",o.name));const e=await c.collection("species").create(t);console.log("✓ Plant created successfully in species:",e);try{const n=await $(e.id,{morphology:s.morphology||"",ecology:s.ecology||"",distribution:s.distribution||"",uses:s.uses||""});console.log("✓ Plant created with details:",{plantId:e.id,detailsId:n})}catch(n){console.warn("⚠️  Details creation failed, but plant was created:",n)}try{const n=await N({plantId:e.id,width:400,margin:2}),r=new FormData;r.append("qr_code",n,`${e.id}_qr.png`);const l=await c.collection("species").update(e.id,r);return console.log("✓ QR code generated and saved:",l),l}catch(n){return console.warn("Warning: QR code generation failed, but plant was created:",n),e}}catch(t){throw console.error("Error creating plant:",t),t}}async function j(s,o,t){try{if(t){const e=new FormData;e.append("commonName",o.commonName||""),e.append("scientificName",o.scientificName||""),e.append("description",o.description||o.commonName||""),e.append("genus",o.genus||""),e.append("author",o.author||""),e.append("year",String(o.year||"")),e.append("conservationStatus",o.conservationStatus||""),e.append("notes",o.notes||""),e.append("kingdom",o.kingdom||""),e.append("phylum",o.phylum||""),e.append("klass",o.klass||""),e.append("order",o.order||""),e.append("family",o.family||""),e.append("species",o.species||""),e.append("morphology",o.morphology||""),e.append("ecology",o.ecology||""),e.append("distribution",o.distribution||""),e.append("uses",o.uses||""),e.append("phylum_id",String(o.phylum_id||1)),e.append("field",t,t.name),console.log("📸 Uploading image file for update:",t.name);const n=await c.collection("species").update(s,e);console.log("✓ Plant updated successfully in species:",n);try{await $(s,{morphology:o.morphology||"",ecology:o.ecology||"",distribution:o.distribution||"",uses:o.uses||""})}catch(r){console.warn("⚠️  Details sync failed:",r)}try{const r=await N({plantId:n.id,width:400,margin:2}),l=new FormData;return l.append("qr_code",r,`${n.id}_qr.png`),await c.collection("species").update(n.id,l)}catch(r){return console.warn("Warning: QR code regeneration failed:",r),n}}else{const e={commonName:o.commonName||"",scientificName:o.scientificName||"",description:o.description||o.commonName||"",genus:o.genus||"",author:o.author||"",year:o.year||null,conservationStatus:o.conservationStatus||"",notes:o.notes||"",kingdom:o.kingdom||"",phylum:o.phylum||"",klass:o.klass||"",order:o.order||"",family:o.family||"",species:o.species||"",morphology:o.morphology||"",ecology:o.ecology||"",distribution:o.distribution||"",uses:o.uses||"",phylum_id:Number(o.phylum_id)||1},n=await c.collection("species").update(s,e);console.log("✓ Plant updated successfully in species:",n);try{await $(s,{morphology:o.morphology||"",ecology:o.ecology||"",distribution:o.distribution||"",uses:o.uses||""})}catch(r){console.warn("⚠️  Details sync failed:",r)}try{const r=await N({plantId:n.id,width:400,margin:2}),l=new FormData;return l.append("qr_code",r,`${n.id}_qr.png`),await c.collection("species").update(n.id,l)}catch(r){return console.warn("Warning: QR code regeneration failed:",r),n}}}catch(e){throw console.error("Error updating plant:",e),e}}async function W(s){try{const o=await c.collection("details").getList(1,50,{filter:`species = "${s}"`,requestKey:null});if(o.items&&o.items.length>0)for(const t of o.items)await c.collection("details").delete(t.id),console.log("✓ Plant details deleted:",t.id);await c.collection("species").delete(s),console.log("✓ Plant deleted successfully from species")}catch(o){throw console.error("Error deleting plant:",o),o}}async function H(){try{return(await c.collection("users").getList(1,500,{requestKey:null})).items}catch(s){return console.error("Error fetching users:",s),[]}}async function G(s,o){try{return await c.collection("users").update(s,{role:o})}catch(t){throw console.error("Error updating user role:",t),t}}async function z(s){try{await c.collection("users").delete(s)}catch(o){throw console.error("Error deleting user:",o),o}}async function M(){try{const o=(await c.collection("species").getList(1,1,{requestKey:null})).totalItems,t=await c.collection("users").getList(1,500,{requestKey:null}),e=t.totalItems,n=t.items.filter(r=>r.verified===!0).length;return{totalPlants:o,totalUsers:e,verifiedUsers:n}}catch(s){return console.error("Error fetching analytics:",s),{totalPlants:0,totalUsers:0,verifiedUsers:0}}}export{L as a,W as b,T as c,O as d,H as e,S as f,I as g,G as h,z as i,M as j,Q as k,K as l,_ as m,B as p,j as u};
