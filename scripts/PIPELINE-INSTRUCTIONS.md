# Content Pipeline Instructions for Articles and External Content

## Critical Rule: Always Use Specific Article URLs

**NEVER use generic homepage URLs for external articles.** Always find the specific article URL.

❌ **Wrong**: `https://herald-zeitung.com`
❌ **Wrong**: `https://texastribune.org`
❌ **Wrong**: `https://co.comal.tx.us`

✅ **Correct**: `https://herald-zeitung.com/news/specific-article-title/article_123abc.html`
✅ **Correct**: `https://texastribune.org/2026/02/10/texas-politics-article/`
✅ **Correct**: `https://co.comal.tx.us/page/commissioners-court/meeting-minutes-02-10-26`

## External Article Archival Workflow

For ALL external articles (not source "Comal GOP Watch"):

1. **Find the specific article URL** - Never use homepage URLs
2. **Add the feed entry** with the specific `sourceUrl`
3. **Create archive backup** using the archive script:
   ```bash
   # Use the archival system to create local backup
   node scripts/archive-article.js \
     --url "https://specific-article-url.com/path" \
     --slug "descriptive-slug-matching-feed-id" \
     --source "Publication Name"
   ```
4. **Update feed entry** to include `archiveUrl` field pointing to the archive

Example feed entry with archive:
```json
{
  "id": "cn-001",
  "date": "2026-02-10T12:00:00",
  "title": "County Judge Seat Vacant After Passing of Sherman Krause",
  "summary": "...",
  "source": "Herald-Zeitung",
  "sourceUrl": "https://herald-zeitung.com/news/county-judge-sherman-krause-passes/article_abc123.html",
  "archiveUrl": "articles/archive/county-judge-seat-vacant.html",
  "category": "county-government",
  "tags": ["county-judge", "vacancy"]
}
```

## When to Create Original Articles

Create original articles using the `generate-article.js` script when:

- **Press releases and official announcements**: When the source is a press release, official government announcement, board minutes, chamber of commerce release, or association announcement (not journalism)
- **Social media only sources**: The story originates from Facebook community groups, Nextdoor, local social media discussions with no corresponding news article
- **Community discussion**: Local debates or conversations happening without formal news coverage
- **Direct observation**: Events, meetings, or situations observed but not covered by traditional media
- **Multiple fragmented sources**: When a story exists across multiple social posts, community discussions, or informal sources that need to be synthesized

### Press Release Rule

**If the source is a press release or official announcement (not journalism), create an original article:**

- Write an original journalistic article that reports on the press release content in a journalistic style (not just copy it)
- The article should include who/what/when/where/why and local context
- Always include a footnote/source section at the bottom linking to the original press release
- Feed card should link to OUR article, not the press release
- Source in feed entry should be "Comal GOP Watch"
- Include the original press release link in the `sources` parameter when generating the article

## Research Process

Before writing an original article, thoroughly research to gather:

1. **Business/Location Details**:
   - Exact business name and address
   - Historic district or neighborhood context
   - Business type and background

2. **Timeline**:
   - When the incident/discussion began
   - Key dates and developments
   - Current status

3. **Community Response**:
   - Representative quotes from community discussion
   - Range of perspectives (support, opposition, neutral)
   - Volume and nature of response

4. **Factual Context**:
   - Relevant local ordinances or policies
   - Similar incidents in the area
   - Background on the broader issue

## Article Creation Workflow

1. **Write the Article**: Draft journalistic content with:
   - Objective, factual tone
   - Clear headline and lead paragraph
   - Quotes from community discussion (anonymized if needed)
   - Balanced perspective showing multiple viewpoints
   - Local context and background

2. **Generate Article File**:
   ```bash
   node scripts/generate-article.js \
     --slug "descriptive-slug" \
     --title "Clear, Factual Headline" \
     --date "YYYY-MM-DD" \
     --body "<p>Article HTML content...</p>" \
     --tags "relevant,tags,for,filtering" \
     --sources "Facebook Community Group,Local Reports,Community Discussion"
   ```

3. **Create Feed Entry**: Add entry to the appropriate feed JSON file with:
   - `source`: "Comal GOP Watch" (not "Facebook" or "Social Media")
   - `sourceUrl`: The generated article path (e.g., `articles/article-slug.html`)
   - Appropriate category and tags

## Content Standards

### Article Body HTML Format:
- Use `<p>` tags for paragraphs
- Use `<blockquote>` for community quotes or social media excerpts
- Use `<h2>` and `<h3>` for section headings
- Keep HTML clean and semantic

### Tone and Style:
- **Factual and objective**: Present information without editorial commentary
- **Local focus**: Emphasize Comal County context and relevance
- **Balanced**: Include multiple perspectives when available
- **Respectful**: Avoid inflammatory language while reporting facts

### Source Attribution:
- Cite "Community Discussion" for general social media response
- Use "Local Reports" for information gathered from multiple informal sources
- Specific source names only when they are public and relevant

## Example Article Structure:

```html
<p>A retail establishment in Gruene Historic District has drawn community attention after displaying a pride flag, sparking discussion among local residents about businesses taking social positions.</p>

<p>The Gruene Historic Market, located at 1234 Hunter Road in the historic shopping district, began displaying the rainbow flag earlier this week, according to community reports.</p>

<blockquote>"I just think businesses should focus on serving customers, not making political statements," said one commenter on a local Facebook group discussing the display.</blockquote>

<p>The response has been mixed, with some residents expressing support for the business's right to display the flag, while others questioned whether such displays are appropriate in the historic district.</p>

<h2>Community Response</h2>

<p>The discussion has taken place primarily on social media platforms, with residents debating the role of businesses in social issues...</p>
```

## Quality Checklist

Before publishing an original article:

- [ ] All business names and addresses are accurate
- [ ] Timeline is clear and factual
- [ ] Multiple perspectives are represented
- [ ] Sources are appropriately attributed
- [ ] Local context is provided
- [ ] Article maintains objective tone
- [ ] Feed entry points to internal article with source "Comal GOP Watch"