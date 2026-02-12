# Content Pipeline Instructions for Original Articles

## When to Create Original Articles

Create original articles using the `generate-article.js` script when:

- **Social media only sources**: The story originates from Facebook community groups, Nextdoor, local social media discussions with no corresponding news article
- **Community discussion**: Local debates or conversations happening without formal news coverage
- **Direct observation**: Events, meetings, or situations observed but not covered by traditional media
- **Multiple fragmented sources**: When a story exists across multiple social posts, community discussions, or informal sources that need to be synthesized

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