---
layout: default
title: "Add Your Board Game Club to Our UK Directory"
description: "Submit your board game club to Board Game Clubs UK. Our free, community-maintained directory helps people find board game clubs near them across the UK."
permalink: /contribute/
---

<div class="content-page" markdown="1">

# Add Your Board Game Club

Board Game Clubs UK is community-maintained. Anyone can add a new club or update existing information by submitting a pull request on GitHub.

## Step-by-Step Guide

### 1. Create a new file

Create a new file in the `_clubs/` folder. Name it using the format `your-club-name.md` (lowercase, hyphens instead of spaces).

### 2. Copy this template

Paste the following into your new file and fill in the details:

```yaml
---
name: "Your Club Name"
day: "Thursday"
secondary_days: []
time: "7:00pm - 10:00pm"
frequency: "Weekly"
location:
  name: "Venue Name"
  address: "Full Address, Town, Postcode"
  lat: 53.0000
  lng: -1.0000
cost: "Free"
image: ""
website: ""
facebook: ""
description: >-
  A short description of your club. What games do you play?
  Are newcomers welcome? Any other useful info.
---
```

### 3. Fill in the details

- **name**: Your club's full name
- **day**: The primary day you meet (Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, or Sunday)
- **secondary_days**: If you meet on additional days, list them like `["Friday", "Sunday"]`
- **time**: When you meet, e.g. "7:00pm - 10:00pm"
- **frequency**: How often — accepted values: "Weekly", "Fortnightly", or "Monthly" (title-cased)
- **location**: Venue name, full address, and coordinates
- **cost**: Entry fee as a currency value (e.g. "£2", "£2.50") or "Free"
- **image**: A photo of your club — either a URL (e.g. `"https://example.com/photo.jpg"`) or a filename if you add the image to `assets/images/clubs/` (e.g. `"my-club.jpg"`)
- **website** / **facebook**: Links to your club's web presence

### 4. Find your coordinates

To get the latitude and longitude for your venue:

1. Go to [OpenStreetMap](https://www.openstreetmap.org)
2. Search for your venue's address
3. Right-click on the map and select "Show address"
4. The coordinates will appear in the URL bar (lat and lng)

### 5. Submit a pull request

Commit your file and open a pull request. We'll review it and merge it in.

## Updating an Existing Club

Find the club's file in the `_clubs/` folder, make your changes, and submit a pull request.

## Need Help?

If you're not familiar with GitHub, you can [open an issue](https://github.com) with your club's details and we'll add it for you.

</div>
