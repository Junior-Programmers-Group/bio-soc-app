# Introduction

**Flora Database** (formerly the Eco-Tagging Project) is a web-based plant database for the campus of Notre Dame of Dadiangas University (NDDU). It makes the plant species found on campus easy to look up and learn about, using QR codes placed on physical plant tags.

The system is a collaboration between two groups. **BioSociety (BioSoc)** handles species identification, ecological research and physical tagging. The **Junior Programmers Group (JPG)** builds and maintains the digital platform.

## What it does

**For visitors** (students, teachers and the community, no account needed):
- Scan a plant's QR code, or upload a photo of it, to open that plant's profile.
- Browse the plant directory, search by common or scientific name, and filter or sort by taxonomic group.
- Read each plant's profile: scientific classification (domain down to genus), morphology, ecology, distribution, uses and conservation status.
- Learn about the project, its purpose, the campus location and its partners on the homepage.

**For administrators** (BioSoc and JPG team members, with a login):
- Add, edit and delete plant species, including photos and descriptive details.
- Have a unique QR code generated for each species, ready to download or print for tagging.
- Manage the taxonomy records that plants are classified under.
- Manage user accounts and view basic usage counts.

## How it is built

Flora is a single-page web application built with React, TypeScript and Vite. It stores its data, images, QR code files and user accounts in a hosted PocketBase database, which the app reaches directly over the internet. Plants are organized in a strict classification chain (Domain, Kingdom, Phylum, Class, Order, Family, Genus, Species), with a separate details record holding each plant's descriptive text.

## Purpose

The project aims to promote environmental literacy and biodiversity awareness on campus by combining physical tagging with an accessible digital record, so that anyone can learn about the plants around them by scanning a code.

## About this documentation

This document set describes the system as built, following the standard workflow guide:

1. Use case diagram: what the system must do
2. ER diagram: what data is stored
3. Code component diagram: how the code is structured
4. Validation: whether the design holds up in practice
