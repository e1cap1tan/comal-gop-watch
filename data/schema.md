# Data Schema Documentation

## Feed Entry Schema

All three feed files (`candidate-news.json`, `policy-feed.json`, `business-watch.json`) use the same entry schema.

### Required Fields

| Field       | Type   | Description                                      |
|-------------|--------|--------------------------------------------------|
| `id`        | string | Unique identifier (prefix: `cn-`, `pf-`, `bw-`) |
| `date`      | string | ISO 8601 datetime (e.g. `2026-02-10T12:00:00`)  |
| `title`     | string | Headline for the entry                           |
| `summary`   | string | 1-3 sentence description                        |
| `source`    | string | Name of the source (e.g. "Herald-Zeitung")       |
| `sourceUrl` | string | URL linking to the original article/post (can be external URL or internal article path like `articles/article-slug.html`) |
| `category`  | string | Category slug (see taxonomy below)               |
| `tags`      | array  | Array of tag slugs for filtering                 |

### Optional Fields

| Field              | Type   | Description                                    |
|--------------------|--------|------------------------------------------------|
| `relatedCandidate` | string | Slug of related candidate/official             |
| `imageUrl`         | string | URL or path to an associated image             |

### ID Prefixes

- `cn-` — Candidate/official news entries
- `pf-` — Policy feed entries
- `bw-` — Business watch entries

---

## Categories Taxonomy

### Candidate News (`candidate-news.json`)
- `elections` — Election filings, results, campaign updates
- `legislation` — Bills filed, votes cast, legislative activity
- `county-government` — County-level official actions and changes
- `public-statement` — Official statements, press releases

### Policy Feed (`policy-feed.json`)
- `city-council` — City council votes, ordinances, resolutions
- `county-government` — County commissioners court actions
- `education` — School board decisions, CISD policies
- `infrastructure` — Roads, utilities, development projects
- `public-safety` — Law enforcement, fire, emergency services

### Business Watch (`business-watch.json`)
- `donations` — Political campaign donations by businesses
- `endorsements` — Business or organization endorsements
- `social-stance` — Businesses taking public social/political positions
- `hiring-practices` — DEI policies, hiring practices of note

---

## Tags

Tags are free-form slugs (lowercase, hyphenated). Common tags include:

- Geographic: `new-braunfels`, `gruene`, `comal-county`
- Topic: `2026-election`, `transportation`, `budget`, `parental-rights`
- Entity: `chamber-of-commerce`, `comal-isd`, `commissioners-court`
- Person: `neal-linnartz`, `carrie-isaac`, `donna-campbell`

---

## Officials Schema (`officials.json`)

Structured data for all tracked candidates and officials.

### Mayoral Candidate

| Field       | Type    | Description                    |
|-------------|---------|--------------------------------|
| `name`      | string  | Full name                      |
| `slug`      | string  | URL-safe identifier            |
| `status`    | string  | "Incumbent" or "Candidate"     |
| `incumbent` | boolean | Whether currently in office    |
| `photo`     | string  | (optional) Path to photo       |

### Current Official

| Field   | Type   | Description                        |
|---------|--------|------------------------------------|
| `title` | string | Office title                       |
| `name`  | string | Full name                          |
| `slug`  | string | URL-safe identifier                |
| `term`  | string | Term dates or status               |
| `group` | string | `city`, `county`, or `state`       |
| `photo` | string | (optional) Path to photo           |

---

## Adding New Entries

1. Open the relevant JSON file in `data/`
2. Add a new object to the beginning of the array (newest first)
3. Use the next sequential ID (e.g. `cn-004`)
4. Use ISO datetime with `T12:00:00` suffix to avoid timezone issues
5. Run `npm test` to validate
